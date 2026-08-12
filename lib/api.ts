/**
 * Server-side API client for the sales-agent backend on Render.
 *
 * SECURITY: every function here is server-only. `API_KEY` must never reach the
 * browser — the backend endpoints return customer PII (names, companies,
 * budgets, full conversation transcripts), so a key in client JavaScript would
 * make every lead publicly readable.
 *
 * Call these from Server Components or Route Handlers only. The `server-only`
 * import makes an accidental client import a build error rather than a silent
 * leak.
 */

import "server-only";

const API_BASE = process.env.SALES_AGENT_API_URL ?? "";
const API_KEY = process.env.SALES_AGENT_API_KEY ?? "";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE) {
    throw new ApiError("SALES_AGENT_API_URL is not configured", 500);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(API_KEY ? { "X-API-Key": API_KEY } : {}),
      ...(init?.headers ?? {}),
    },
    // The backend sleeps on Render's free tier; a cold start takes ~30s.
    signal: AbortSignal.timeout(45_000),
    // Lead data changes constantly — a cached dashboard is a misleading one.
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ApiError(
      `${path} failed: ${response.status} ${response.statusText}`,
      response.status,
    );
  }
  return response.json() as Promise<T>;
}

/** Read paths return an empty shape on failure so one dead endpoint does not
 * blank the whole dashboard. Errors are logged server-side. */
