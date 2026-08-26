import { notFound } from "next/navigation";
import { ConversationHeader } from "@/components/conversations/conversation-header";
import { WhatsAppConversationList } from "@/components/whatsapp/conversation-list";
import { WhatsAppMessageTimeline } from "@/components/whatsapp/message-timeline";
import { WhatsAppThreadContext } from "@/components/whatsapp/thread-context";
import { getWhatsAppConversation, getWhatsAppConversations, isNotFoundError } from "@/lib/api";
import { toChannelConversation, toChannelMessages } from "@/lib/whatsapp-live";

export const dynamic = "force-dynamic";

export default async function WhatsAppPage({
  params,
  searchParams,
}: {
  params: Promise<{ id?: string[] }>;
  searchParams: Promise<{ q?: string; view?: string }>;
}) {
  const [{ id }, { q, view = "all" }] = await Promise.all([params, searchParams]);
  const activeId = id?.[0];

  const listPromise = getWhatsAppConversations({ limit: 40, filter: view, q });

  // getWhatsAppConversation throws NotFoundError only when the backend
  // positively answered "no such thread". Any other failure returns an
  // unavailable state instead, so an outage never masquerades as a deleted
  // conversation.
  let thread: Awaited<ReturnType<typeof getWhatsAppConversation>> | null = null;
  if (activeId) {
    try {
      thread = await getWhatsAppConversation(activeId);
    } catch (error) {
      if (isNotFoundError(error)) notFound();
      throw error;
    }
  }
  const list = await listPromise;

  const conversations = list.conversations.map(toChannelConversation);
  const messages =
    thread?.conversation ? toChannelMessages(thread.conversation.id, thread.messages) : [];

  // Three distinct failures, three distinct messages — the dashboard could not
  // reach the backend, the backend could not reach the portal, or there is
  // genuinely nothing here yet.
  const backendDown = list._dataState.status === "unavailable";
  const portalDown = !backendDown && !list.available;

  return (
    <div className="space-y-3">
      {(backendDown || portalDown) && (
        <div
          role="status"
          className="flex items-start gap-2 border-l-2 border-amber-500 bg-amber-500/6 px-3 py-2 text-xs text-amber-900 dark:text-amber-200"
        >
          <svg
            viewBox="0 0 24 24"
            className="mt-px h-3.5 w-3.5 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            aria-hidden="true"
          >
            <path d="M12 3 2.5 20h19L12 3Z" />
            <path d="M12 9v5m0 3v.01" />
          </svg>
          <span>
            <strong className="font-semibold">
              {backendDown ? "Sales agent unreachable." : "WhatsApp portal unreachable."}
            </strong>{" "}
            {backendDown
              ? (list._dataState.message ?? "Conversations could not be loaded.")
              : "Conversations could not be loaded from the portal. Existing replies are unaffected."}
          </span>
        </div>
      )}

      <div className="flex h-[calc(100svh-11.25rem)] min-h-[32rem] overflow-hidden rounded-xl border border-border bg-background shadow-sm">
        <WhatsAppConversationList
          conversations={conversations}
          activeId={activeId}
          query={q}
          view={view}
          total={list.count}
        />

        {!thread?.conversation ? (
          <section className="hidden min-w-0 flex-1 place-items-center md:grid">
            <div className="max-w-sm px-8 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                <svg
                  viewBox="0 0 24 24"
                  className="h-7 w-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.7}
                  aria-hidden="true"
                >
                  <path d="M20 11.5a8 8 0 0 1-11.8 7L3 20l1.5-5.1A8 8 0 1 1 20 11.5Z" />
                  <path d="M8.5 8.5c.7 2.5 2.5 4.3 5 5" />
                </svg>
              </span>
              <h2 className="mt-4 text-base font-semibold">
                {conversations.length > 0 ? "Open a conversation" : "Nothing here yet"}
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                {conversations.length > 0
                  ? "Pick a contact to read the full thread, with delivery status for every message."
                  : "When someone replies to a WhatsApp campaign, the conversation appears here."}
              </p>
            </div>
          </section>
        ) : (
          <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <ConversationHeader
              channel="whatsapp"
              backHref="/conversations/whatsapp"
              // Profile names are free text and really do contain newlines.
              name={(thread.conversation.contact.name || "Unknown").replace(/\s+/g, " ").trim()}
              subtitle={thread.conversation.contact.phone_number}
            />

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto xl:flex-row xl:overflow-hidden">
              <div className="flex min-h-[27rem] min-w-0 flex-1 flex-col xl:min-h-0">
                <WhatsAppMessageTimeline messages={messages} />
                <div className="shrink-0 border-t border-border bg-surface/45 px-4 py-3">
                  <p className="mx-auto flex max-w-[46rem] items-center gap-2 text-xs text-muted">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.7}
                      aria-hidden="true"
                    >
                      <path d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2Z" />
                      <path d="M8 11V7a4 4 0 1 1 8 0v4" />
                    </svg>
                    <span>
                      Read-only here. The AI answers new messages automatically —
                      reply from the WhatsApp portal if you need to step in.
                    </span>
                  </p>
                </div>
              </div>

              <WhatsAppThreadContext
                messages={thread.messages}
                phone={thread.conversation.contact.phone_number}
                lastActivityAt={thread.conversation.last_message_at}
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
