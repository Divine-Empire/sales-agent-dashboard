import type {
  ConversationDetail,
  ConversationListItem,
  ConversationSummary,
  DataState,
  Message,
} from "./api";
import type { ChannelConversation } from "./channel-types";

export interface InboxConversation extends ChannelConversation {
  channel: "telegram";
  lastMessageRole: Message["role"] | null;
  score: number | null;
  handoverStatus: string;
  intent: string | null;
}

export interface TelegramThread {
  id: string;
  messages: Message[];
  summary: ConversationSummary | null;
  dataState: DataState;
}

function externalId(row: ConversationListItem): string {
  if (row.channel_user_id) return row.channel_user_id;
  const separator = row.conversation_id.indexOf(":");
  return separator === -1
    ? row.conversation_id
    : row.conversation_id.slice(separator + 1);
}

export function adaptTelegramConversation(
  row: ConversationListItem,
): InboxConversation {
  return {
    id: row.conversation_id,
    channel: "telegram",
    contact: {
      name: row.customer_name?.trim() || "Unidentified customer",
      company: row.company_name ?? undefined,
      externalId: externalId(row),
      phone: row.phone ?? undefined,
    },
    lastMessage: row.last_message?.trim() || "No messages yet",
    lastActivityAt: row.last_message_at ?? row.started_at ?? "",
    leadCategory: row.lead_category ?? undefined,
    attentionState:
      row.handover_status !== "none" ? "handover" : "none",
    lastMessageRole: row.last_message_role,
    score: row.lead_score,
    handoverStatus: row.handover_status,
    intent: row.customer_intent,
  };
}

export function adaptTelegramThread(
  detail: ConversationDetail & { _dataState: DataState },
): TelegramThread {
  return {
    id: detail.conversation_id,
    messages: detail.messages,
    summary: detail.summary,
    dataState: detail._dataState,
  };
}
