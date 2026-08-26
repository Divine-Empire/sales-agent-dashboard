import type { ChannelConversation } from "@/lib/channel-types";
import { timeAgo } from "@/lib/format";
import {
  ConversationListRow,
  ConversationListShell,
} from "@/components/conversations/conversation-list";

/**
 * Filters mirror what the portal can actually answer server-side: it tracks
 * unread counts, not lead temperature. "Unread" is therefore the real
 * actionable cut — a customer has written and nobody has opened it.
 */
const VIEWS = [
  { value: "all", label: "All" },
  { value: "unseen", label: "Unread" },
  { value: "seen", label: "Opened" },
] as const;

export function WhatsAppConversationList({
  conversations,
  activeId,
  query,
  view,
  total,
}: {
  conversations: ChannelConversation[];
  activeId?: string;
  query?: string;
  view: string;
  total: number;
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
      channel="whatsapp"
      activeId={activeId}
      title="WhatsApp"
      subtitle={`${total} ${total === 1 ? "conversation" : "conversations"}`}
      status={
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-500/20 dark:text-emerald-300">
          <span
            className="h-1.5 w-1.5 rounded-full bg-emerald-500"
            aria-hidden="true"
          />
          Live
        </span>
      }
      searchAction="/conversations/whatsapp"
      searchId="whatsapp-search"
      searchPlaceholder="Search name, number or message"
      query={query}
      hiddenFields={{ view }}
      filters={filters}
      activeFilter={view}
      emptyTitle={query ? "No conversations match" : "No conversations yet"}
      emptyHint={
        query
          ? "Try a different name, number or phrase."
          : "Replies to your WhatsApp campaigns appear here."
      }
    >
      {conversations.length > 0
        ? conversations.map((conversation) => (
            <ConversationListRow
              key={conversation.id}
              channel="whatsapp"
              href={`/conversations/whatsapp/${conversation.id}`}
              active={conversation.id === activeId}
              name={conversation.contact.name}
              timestamp={timeAgo(conversation.lastActivityAt)}
              preview={conversation.lastMessage}
              badges={
                conversation.attentionState === "urgent" ? (
                  <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                    Unread
                  </span>
                ) : undefined
              }
            />
          ))
        : undefined}
    </ConversationListShell>
  );
}
