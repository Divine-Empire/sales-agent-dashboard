import { getAiLogs } from "@/lib/api";
import { formatDateTime, titleCase } from "@/lib/format";
import { Card, ConversationLink, EmptyState, Stat } from "@/components/ui";

export const dynamic = "force-dynamic";

const EVENT_TONES: Record<string, string> = {
  llm_call: "bg-blue-500/15 text-blue-400",
  rag_search: "bg-purple-500/15 text-purple-400",
  tool_call: "bg-emerald-500/15 text-emerald-400",
  fallback: "bg-amber-500/15 text-amber-400",
  error: "bg-red-500/15 text-red-400",
};

export default async function LogsPage() {
  const { logs } = await getAiLogs({ limit: 200 });

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

  // Rough GPT-4o pricing, stated as approximate because it is: $2.50/1M input,
  // $10/1M output. Useful for "what will this cost at scale?"
  const estimatedCost = (tokens / 1_000_000) * 5;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          AI conversation logs
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Per-turn telemetry: which model served each call, tokens spent, and
          latency.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="LLM calls" value={llmCalls.length} />
        <Stat label="Tokens" value={tokens.toLocaleString()} />
        <Stat label="Avg latency" value={`${avgLatency}ms`} />
        <Stat
          label="Est. cost"
          value={`$${estimatedCost.toFixed(3)}`}
          hint={fallbacks > 0 ? `${fallbacks} fallback events` : "no fallbacks"}
        />
      </div>

      <Card title={`Last ${logs.length} events`}>
        {logs.length === 0 ? (
          <EmptyState title="No activity logged yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-xs uppercase tracking-wide text-zinc-500">
                  <th className="px-5 py-2.5 font-medium">Event</th>
                  <th className="px-5 py-2.5 font-medium">Conversation</th>
                  <th className="px-5 py-2.5 font-medium">Model</th>
                  <th className="px-5 py-2.5 font-medium">Tokens</th>
                  <th className="px-5 py-2.5 font-medium">Latency</th>
                  <th className="px-5 py-2.5 font-medium">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/70">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="transition-colors hover:bg-zinc-800/30"
                  >
                    <td className="px-5 py-2.5">
                      <span
                        className={`rounded px-1.5 py-0.5 text-xs ${
                          EVENT_TONES[log.event_type] ??
                          "bg-zinc-800 text-zinc-400"
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
                    <td className="px-5 py-2.5 text-zinc-400">
                      {log.model ?? "—"}
                    </td>
                    <td className="px-5 py-2.5 tabular-nums text-zinc-400">
                      {log.prompt_tokens !== null
                        ? `${(log.prompt_tokens ?? 0) + (log.completion_tokens ?? 0)}`
                        : "—"}
                    </td>
                    <td className="px-5 py-2.5 tabular-nums text-zinc-400">
                      {log.latency_ms !== null ? `${log.latency_ms}ms` : "—"}
                    </td>
                    <td className="px-5 py-2.5 text-zinc-500">
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
