import type { InboxConversation } from "@/lib/telegram-adapter";
import { CATEGORY_LABELS, timeAgo } from "@/lib/format";
import {
  ConversationListRow,
  ConversationListShell,
} from "@/components/conversations/conversation-list";

export function TelegramConversationList({ conversations, activeId, query }: {
  conversations: InboxConversation[]; activeId?: string; query?: string;
}) {
  return (
    <ConversationListShell
      channel="telegram" activeId={activeId} title="Telegram"
      subtitle={`${conversations.length} conversation${conversations.length === 1 ? "" : "s"}`}
      status={<span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-2 py-1 text-[11px] font-medium text-sky-700 ring-1 ring-inset ring-sky-500/20 dark:text-sky-300"><span className="h-1.5 w-1.5 rounded-full bg-sky-500" /> Live</span>}
      searchAction="/conversations/telegram" searchId="telegram-search"
      searchPlaceholder="Search name or message" query={query}
      emptyTitle={query ? "No matching conversations" : "No Telegram conversations"}
      emptyHint={query ? "Try a customer name, company, ID, or message keyword." : "New customer chats will appear here."}
    >
      {conversations.length > 0 ? conversations.map((conversation) => (
        <ConversationListRow
          key={conversation.id} channel="telegram"
          href={`/conversations/telegram/${encodeURIComponent(conversation.id)}`}
          conversationId={conversation.id}
          active={conversation.id === activeId} name={conversation.contact.name}
          timestamp={timeAgo(conversation.lastActivityAt)} preview={conversation.lastMessage}
          previewPrefix={conversation.lastMessageRole === "assistant" ? <span className="text-sky-600 dark:text-sky-400">You: </span> : undefined}
          badges={<>
            {conversation.leadCategory && <span className="rounded-full bg-border/80 px-1.5 py-0.5 text-[10px] font-medium text-muted">{CATEGORY_LABELS[conversation.leadCategory]}{conversation.score !== null ? ` · ${conversation.score}` : ""}</span>}
            {conversation.handoverStatus !== "none" && <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300">Handover</span>}
          </>}
        />
      )) : undefined}
    </ConversationListShell>
  );
}
