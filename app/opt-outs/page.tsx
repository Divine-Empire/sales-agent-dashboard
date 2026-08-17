import { getOptOuts } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { EmptyState } from "@/components/ui";
import { DataStateNotice } from "@/components/data-state-notice";
import { DataSurface, WorkspaceHeader } from "@/components/workspace";

export const dynamic = "force-dynamic";

export default async function OptOutsPage() {
  const optOutsResult = await getOptOuts();
  const { opt_outs } = optOutsResult;

  return (
    <div className="space-y-6">
      <DataStateNotice states={[optOutsResult._dataState]} />
      <WorkspaceHeader
        title="Opt-out register"
        description="Customers who asked not to be contacted. The agent stops replying to these numbers immediately and permanently."
      />

      <div className="border-l-2 border-amber-500 bg-amber-500/6 px-4 py-3">
        <p className="text-sm leading-5 text-amber-900 dark:text-amber-200">
          Opt-outs are enforced at the webhook, before the agent runs — not by
          asking the model to remember. Clearing a conversation does not remove
          anyone from this list.
        </p>
      </div>

      <DataSurface title={`${opt_outs.length} opted out`}>
        {opt_outs.length === 0 ? (
          <EmptyState
            title="Nobody has opted out"
            hint="A customer opts out by sending stop, unsubscribe, or /stop."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-2.5 font-medium">Channel</th>
                  <th className="px-5 py-2.5 font-medium">User</th>
                  <th className="px-5 py-2.5 font-medium">Their words</th>
                  <th className="px-5 py-2.5 font-medium">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {opt_outs.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-5 py-3 capitalize text-muted">
                      {entry.channel}
                    </td>
                    <td className="px-5 py-3">
                      <code className="text-xs text-foreground/80">
                        {entry.channel_user_id}
                      </code>
                    </td>
                    <td className="px-5 py-3 italic text-muted">
                      {entry.reason ? `“${entry.reason}”` : "—"}
                    </td>
                    <td className="px-5 py-3 text-muted">
                      {formatDateTime(entry.opted_out_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DataSurface>
    </div>
  );
}
