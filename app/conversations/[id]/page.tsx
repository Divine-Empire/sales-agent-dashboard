import Link from "next/link";
import { getAiLogs, getConversation } from "@/lib/api";
import { formatDateTime, splitConversationId, titleCase } from "@/lib/format";
import { Card, CategoryBadge, EmptyState, ScoreBar } from "@/components/ui";

export const dynamic = "force-dynamic";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-zinc-500">{label}</dt>
      <dd className="mt-0.5 text-sm text-zinc-200">{value || "—"}</dd>
    </div>
  );
}

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const conversationId = decodeURIComponent(id);
  const [detail, { logs }] = await Promise.all([
    getConversation(conversationId),
    getAiLogs({ conversationId, limit: 50 }),
  ]);

  const { summary, messages } = detail;
  const [channel, userId] = splitConversationId(conversationId);

  const llmCalls = logs.filter((log) => log.event_type === "llm_call");
  const tokens = llmCalls.reduce(
    (sum, log) => sum + (log.prompt_tokens ?? 0) + (log.completion_tokens ?? 0),
    0,
  );
  const avgLatency = llmCalls.length
    ? Math.round(
        llmCalls.reduce((sum, log) => sum + (log.latency_ms ?? 0), 0) /
          llmCalls.length,
      )
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/leads"
          className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
        >
          ← Back to leads
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {summary?.customer_name ?? "Unidentified customer"}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {summary?.company_name ? `${summary.company_name} · ` : ""}
          <span className="capitalize">{channel}</span> · {userId}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card title={`Conversation (${messages.length} messages)`}>
            {messages.length === 0 ? (
              <EmptyState
                title="No messages"
                hint="The customer may have cleared their conversation history."
              />
            ) : (
              <div className="max-h-[70vh] space-y-3 overflow-y-auto px-5 py-4">
                {messages.map((message, index) => {
                  const isUser = message.role === "user";
                  return (
                    <div
                      key={`${message.created_at}-${index}`}
                      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                          isUser
                            ? "bg-blue-600/90 text-white"
                            : "bg-zinc-800 text-zinc-100"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                        <p
                          className={`mt-1 text-[11px] ${
                            isUser ? "text-blue-100/70" : "text-zinc-500"
                          }`}
                        >
                          {formatDateTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="AI summary">
            {!summary ? (
              <EmptyState title="Not analysed yet" />
            ) : (
              <div className="space-y-4 px-5 py-4">
                <div className="flex items-center gap-3">
                  {summary.lead_score !== null && (
                    <ScoreBar score={summary.lead_score} />
                  )}
                  <CategoryBadge category={summary.lead_category} />
                </div>
                {summary.summary && (
                  <p className="text-sm leading-relaxed text-zinc-300">
                    {summary.summary}
                  </p>
                )}
                {summary.next_action && (
                  <div className="rounded-lg bg-blue-500/10 px-3 py-2 ring-1 ring-inset ring-blue-500/20">
                    <p className="text-xs font-medium uppercase tracking-wide text-blue-400">
                      Recommended next action
                    </p>
                    <p className="mt-1 text-sm text-zinc-200">
                      {summary.next_action}
                    </p>
                  </div>
                )}
                <dl className="grid grid-cols-2 gap-3 border-t border-zinc-800 pt-3">
                  <Field
                    label="Products"
                    value={summary.interested_machines?.join(", ")}
                  />
                  <Field label="Budget" value={summary.budget} />
                  <Field label="Timeline" value={summary.timeline} />
                  <Field label="Location" value={summary.location} />
                  <Field
                    label="Intent"
                    value={titleCase(summary.customer_intent)}
                  />
                  <Field
                    label="Language"
                    value={summary.preferred_language?.toUpperCase()}
                  />
                  <Field label="Requirements" value={summary.requirements} />
                  <Field
                    label="Confidence"
                    value={
                      summary.ai_confidence !== null
                        ? `${Math.round(summary.ai_confidence * 100)}%`
                        : null
                    }
                  />
                </dl>
              </div>
            )}
          </Card>

          <Card title="Agent telemetry">
            <dl className="grid grid-cols-3 gap-3 px-5 py-4">
              <Field label="LLM calls" value={llmCalls.length} />
              <Field label="Tokens" value={tokens.toLocaleString()} />
              <Field label="Avg latency" value={`${avgLatency}ms`} />
            </dl>
            {llmCalls.length > 0 && (
              <p className="border-t border-zinc-800 px-5 py-2.5 text-xs text-zinc-500">
                Model: {llmCalls[0].model ?? "—"}
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
