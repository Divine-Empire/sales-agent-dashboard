import Link from "next/link";
import {
  getConversations,
  getHandovers,
  getHealth,
  getLeads,
  getOverview,
} from "@/lib/api";
import { timeAgo, titleCase } from "@/lib/format";
import {
  BarRow,
  CategoryBadge,
  ConversationLink,
  EmptyState,
  ScoreBar,
} from "@/components/ui";
import { DataStateNotice } from "@/components/data-state-notice";
import { DataSurface, StatusBadge, WorkspaceHeader } from "@/components/workspace";

export const dynamic = "force-dynamic";

function Metric({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="min-w-0 px-4 py-3 first:pl-0 last:pr-0">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted">{label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tabular-nums">{value}</span>
        {hint && <span className="truncate text-xs text-muted">{hint}</span>}
      </div>
    </div>
  );
}

export default async function OverviewPage() {
  const [overview, leadsResult, handoversResult, conversationsResult, health] =
    await Promise.all([
      getOverview(),
      getLeads({ limit: 8 }),
      getHandovers("pending"),
      getConversations({ limit: 8, channel: "telegram" }),
      getHealth(),
    ]);
  const hotLeads = leadsResult.leads.filter((lead) => lead.category === "hot");
  const attentionCount = handoversResult.handovers.length + hotLeads.length;
  const maxMachine = Math.max(
    1,
    ...overview.machine_interest.map((item) => item.count),
  );

  return (
    <div className="space-y-6">
      <DataStateNotice
        states={[
          overview._dataState,
          leadsResult._dataState,
          handoversResult._dataState,
          conversationsResult._dataState,
          health._dataState,
        ]}
      />
      <WorkspaceHeader
        title="Overview"
        description="Priority work and live sales activity."
        actions={
          <StatusBadge tone={health.status === "ok" ? "success" : "danger"}>
            <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${health.status === "ok" ? "bg-emerald-500" : "bg-red-500"}`} />
            Agent {health.status === "ok" ? "online" : "unreachable"}
          </StatusBadge>
        }
      />

      <section aria-label="Sales metrics" className="grid divide-y divide-border border-y border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0 xl:grid-cols-6">
        <Metric label="Needs attention" value={attentionCount} hint="hot + handovers" />
        <Metric label="Conversations" value={overview.totals.conversations} />
        <Metric label="Leads" value={overview.totals.leads} />
        <Metric label="Hot" value={overview.categories.hot} />
        <Metric label="Customers" value={overview.totals.identified_customers} />
        <Metric label="Average score" value={overview.totals.average_score} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
        <div className="space-y-6">
          <DataSurface
            title="Needs attention"
            meta={<Link href="/handovers" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">Open queue</Link>}
          >
            {attentionCount === 0 ? (
              <EmptyState title="Nothing needs immediate attention" hint="Hot leads and pending handovers appear here." />
            ) : (
              <ul className="divide-y divide-border/70">
                {handoversResult.handovers.slice(0, 4).map((handover) => (
                  <li key={handover.id} className="flex items-start justify-between gap-4 px-5 py-3.5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <StatusBadge tone="warning">Handover</StatusBadge>
                        <ConversationLink conversationId={handover.conversation_id}>{titleCase(handover.reason)}</ConversationLink>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{handover.context ?? "No context recorded."}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted">{timeAgo(handover.notified_at)}</span>
                  </li>
                ))}
                {hotLeads.slice(0, 4).map((lead) => (
                  <li key={lead.conversation_id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                    <div className="min-w-0">
                      <ConversationLink conversationId={lead.conversation_id}>{lead.customer_name ?? "Unidentified customer"}</ConversationLink>
                      <p className="truncate text-xs text-muted">{lead.company_name ?? titleCase(lead.intent)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3"><ScoreBar score={lead.score} /><CategoryBadge category={lead.category} /></div>
                  </li>
                ))}
              </ul>
            )}
          </DataSurface>

          <DataSurface title="Recent Telegram conversations" meta={<Link href="/conversations/telegram" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">View inbox</Link>}>
            {conversationsResult.conversations.length === 0 ? (
              <EmptyState title="No recent conversations" />
            ) : (
              <ul className="divide-y divide-border/70">
                {conversationsResult.conversations.slice(0, 6).map((conversation) => (
                  <li key={conversation.conversation_id} className="flex items-center gap-3 px-5 py-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sky-500/10 text-[11px] font-semibold text-sky-700 dark:text-sky-300">{(conversation.customer_name ?? "?").slice(0, 2).toUpperCase()}</span>
                    <div className="min-w-0 flex-1">
                      <ConversationLink conversationId={conversation.conversation_id}>{conversation.customer_name ?? "Unidentified customer"}</ConversationLink>
                      <p className="truncate text-xs text-muted">{conversation.last_message ?? "No message preview"}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted">{timeAgo(conversation.last_message_at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </DataSurface>
        </div>

        <div className="space-y-6">
          <DataSurface title="Product demand">
            {overview.machine_interest.length === 0 ? (
              <EmptyState title="No product interest recorded" />
            ) : (
              <div className="space-y-2.5 px-5 py-4">
                {overview.machine_interest.slice(0, 8).map((row) => (
                  <BarRow key={row.machine} label={row.machine} value={row.count} max={maxMachine} />
                ))}
              </div>
            )}
          </DataSurface>

          <DataSurface title="Lead distribution">
            <dl className="divide-y divide-border/70 px-5">
              {(["hot", "warm", "cold", "not_interested"] as const).map((category) => (
                <div key={category} className="flex items-center justify-between py-3 text-sm">
                  <dt>{titleCase(category)}</dt>
                  <dd className="font-semibold tabular-nums">{overview.categories[category]}</dd>
                </div>
              ))}
            </dl>
          </DataSurface>
        </div>
      </div>
    </div>
  );
}
