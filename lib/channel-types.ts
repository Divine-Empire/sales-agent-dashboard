import type { LeadCategory } from "./api";

export type Channel = "telegram" | "whatsapp";
export type MessageDirection = "customer" | "agent" | "operator" | "system";
export type MessageKind =
  | "text"
  | "image"
  | "document"
  | "audio"
  | "event"
  | "template"
  | "interactive";
export type MessageStatus =
  | "queued"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

export interface ChannelContact {
  name: string;
  company?: string;
  externalId: string;
  phone?: string;
  location?: string;
}

export interface ChannelConversation {
  id: string;
  channel: Channel;
  contact: ChannelContact;
  lastMessage: string;
  lastActivityAt: string;
  attentionState?: "none" | "handover" | "urgent";
  leadCategory?: LeadCategory;
  classification?: "interested" | "not_interested" | "new";
  campaign?: string;
}

export interface ChannelMessageReference {
  id: string;
  text: string;
  sender: string;
}

export interface ChannelMessage {
  id: string;
  conversationId: string;
  direction: MessageDirection;
  kind: MessageKind;
  text?: string;
  createdAt: string;
  status?: MessageStatus;
  replyTo?: ChannelMessageReference;
  media?: {
    name: string;
    mimeType: string;
    caption?: string;
  };
  template?: {
    name: string;
    language: string;
    variables: string[];
  };
  actions?: string[];
  error?: string;
}

export interface ChannelThread {
  conversation: ChannelConversation;
  messages: ChannelMessage[];
  summary: string;
  nextAction: string;
  products: string[];
  requirements?: string;
  budget?: string;
  timeline?: string;
  source: string;
  fictional: true;
}