async function safe<T>(path: string, fallback: T): Promise<T> {
  try {
    return await request<T>(path);
  } catch (error) {
    console.error(`[api] ${path}`, error);
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Types — mirror the backend's pydantic models
// ---------------------------------------------------------------------------

export type LeadCategory = "hot" | "warm" | "cold" | "not_interested";

export interface Lead {
  conversation_id: string;
  customer_id: string | null;
  score: number;
  category: LeadCategory;
  intent: string | null;
  factors: Record<string, number>;
  confidence: number | null;
  scored_at: string;
  customer_name: string | null;
  company_name: string | null;
  location: string | null;
  channel: string;
  conversation_status: string | null;
  last_message_at: string | null;
}

export interface Handover {
  id: string;
  conversation_id: string;
  customer_id: string | null;
  reason: string;
  context: string | null;
  status: "pending" | "acknowledged" | "resolved";
  notified_at: string;
  resolved_at: string | null;
}

export interface Message {
  conversation_id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  created_at: string | null;
}

export interface ConversationSummary {
  conversation_id: string;
  customer_name: string | null;
  company_name: string | null;
  location: string | null;
  preferred_language: string | null;
  interested_machines: string[];
  requirements: string | null;
  budget: string | null;
  timeline: string | null;
  lead_score: number | null;
  lead_category: LeadCategory | null;
  customer_intent: string | null;
  summary: string | null;
  next_action: string | null;
  handover_status: string;
  ai_confidence: number | null;
}

export interface ConversationDetail {
  conversation_id: string;
  summary: ConversationSummary | null;
  messages: Message[];
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export function getLeads(params?: { limit?: number; category?: string }) {
  const query = new URLSearchParams();
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.category) query.set("category", params.category);
  const suffix = query.toString() ? `?${query}` : "";
  return safe<{ count: number; leads: Lead[] }>(`/api/leads${suffix}`, {
    count: 0,
    leads: [],
  });
}

export function getHandovers(status = "pending") {
  return safe<{ count: number; handovers: Handover[] }>(
    `/api/handovers?status=${status}`,
    { count: 0, handovers: [] },
  );
}

export function getConversation(conversationId: string) {
  return safe<ConversationDetail>(
    `/api/conversations/${encodeURIComponent(conversationId)}`,
    { conversation_id: conversationId, summary: null, messages: [] },
  );
}

export function getHealth() {
  return safe<{ status: string; service: string }>("/health", {
    status: "unreachable",
    service: "sales-agent",
  });
}

export interface Overview {
  totals: {
    conversations: number;
    leads: number;
    identified_customers: number;
    pending_handovers: number;
    opt_outs: number;
    average_score: number;
  };
  categories: Record<LeadCategory, number>;
  intents: { intent: string; count: number }[];
  machine_interest: { machine: string; count: number }[];
  funnel: { stage: string; count: number }[];
}

const EMPTY_OVERVIEW: Overview = {
  totals: {
    conversations: 0,
    leads: 0,
    identified_customers: 0,
    pending_handovers: 0,
    opt_outs: 0,
    average_score: 0,
  },
  categories: { hot: 0, warm: 0, cold: 0, not_interested: 0 },
  intents: [],
  machine_interest: [],
  funnel: [],
};

export function getOverview() {
  return safe<Overview>("/api/overview", EMPTY_OVERVIEW);
}

export interface Report {
  report_type: string;
  period_start: string;
  period_end: string;
  metrics: {
    leads: number;
    hot: number;
    warm: number;
    cold: number;
    not_interested: number;
    handovers: number;
    opt_outs: number;
    top_machines: { machine: string; count: number }[];
  };
}

export function getReport(type: "daily" | "weekly" | "monthly") {
  return safe<Report>(`/api/reports/${type}`, {
    report_type: type,
    period_start: "",
    period_end: "",
    metrics: {
      leads: 0,
      hot: 0,
      warm: 0,
      cold: 0,
      not_interested: 0,
      handovers: 0,
      opt_outs: 0,
      top_machines: [],
    },
  });
}

export interface Customer {
  id: string;
  channel: string;
  channel_user_id: string;
  name: string | null;
  company_name: string | null;
  location: string | null;
  preferred_language: string;
  phone: string | null;
  email: string | null;
  is_opted_out: boolean;
  created_at: string;
  updated_at: string;
}

export function getCustomers(limit = 200) {
  return safe<{ count: number; customers: Customer[] }>(
    `/api/customers?limit=${limit}`,
    { count: 0, customers: [] },
  );
}

export interface OptOut {
  id: string;
  channel: string;
  channel_user_id: string;
  conversation_id: string | null;
  reason: string | null;
  opted_out_at: string;
}

export function getOptOuts(limit = 200) {
  return safe<{ count: number; opt_outs: OptOut[] }>(
    `/api/opt-outs?limit=${limit}`,
    { count: 0, opt_outs: [] },
  );
}

export function getSummaries(limit = 200) {
  return safe<{ count: number; summaries: ConversationSummary[] }>(
    `/api/summaries?limit=${limit}`,
    { count: 0, summaries: [] },
  );
}

export interface AiLog {
  id: number;
  conversation_id: string;
  event_type: string;
  model: string | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  latency_ms: number | null;
  retrieved_chunks: unknown;
  payload: unknown;
  created_at: string;
}

export function getAiLogs(params?: {
  conversationId?: string;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params?.conversationId)
    query.set("conversation_id", params.conversationId);
  query.set("limit", String(params?.limit ?? 100));
  return safe<{ count: number; logs: AiLog[] }>(`/api/logs?${query}`, {
    count: 0,
    logs: [],
  });
}

export interface Machine {
  id: string;
  machine_code: string;
  name: string;
  category: string;
  description: string | null;
  price_range: string | null;
  lead_time: string | null;
  is_active: boolean;
  created_at: string;
}

export function getMachines() {
  return safe<{ count: number; machines: Machine[] }>("/api/machines", {
    count: 0,
    machines: [],
  });
}

export interface MachineDocument {
  id: string;
  machine_id: string | null;
  doc_type: string;
  title: string | null;
  indexed_at: string | null;
  created_at: string;
}

export function getMachineDocuments() {
  return safe<{ count: number; documents: MachineDocument[] }>(
    "/api/machines/documents",
    { count: 0, documents: [] },
  );
}

// ---------------------------------------------------------------------------
// Mutations — called from Server Actions, never the browser
// ---------------------------------------------------------------------------

export async function patchHandover(id: string, status: string) {
  return request<{ id: string; status: string }>(
    `/api/handovers/${encodeURIComponent(id)}?status=${status}`,
    { method: "PATCH" },
  );
}

export async function uploadMachineDocument(form: FormData) {
  // FormData is forwarded as-is; fetch sets the multipart boundary itself, so
  // no Content-Type header here.
  return request<{
    machine_id: string;
    name: string;
    characters_extracted?: number;
    chunks: number;
    embedded: number;
    codes?: string[];
    error?: string;
  }>("/api/machines/upload", { method: "POST", body: form });
}

export async function addMachineFromText(form: FormData) {
  return request<{
    machine_id: string;
    name: string;
    chunks: number;
    embedded: number;
  }>("/api/machines/text", { method: "POST", body: form });
}

export async function deleteMachine(id: string) {
  return request<{ id: string; deleted: boolean }>(
    `/api/machines/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}

/** The kanban drag action. Appends a new lead_scores row on the backend
 * rather than editing one in place — see app/main.py's override_lead_category
 * for why: scoring stays append-only, so a manual move is a correction, not a
 * permanent lock, and the next AI re-score still runs normally. */
export async function overrideLeadCategory(
  conversationId: string,
  category: LeadCategory,
) {
  return request<{ conversation_id: string; category: string; score: number }>(
    `/api/leads/${encodeURIComponent(conversationId)}?category=${category}`,
    { method: "PATCH" },
  );
}

export async function updateCustomer(
  customerId: string,
  fields: Partial<{
    name: string;
    company_name: string;
    location: string;
    phone: string;
    email: string;
  }>,
) {
  return request<{ id: string }>(
    `/api/customers/${encodeURIComponent(customerId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    },
  );
}
