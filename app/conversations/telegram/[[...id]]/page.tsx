import { DataStateNotice } from "@/components/data-state-notice";
import { ConversationHeader } from "@/components/conversations/conversation-header";
import { CrmInspector } from "@/components/telegram/crm-inspector";
import { TelegramConversationList } from "@/components/telegram/conversation-list";
import { MessageTimeline } from "@/components/telegram/message-timeline";
import { getAiLogs, getConversation, getConversations } from "@/lib/api";
import {
  adaptTelegramConversation,
  adaptTelegramThread,
} from "@/lib/telegram-adapter";

export const dynamic = "force-dynamic";

function decodeConversationId(segment: string | undefined): string | undefined {
  if (!segment) return undefined;
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

export default async function TelegramInboxPage({
  params,
  searchParams,
}: {
  params: Promise<{ id?: string[] }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const [{ id }, { q }] = await Promise.all([params, searchParams]);
  const activeId = decodeConversationId(id?.[0]);
  const listResult = await getConversations({ limit: 100, channel: "telegram" });
  const allConversations = listResult.conversations.map(adaptTelegramConversation);
  const query = q?.trim().toLocaleLowerCase();
  const conversations = query
    ? allConversations.filter((conversation) =>
        [
          conversation.contact.name,
          conversation.contact.company,
          conversation.contact.externalId,
          conversation.lastMessage,
          conversation.intent,
        ].some((value) => value?.toLocaleLowerCase().includes(query)),
      )
    : allConversations;

  const [detailResult, logsResult] = activeId
    ? await Promise.all([
        getConversation(activeId),
        getAiLogs({ conversationId: activeId, limit: 50 }),
      ])
    : [null, null];
  const thread = detailResult ? adaptTelegramThread(detailResult) : null;
  const activeConversation = allConversations.find(
    (conversation) => conversation.id === activeId,
  );
  const name =
    thread?.summary?.customer_name ||
    activeConversation?.contact.name ||
    "Unidentified customer";
  const company =
    thread?.summary?.company_name || activeConversation?.contact.company;

  const llmEntries = logsResult?.logs.filter(
    (entry) => entry.event_type === "llm_call",
  ) ?? [];
  const tokens = llmEntries.reduce(
    (sum, entry) =>
      sum + (entry.prompt_tokens ?? 0) + (entry.completion_tokens ?? 0),
    0,
  );
  const averageLatency = llmEntries.length
    ? Math.round(
        llmEntries.reduce((sum, entry) => sum + (entry.latency_ms ?? 0), 0) /
          llmEntries.length,
      )
    : 0;

  return (
    <div className="space-y-3">
      <DataStateNotice
        states={[
          listResult._dataState,
          ...(detailResult ? [detailResult._dataState] : []),
          ...(logsResult ? [logsResult._dataState] : []),
        ]}
      />

      <div className="flex h-[calc(100svh-8.75rem)] min-h-[34rem] overflow-hidden rounded-xl border border-border bg-background shadow-sm">
        <TelegramConversationList
          conversations={conversations}
          activeId={activeId}
          query={q}
        />

        {!activeId ? (
          <section className="hidden min-w-0 flex-1 place-items-center bg-background md:grid">
            <div className="max-w-sm px-8 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-300">
                <svg
                  viewBox="0 0 24 24"
                  className="h-7 w-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.7}
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m21 4-7.6 16-4.3-6.2L3 10l18-6Z" />
                  <path d="m9.1 13.8 4.3 2.7V20" />
                </svg>
              </span>
              <h2 className="mt-4 text-base font-semibold">Select a conversation</h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                Open a Telegram chat to review its timeline, qualification data,
                and recommended next action.
              </p>
            </div>
          </section>
        ) : (
          <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <ConversationHeader
              channel="telegram"
              backHref="/conversations/telegram"
              name={name}
              subtitle={<>{company ? `${company} · ` : ""}Telegram · {activeConversation?.contact.externalId ?? activeId.split(":").at(-1)}</>}
              badge={<span className="hidden rounded-full bg-border/70 px-2 py-1 text-[11px] font-medium text-muted sm:inline-flex">Read only</span>}
            />

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto xl:flex-row xl:overflow-hidden">
              <div className="flex min-h-[28rem] min-w-0 flex-1 flex-col xl:min-h-0">
                {!thread || thread.messages.length === 0 ? (
                  <div className="grid min-h-0 flex-1 place-items-center px-6 text-center">
                    <div>
                      <p className="text-sm font-medium">No messages available</p>
                      <p className="mt-1 text-xs leading-5 text-muted">
                        The history may have been cleared, or live data is currently unavailable.
                      </p>
                    </div>
                  </div>
                ) : (
                  <MessageTimeline messages={thread.messages} />
                )}
                <div className="shrink-0 border-t border-border bg-surface/45 px-4 py-2.5">
                  <div className="mx-auto flex max-w-[46rem] items-center gap-2 text-xs text-muted">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      aria-hidden="true"
                    >
                      <path d="M12 17v.01M7 10V8a5 5 0 0110 0v2M6 10h12v10H6V10Z" />
                    </svg>
                    <span className="font-medium text-foreground/70">Read-only conversation</span>
                    <span className="text-muted/60">·</span>
                    <span>Operator replies are not enabled.</span>
                  </div>
                </div>
              </div>

              <CrmInspector
                summary={thread?.summary ?? null}
                llmCalls={llmEntries.length}
                tokens={tokens}
                averageLatency={averageLatency}
                model={llmEntries[0]?.model ?? null}
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
