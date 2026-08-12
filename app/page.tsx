import { getHandovers, getHealth, getLeads, getOverview } from "@/lib/api";
import { timeAgo, titleCase } from "@/lib/format";
import {
  BarRow,
  Card,
  CategoryBadge,
  ConversationLink,
  EmptyState,
  Funnel,
  ScoreBar,
  Stat,
} from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const [overview, { leads }, { handovers }, health] = await Promise.all([
    getOverview(),
    getLeads({ limit: 8 }),
    getHandovers("pending"),
    getHealth(),
  ]);

  const { totals, categories, machine_interest, funnel, intents } = overview;
  const maxMachine = Math.max(1, ...machine_interest.map((m) => m.count));
  const maxIntent = Math.max(1, ...intents.map((i) => i.count));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Live pipeline from the AI sales agent
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${
            health.status === "ok"
              ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30"
              : "bg-red-500/10 text-red-400 ring-red-500/30"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              health.status === "ok" ? "bg-emerald-400" : "bg-red-400"
            }`}
          />
          Agent {health.status === "ok" ? "online" : "unreachable"}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Stat label="Conversations" value={totals.conversations} />
        <Stat label="Leads" value={totals.leads} />
        <Stat label="Hot" value={categories.hot} tone="hot" />
        <Stat label="Warm" value={categories.warm} tone="warm" />
        <Stat
          label="Handovers"
          value={totals.pending_handovers}
          hint="awaiting a rep"
        />
        <Stat
          label="Avg score"
          value={totals.average_score}
          hint={`${totals.opt_outs} opted out`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Highest-priority leads">
            {leads.length === 0 ? (
              <EmptyState
                title="No leads yet"
                hint="A lead appears once a customer gives their name and company in chat."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-left text-xs uppercase tracking-wide text-zinc-500">
                      <th className="px-5 py-2.5 font-medium">Customer</th>
                      <th className="px-5 py-2.5 font-medium">Score</th>
                      <th className="px-5 py-2.5 font-medium">Category</th>
                      <th className="px-5 py-2.5 font-medium">Activity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/70">
                    {leads.map((lead) => (
                      <tr
                        key={lead.conversation_id}
                        className="transition-colors hover:bg-zinc-800/30"
                      >
                        <td className="px-5 py-3">
                          <ConversationLink
                            conversationId={lead.conversation_id}
                          >
                            {lead.customer_name ?? "Unidentified"}
                          </ConversationLink>
                          <p className="text-xs text-zinc-500">
                            {lead.company_name ?? "—"}
                          </p>
                        </td>
                        <td className="px-5 py-3">
                          <ScoreBar score={lead.score} />
                        </td>
                        <td className="px-5 py-3">
                          <CategoryBadge category={lead.category} />
                        </td>
                        <td className="px-5 py-3 text-zinc-400">
                          {timeAgo(lead.last_message_at ?? lead.scored_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card title="Machine interest">
            {machine_interest.length === 0 ? (
              <EmptyState title="No product interest recorded yet" />
            ) : (
              <div className="space-y-2.5 px-5 py-4">
                {machine_interest.slice(0, 8).map((row) => (
                  <BarRow
                    key={row.machine}
                    label={row.machine}
                    value={row.count}
                    max={maxMachine}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Conversion funnel">
            {funnel.every((s) => s.count === 0) ? (
              <EmptyState title="No conversations yet" />
            ) : (
              <Funnel stages={funnel} />
            )}
          </Card>

          <Card title="Enquiry types">
            {intents.length === 0 ? (
              <EmptyState title="No data yet" />
            ) : (
              <div className="space-y-2.5 px-5 py-4">
                {intents.slice(0, 6).map((row) => (
                  <BarRow
                    key={row.intent}
                    label={titleCase(row.intent)}
                    value={row.count}
                    max={maxIntent}
                    tone="sky"
                  />
                ))}
              </div>
            )}
          </Card>

          <Card title="Pending handovers">
            {handovers.length === 0 ? (
              <EmptyState title="Nothing waiting" />
            ) : (
              <ul className="divide-y divide-zinc-800/70">
                {handovers.slice(0, 4).map((handover) => (
                  <li key={handover.id} className="px-5 py-3">
                    <ConversationLink conversationId={handover.conversation_id}>
                      <span className="text-sm">
                        {titleCase(handover.reason)}
                      </span>
                    </ConversationLink>
                    <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">
                      {handover.context ?? "—"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
