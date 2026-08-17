import type {
  ChannelConversation,
  ChannelMessage,
  ChannelThread,
} from "./channel-types";
import { WHATSAPP_FIXTURES } from "./whatsapp-fixtures";

export function getWhatsAppPreviewThreads(): ChannelThread[] {
  return WHATSAPP_FIXTURES.map((fixture) => ({
    conversation: {
      id: fixture.id,
      channel: "whatsapp",
      contact: { ...fixture.contact },
      lastMessage: fixture.lastMessage,
      lastActivityAt: fixture.lastActivityAt,
      attentionState: fixture.attentionState,
      leadCategory: fixture.leadCategory,
      classification: fixture.classification,
      campaign: fixture.campaign,
    } satisfies ChannelConversation,
    messages: fixture.messages.map((message): ChannelMessage => {
      const source = message as unknown as ChannelMessage;
      return {
        ...source,
        conversationId: fixture.id,
        template: source.template
          ? {
              ...source.template,
              variables: [...source.template.variables],
            }
          : undefined,
        actions: source.actions ? [...source.actions] : undefined,
      };
    }),
    summary: fixture.summary,
    nextAction: fixture.nextAction,
    products: [...fixture.products],
    requirements: "requirements" in fixture ? fixture.requirements : undefined,
    budget: "budget" in fixture ? fixture.budget : undefined,
    timeline: "timeline" in fixture ? fixture.timeline : undefined,
    source: fixture.source,
    fictional: true,
  }));
}

export function getWhatsAppPreviewThread(id: string): ChannelThread | null {
  return getWhatsAppPreviewThreads().find((thread) => thread.conversation.id === id) ?? null;
}
