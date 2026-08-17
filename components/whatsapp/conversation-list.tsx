import type { ChannelConversation } from "@/lib/channel-types";
import { CATEGORY_LABELS, timeAgo } from "@/lib/format";
import {
  ConversationListRow,
  ConversationListShell,
} from "@/components/conversations/conversation-list";

const VIEWS = [
  { value: "all", label: "All" },
  { value: "interested", label: "Interested" },
  { value: "attention", label: "Attention" },
] as const;

export function WhatsAppConversationList({ conversations, activeId, query, view }: {
  conversations: ChannelConversation[]; activeId?: string; query?: string; view: string;
}) {
  const filters = VIEWS.map((item) => {
    const params = new URLSearchParams();
    if (item.value !== "all") params.set("view", item.value);
    if (query) params.set("q", query);
    const suffix = params.toString();
    return { ...item, href: `/conversations/whatsapp${suffix ? `?${suffix}` : ""}` };
  });
  return (
    <ConversationListShell
      channel="whatsapp" activeId={activeId} title="WhatsApp"
      subtitle="Fictional preview workspace"
      status={<span className="rounded-full bg-amber-500/10 px-2 py-1 text-[11px] font-medium text-amber-700 ring-1 ring-inset ring-amber-500/20 dark:text-amber-300">Preview</span>}
      searchAction="/conversations/whatsapp" searchId="whatsapp-search"
      searchPlaceholder="Search fictional records" query={query}
      hiddenFields={{ view }} filters={filters} activeFilter={view}
      emptyTitle="No preview records match" emptyHint="Change the search or fixture filter."
    >
      {conversations.length > 0 ? conversations.map((conversation) => (
        <ConversationListRow
          key={conversation.id} channel="whatsapp"
          href={`/conversations/whatsapp/${conversation.id}`}
          active={conversation.id === activeId} name={conversation.contact.name}
          timestamp={timeAgo(conversation.lastActivityAt)} preview={conversation.lastMessage}
          badges={<>
            {conversation.leadCategory && <span className="rounded-full bg-border/80 px-1.5 py-0.5 text-[10px] font-medium text-muted">{CATEGORY_LABELS[conversation.leadCategory]}</span>}
            {conversation.attentionState && conversation.attentionState !== "none" && <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300">{conversation.attentionState === "urgent" ? "Delivery issue" : "Attention"}</span>}
          </>}
        />
      )) : undefined}
    </ConversationListShell>
  );
}
