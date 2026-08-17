import { getAiLogs } from "@/lib/api";
import { formatDateTime, titleCase } from "@/lib/format";
import { Card, ConversationLink, EmptyState, Stat } from "@/components/ui";
import { DataStateNotice } from "@/components/data-state-notice";
import { WorkspaceHeader } from "@/components/workspace";

export const dynamic = "force-dynamic";

const EVENT_TONES: Record<string, string> = {
  llm_call: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  rag_search: "bg-purple-500/15 text-purple-700 dark:text-purple-400",
  tool_call: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  fallback: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  error: "bg-red-500/15 text-red-700 dark:text-red-400",
};

export default async function LogsPage() {
  const logsResult = await getAiLogs({ limit: 200 });
  const { logs } = logsResult;

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
  const fallbacks = logs.filter((log) => log.event_type === "fallback").length;

  return (
    <div className="space-y-6">
      <DataStateNotice states={[logsResult._dataState]} />
      <WorkspaceHeader
        title="AI performance"
        description="Model activity, token usage, latency, fallbacks, and technical events."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="LLM calls" value={llmCalls.length} />
        <Stat label="Tokens" value={tokens.toLocaleString()} />
        <Stat label="Avg latency" value={`${avgLatency}ms`} />
        <Stat
          label="Fallbacks"
          value={fallbacks}
          hint={fallbacks > 0 ? "review required" : "none recorded"}
        />
      </div>

      <Card title={`Last ${logs.length} events`}>
        {logs.length === 0 ? (
          <EmptyState title="No activity logged yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-2.5 font-medium">Event</th>
                  <th className="px-5 py-2.5 font-medium">Conversation</th>
                  <th className="px-5 py-2.5 font-medium">Model</th>
                  <th className="px-5 py-2.5 font-medium">Tokens</th>
                  <th className="px-5 py-2.5 font-medium">Latency</th>
                  <th className="px-5 py-2.5 font-medium">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="transition-colors hover:bg-surface"
                  >
                    <td className="px-5 py-2.5">
                      <span
                        className={`rounded px-1.5 py-0.5 text-xs ${
                          EVENT_TONES[log.event_type] ??
                          "bg-border text-muted"
                        }`}
                      >
                        {titleCase(log.event_type)}
                      </span>
                    </td>
                    <td className="px-5 py-2.5">
                      <ConversationLink conversationId={log.conversation_id}>
                        <code className="text-xs">{log.conversation_id}</code>
                      </ConversationLink>
                    </td>
                    <td className="px-5 py-2.5 text-muted">
                      {log.model ?? "—"}
                    </td>
                    <td className="px-5 py-2.5 tabular-nums text-muted">
                      {log.prompt_tokens !== null
                        ? `${(log.prompt_tokens ?? 0) + (log.completion_tokens ?? 0)}`
                        : "—"}
                    </td>
                    <td className="px-5 py-2.5 tabular-nums text-muted">
                      {log.latency_ms !== null ? `${log.latency_ms}ms` : "—"}
                    </td>
                    <td className="px-5 py-2.5 text-muted">
                      {formatDateTime(log.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
