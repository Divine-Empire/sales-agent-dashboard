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

export interface DataState {
  status: "ready" | "unavailable";
  fetchedAt: string;
  message?: string;
}

export type ApiData<T extends object> = T & { _dataState: DataState };

// The backend sleeps on Render's free tier; a cold start takes ~30s — 45s
// covers that for ordinary reads/writes. Document upload is a real
// exception: structure_product_profile can run several sequential LLM
// calls for one upload (the structuring call, a missed-variant retry, and
// one enrichment call per detected variant) — a real two-variant document
// was measured taking ~54s end to end, past the 45s default, which made
// the dashboard report "Upload failed" for an upload the backend actually
// completed successfully a few seconds later. Callers that know their
// request is upload-shaped pass a longer budget explicitly.
const DEFAULT_TIMEOUT_MS = 45_000;
const UPLOAD_TIMEOUT_MS = 120_000;

async function request<T>(
  path: string,
  init?: RequestInit,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  if (!API_BASE) {
    throw new ApiError("SALES_AGENT_API_URL is not configured", 500);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(API_KEY ? { "X-API-Key": API_KEY } : {}),
      ...(init?.headers ?? {}),
    },
    signal: AbortSignal.timeout(timeoutMs),
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
async function safe<T extends object>(
  path: string,
  fallback: T,
): Promise<ApiData<T>> {
  try {
    const data = await request<T>(path);
    return {
      ...data,
      _dataState: { status: "ready", fetchedAt: new Date().toISOString() },
    };
  } catch (error) {
    console.error(`[api] ${path}`, error);
    return {
      ...fallback,
      _dataState: {
        status: "unavailable",
        fetchedAt: new Date().toISOString(),
        message:
          error instanceof ApiError && error.status === 500
            ? "The sales-agent connection is not configured."
            : "Live data could not be loaded from the sales agent.",
      },
    };
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

export interface ConversationListItem {
  conversation_id: string;
  channel: string;
  status: string;
  started_at: string | null;
  last_message_at: string | null;
  customer_name: string | null;
  company_name: string | null;
  channel_user_id: string | null;
  phone: string | null;
  last_message: string | null;
  last_message_role: Message["role"] | null;
  lead_score: number | null;
  lead_category: LeadCategory | null;
  handover_status: string;
  customer_intent: string | null;
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

export function getConversations(params?: {
  limit?: number;
  channel?: string;
}) {
  const query = new URLSearchParams();
  query.set("limit", String(params?.limit ?? 50));
  if (params?.channel) query.set("channel", params.channel);
  return safe<{ count: number; conversations: ConversationListItem[] }>(
    `/api/conversations?${query}`,
    { count: 0, conversations: [] },
  );
}

// ---------------------------------------------------------------------------
// WhatsApp — real conversations, proxied by the sales-agent backend from the
// whatsapp-portal. This project never reads the portal's database or holds its
// credentials; it calls the same backend, with the same key, as everything
// else here.
//
// `available: false` means the backend reached us but could not reach the
// portal. That is different from `_dataState.status === "unavailable"` (this
// dashboard could not reach the backend at all), and different again from a
// genuinely empty inbox. The UI distinguishes all three.
// ---------------------------------------------------------------------------

export interface WhatsAppContact {
  id: string | null;
  name: string;
  phone_number: string;
}

export interface WhatsAppConversationItem {
  id: string;
  contact: WhatsAppContact;
  last_message: string;
  last_message_at: string | null;
  unread_count: number;
}

export interface WhatsAppMessageItem {
  id: string;
  wa_message_id: string | null;
  direction: "inbound" | "outbound";
  content: string;
  message_type: string;
  status: string | null;
  created_at: string;
  delivered_at: string | null;
  seen_at: string | null;
  template_name: string | null;
  interactive_title: string | null;
  media_url: string | null;
  mime_type: string | null;
  file_name: string | null;
  interest_status: string | null;
  source: string | null;
  error_code: string | null;
  error_message: string | null;
}

export function getWhatsAppConversations(params?: {
  limit?: number;
  cursor?: string;
  filter?: string;
  q?: string;
}) {
  const query = new URLSearchParams();
  query.set("limit", String(params?.limit ?? 30));
  if (params?.cursor) query.set("cursor", params.cursor);
  if (params?.filter && params.filter !== "all") query.set("filter", params.filter);
  if (params?.q) query.set("q", params.q);
  return safe<{
    count: number;
    conversations: WhatsAppConversationItem[];
    has_more: boolean;
    next_cursor: string | null;
    available: boolean;
  }>(`/api/whatsapp/conversations?${query}`, {
    count: 0,
    conversations: [],
    has_more: false,
    next_cursor: null,
    available: false,
  });
}

/** Thrown when the backend says the thread does not exist, so the page can
 * render a 404 rather than an "unavailable" state. This bypasses `safe()`,
 * which flattens every failure into a fallback and would otherwise make a
 * real 404 indistinguishable from the portal being down.
 *
 * Identified by a literal flag, not `instanceof`: the production build
 * minifies class names per chunk, so a class thrown in one chunk fails an
 * `instanceof` check against the same class imported into another. That bug
 * only appears in `next build`, never in dev or typecheck. */
export class NotFoundError extends Error {
  readonly isNotFound = true as const;
}

/** Use this rather than `instanceof NotFoundError` — see the note above. */
export function isNotFoundError(error: unknown): error is NotFoundError {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { isNotFound?: unknown }).isNotFound === true
  );
}

export interface WhatsAppThreadResponse {
  conversation: {
    id: string;
    last_message_at: string | null;
    unread_count: number;
    contact: WhatsAppContact;
  } | null;
  count: number;
  messages: WhatsAppMessageItem[];
  available: boolean;
}

export async function getWhatsAppConversation(
  id: string,
  limit = 150,
): Promise<ApiData<WhatsAppThreadResponse>> {
  const path = `/api/whatsapp/conversations/${encodeURIComponent(id)}?limit=${limit}`;
  try {
    const data = await request<WhatsAppThreadResponse>(path);
    return {
      ...data,
      _dataState: { status: "ready", fetchedAt: new Date().toISOString() },
    };
  } catch (error) {
    // A 404 is a real answer ("no such thread"), not a failure to answer —
    // it must reach the page so it can render notFound() rather than an
    // "unavailable" banner over an empty pane.
    if (error instanceof ApiError && error.status === 404) {
      throw new NotFoundError(`WhatsApp conversation ${id} not found`);
    }
    console.error(`[api] ${path}`, error);
    return {
      conversation: null,
      count: 0,
      messages: [],
      available: false,
      _dataState: {
        status: "unavailable",
        fetchedAt: new Date().toISOString(),
        message: "This conversation could not be loaded from the sales agent.",
      },
    };
  }
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
  // Bumped on every field update AND on a document re-upload (upsert_machine
  // runs either way) — the catalog table shows this instead of created_at
  // when they differ, since "Added" read as stale after a re-upload: the
  // row's created_at never moves, so a brochure re-uploaded weeks after the
  // machine was first added looked untouched even though its content (and
  // this timestamp) had just changed.
  updated_at: string;
}

export function getMachines() {
  return safe<{ count: number; machines: Machine[] }>("/api/machines", {
    count: 0,
    machines: [],
  });
}

export interface Accessory {
  id: string;
  machine_id: string;
  name: string;
  category: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export function getAccessories(params?: { machineId?: string }) {
  const query = params?.machineId
    ? `?machine_id=${encodeURIComponent(params.machineId)}`
    : "";
  return safe<{ count: number; accessories: Accessory[] }>(
    `/api/accessories${query}`,
    { count: 0, accessories: [] },
  );
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

export interface MachineDocumentDetail extends MachineDocument {
  content: string;
}

export function getMachineDocument(documentId: string) {
  // Full content — list_machine_documents deliberately omits it, since the
  // list view never needed it; the edit view does.
  return safe<MachineDocumentDetail>(
    `/api/machines/documents/${encodeURIComponent(documentId)}`,
    {
      id: documentId,
      machine_id: null,
      doc_type: "",
      title: null,
      indexed_at: null,
      created_at: "",
      content: "",
    },
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
    // A single upload can produce more than one machine when the document
    // describes several distinct models (a "series" brochure) —
    // structure_product_profile detects that and add_machine_from_document
    // creates one machines row per variant. variants_detected is 1 for the
    // ordinary single-model case; variants lists each created machine's own
    // id/name/machine_code when there's more than one.
    variants_detected?: number;
    variants?: { machine_id: string; name: string; machine_code: string }[];
    // 0 when structure_product_profile failed entirely (LLM unavailable —
    // e.g. an OpenAI quota/billing outage — or a malformed response) and
    // add_machine_from_document fell back to storing the raw extracted
    // text unchanged. The upload still succeeds (embedded > 0, the agent
    // can still answer from the raw text), but the content has none of the
    // rich profile structure (Features/Benefits/Objections/etc.) a
    // successful structuring call would have produced. Found live: two
    // real uploads succeeded silently in this state during an OpenAI
    // credit-exhaustion window, with no signal anywhere that the content
    // was any different from a normally-structured document.
    profile_sections_filled?: number;
  }>(
    "/api/machines/upload",
    { method: "POST", body: form },
    UPLOAD_TIMEOUT_MS,
  );
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

export async function updateMachine(
  machineId: string,
  fields: Partial<{
    name: string;
    category: string;
    description: string;
    price_range: string;
    lead_time: string;
    is_active: boolean;
  }>,
) {
  return request<{ id: string }>(`/api/machines/${encodeURIComponent(machineId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  });
}

export async function updateMachineDocumentContent(documentId: string, content: string) {
  // Re-ingests into Qdrant on the backend immediately — a correction to an
  // AI-structured product profile (or any document content) takes effect
  // right away, not just on the next re-upload.
  return request<{ id: string; reingested: boolean }>(
    `/api/machines/documents/${encodeURIComponent(documentId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    },
  );
}

export async function createAccessory(fields: {
  machine_id: string;
  name: string;
  category?: string;
  description?: string;
}) {
  return request<{ id: string; name: string; chunks: number; embedded: number }>(
    "/api/accessories",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    },
  );
}

export async function updateAccessory(
  accessoryId: string,
  fields: Partial<{
    name: string;
    category: string;
    description: string;
    is_active: boolean;
  }>,
) {
  return request<{ id: string }>(
    `/api/accessories/${encodeURIComponent(accessoryId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    },
  );
}

export async function deleteAccessory(id: string) {
  return request<{ id: string; deleted: boolean }>(
    `/api/accessories/${encodeURIComponent(id)}`,
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
