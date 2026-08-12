import { getOptOuts } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { Card, EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function OptOutsPage() {
  const { opt_outs } = await getOptOuts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Opt-out register
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Customers who asked not to be contacted. The agent stops replying to
          these numbers immediately and permanently.
        </p>
      </div>

      <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-5 py-3.5">
        <p className="text-sm text-amber-200/90">
          Opt-outs are enforced at the webhook, before the agent runs — not by
          asking the model to remember. Clearing a conversation does not remove
          anyone from this list.
        </p>
      </div>

      <Card title={`${opt_outs.length} opted out`}>
        {opt_outs.length === 0 ? (
          <EmptyState
            title="Nobody has opted out"
            hint="A customer opts out by sending stop, unsubscribe, or /stop."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-xs uppercase tracking-wide text-zinc-500">
                  <th className="px-5 py-2.5 font-medium">Channel</th>
                  <th className="px-5 py-2.5 font-medium">User</th>
                  <th className="px-5 py-2.5 font-medium">Their words</th>
                  <th className="px-5 py-2.5 font-medium">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/70">
                {opt_outs.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-5 py-3 capitalize text-zinc-400">
                      {entry.channel}
                    </td>
                    <td className="px-5 py-3">
                      <code className="text-xs text-zinc-300">
                        {entry.channel_user_id}
                      </code>
                    </td>
                    <td className="px-5 py-3 italic text-zinc-400">
                      {entry.reason ? `“${entry.reason}”` : "—"}
                    </td>
                    <td className="px-5 py-3 text-zinc-500">
                      {formatDateTime(entry.opted_out_at)}
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
