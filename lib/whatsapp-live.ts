import "server-only";

import type {
  ChannelConversation,
  ChannelMessage,
  MessageKind,
  MessageStatus,
} from "./channel-types";
import type { WhatsAppConversationItem, WhatsAppMessageItem } from "./api";

/**
 * Maps real whatsapp-portal records onto the shared channel contract, so the
 * WhatsApp workspace renders through the same components as Telegram instead
 * of a parallel implementation.
 *
 * Server-only: these shapes arrive from `lib/api.ts`, which is itself
 * server-only. Keeping the mapping here means no portal field names leak into
 * client components.
 */

/** Portal `status` -> the timeline's tick states. */
function toStatus(raw: string | null): MessageStatus | undefined {
  switch (raw) {
    case "read":
      return "read";
    case "delivered":
      return "delivered";
    case "sent":
      return "sent";
    case "failed":
      return "failed";
    case "queued":
    case "accepted":
      return "queued";
    default:
      return undefined;
  }
}

/**
 * Portal `message_type` -> timeline rendering kind.
 *
 * Meta sends types we have no bubble for (`sticker`, `location`, `contacts`,
 * `unsupported`). They fall back to "text", where the portal's own
 * placeholder content (e.g. "[unsupported]") is what the operator reads —
 * accurate, and better than inventing a shape we cannot render.
 */
function toKind(raw: string): MessageKind {
  switch (raw) {
    case "image":
      return "image";
    case "video":
    case "document":
      return "document";
    case "audio":
      return "audio";
    case "template":
      return "template";
    case "interactive":
    case "button":
      return "interactive";
    default:
      return "text";
  }
}

/**
 * A phone number with no saved name: the portal stores the number as the name
 * in that case, so showing both would read "918130339430 · 918130339430".
 */
function isBareNumber(name: string, phone: string): boolean {
  const digits = (value: string) => value.replace(/\D/g, "");
  return digits(name) === digits(phone) && digits(name).length > 0;
}

/**
 * WhatsApp profile names are free text and real ones contain newlines — e.g.
 * "Er sanjeet kumar\nनिर्माण नक्शा घर\nSaharsa" is a live contact. Left as-is
 * they break a single-line list row, so collapse whitespace to one line.
 */
function oneLine(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function toChannelConversation(
  item: WhatsAppConversationItem,
): ChannelConversation {
  const phone = item.contact.phone_number;
  const rawName = oneLine(item.contact.name ?? "");
  const named = rawName && !isBareNumber(rawName, phone);
  return {
    id: item.id,
    channel: "whatsapp",
    contact: {
      name: named ? rawName : phone || "Unknown",
      externalId: phone,
      phone,
    },
    lastMessage: oneLine(item.last_message || ""),
    lastActivityAt: item.last_message_at ?? new Date(0).toISOString(),
    // The portal tracks unread, not handover/urgency — so "attention" here
    // means "someone has messaged and nobody has opened it", which is the
    // actionable signal this data can honestly support.
    attentionState: item.unread_count > 0 ? "urgent" : "none",
  };
}

export function toChannelMessages(
  conversationId: string,
  items: WhatsAppMessageItem[],
): ChannelMessage[] {
  return items.map((m) => {
    const failed = m.status === "failed";
    return {
      id: m.id,
      conversationId,
      // Outbound covers both the AI's replies and anything an operator sent
      // from the portal. The portal does not record which, so the timeline
      // shows one "business" side rather than guessing at authorship.
      direction: m.direction === "inbound" ? "customer" : "agent",
      kind: toKind(m.message_type),
      text: m.content || undefined,
      createdAt: m.created_at,
      status: toStatus(m.status),
      template: m.template_name
        ? { name: m.template_name, language: "", variables: [] }
        : undefined,
      media: m.media_url
        ? {
            name: m.file_name || m.mime_type || "Attachment",
            mimeType: m.mime_type || "application/octet-stream",
          }
        : undefined,
      actions: m.interactive_title ? [m.interactive_title] : undefined,
      error: failed
        ? m.error_message || m.error_code || "Delivery failed"
        : undefined,
    } satisfies ChannelMessage;
  });
}
