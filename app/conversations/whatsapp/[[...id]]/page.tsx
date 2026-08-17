import { notFound } from "next/navigation";
import { ConversationHeader } from "@/components/conversations/conversation-header";
import { WhatsAppConversationList } from "@/components/whatsapp/conversation-list";
import { WhatsAppCrmInspector } from "@/components/whatsapp/crm-inspector";
import { WhatsAppMessageTimeline } from "@/components/whatsapp/message-timeline";
import {
  getWhatsAppPreviewThread,
  getWhatsAppPreviewThreads,
} from "@/lib/whatsapp-adapter";

export const dynamic = "force-dynamic";

export default async function WhatsAppPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id?: string[] }>;
  searchParams: Promise<{ q?: string; view?: string }>;
}) {
  const [{ id }, { q, view = "all" }] = await Promise.all([params, searchParams]);
  const activeId = id?.[0];
  const activeThread = activeId ? getWhatsAppPreviewThread(activeId) : null;
  if (activeId && !activeThread) notFound();

  const allThreads = getWhatsAppPreviewThreads();
  const query = q?.trim().toLocaleLowerCase();
  const conversations = allThreads
    .map((thread) => thread.conversation)
    .filter((conversation) => {
      if (
        view === "interested" &&
        conversation.classification !== "interested"
      ) {
        return false;
      }
      if (
        view === "attention" &&
        (!conversation.attentionState || conversation.attentionState === "none")
      ) {
        return false;
      }
      if (!query) return true;
      return [
        conversation.contact.name,
        conversation.contact.company,
        conversation.contact.phone,
        conversation.lastMessage,
        conversation.campaign,
      ].some((value) => value?.toLocaleLowerCase().includes(query));
    });

  return (
    <div className="space-y-3">
      <div
        role="status"
        className="flex items-center gap-2 border-l-2 border-amber-500 bg-amber-500/6 px-3 py-2 text-xs text-amber-900 dark:text-amber-200"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <path d="M12 3 2.5 20h19L12 3Z" />
          <path d="M12 9v5m0 3v.01" />
        </svg>
        <span>
          <strong className="font-semibold">Preview mode.</strong> Fictional
          data only; WhatsApp sending is not connected.
        </span>
      </div>

      <div className="flex h-[calc(100svh-11.25rem)] min-h-[32rem] overflow-hidden rounded-xl border border-border bg-background shadow-sm">
        <WhatsAppConversationList
          conversations={conversations}
          activeId={activeId}
          query={q}
          view={view}
        />

        {!activeThread ? (
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
              <h2 className="mt-4 text-base font-semibold">Explore the preview</h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                Select a fictional scenario to inspect templates, replies,
                media, classifications, and delivery states.
              </p>
            </div>
          </section>
        ) : (
          <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <ConversationHeader
              channel="whatsapp"
              backHref="/conversations/whatsapp"
              name={activeThread.conversation.contact.name}
              subtitle={<>{activeThread.conversation.contact.company} · {activeThread.conversation.contact.phone}</>}
              badge={<span className="hidden rounded-full bg-amber-500/10 px-2 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-300 sm:inline-flex">Fixture only</span>}
            />

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto xl:flex-row xl:overflow-hidden">
              <div className="flex min-h-[27rem] min-w-0 flex-1 flex-col xl:min-h-0">
                <WhatsAppMessageTimeline messages={activeThread.messages} />
                <div className="shrink-0 border-t border-border bg-surface/45 px-4 py-2.5">
                  <div className="mx-auto flex max-w-[46rem] items-center gap-2 text-xs text-muted">
                    {[["Template", "T"], ["Attach", "+"], ["Emoji", "☺"]].map(([label, icon]) => (
                      <button
                        key={label}
                        type="button"
                        disabled
                        title={`${label} is unavailable in preview mode`}
                        className="grid h-9 w-9 place-items-center rounded-md text-base font-medium text-muted disabled:cursor-not-allowed"
                        aria-label={`${label} unavailable in preview mode`}
                      >
                        {icon}
                      </button>
                    ))}
                    <div className="min-w-0 flex-1 truncate">
                      Preview only · sending disabled
                    </div>
                    <button
                      type="button"
                      disabled
                      className="grid h-9 w-9 place-items-center rounded-md bg-emerald-600 text-white disabled:cursor-not-allowed disabled:opacity-55"
                      aria-label="Send unavailable in preview mode"
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                        <path d="m21 4-7.6 16-4.3-6.2L3 10l18-6Z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <WhatsAppCrmInspector thread={activeThread} />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
