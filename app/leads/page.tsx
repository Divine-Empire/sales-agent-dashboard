import { getLeads, type LeadCategory } from "@/lib/api";
import { CATEGORY_LABELS, timeAgo, titleCase } from "@/lib/format";
import {
  CategoryBadge,
  ConversationLink,
  EmptyState,
  ScoreBar,
} from "@/components/ui";
import { LeadBoard } from "@/components/leads/lead-board";
import {
  DataTable,
  DataTableBody,
  DataTableHeader,
  DataTableRow,
} from "@/components/data-table";
import { DataStateNotice } from "@/components/data-state-notice";
import {
  PageToolbar,
  DataSurface,
  SegmentedControl,
  WorkspaceHeader,
} from "@/components/workspace";

export const dynamic = "force-dynamic";

const FILTERS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "hot", label: CATEGORY_LABELS.hot },
  { value: "warm", label: CATEGORY_LABELS.warm },
  { value: "cold", label: CATEGORY_LABELS.cold },
  { value: "not_interested", label: CATEGORY_LABELS.not_interested },
];

/** Top scoring factors, so a rep sees WHY a lead ranks where it does. An
 * unexplained number is the first thing a sales manager argues with. */
function TopFactors({ factors }: { factors: Record<string, number> }) {
  const top = Object.entries(factors ?? {})
    .filter(([, value]) => value > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);
  if (top.length === 0) return <span className="text-muted/70">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {top.map(([name, value]) => (
        <span
          key={name}
          className="rounded bg-border px-1.5 py-0.5 text-[11px] text-muted"
        >
          {titleCase(name)} {value}
        </span>
      ))}
    </div>
  );
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; view?: string }>;
}) {
  const { category, view } = await searchParams;
  const activeView = view === "board" ? "board" : "table";
  const leadsResult = await getLeads({
    limit: activeView === "board" ? 300 : 200,
    category: activeView === "table" ? category || undefined : undefined,
  });
  const { leads } = leadsResult;

  return (
    <div className="space-y-6">
      <DataStateNotice states={[leadsResult._dataState]} />
      <WorkspaceHeader
        title="Leads"
        description="Ranked by AI qualification score. Table and board are two views of the same lead records."
      />

      <PageToolbar>
        {activeView === "table" ? (
          <SegmentedControl
            ariaLabel="Filter leads by category"
            activeValue={category ?? ""}
            items={FILTERS.map((filter) => ({
              ...filter,
              href: filter.value ? `/leads?category=${filter.value}` : "/leads",
            }))}
          />
        ) : (
          <p className="text-xs text-muted">
            Drag cards or use “Move to” to correct an AI category. It is not a permanent lock.
          </p>
        )}
        <SegmentedControl
          ariaLabel="Choose leads view"
          activeValue={activeView}
          items={[
            {
              value: "table",
              label: "Table",
              href: category ? `/leads?category=${category}` : "/leads",
            },
            { value: "board", label: "Board", href: "/leads?view=board" },
          ]}
        />
      </PageToolbar>

      {activeView === "board" && leads.length > 0 ? (
        <LeadBoard leads={leads} />
      ) : (
      <DataSurface title={`${leads.length} lead${leads.length === 1 ? "" : "s"}`}>
        {leads.length === 0 ? (
          <EmptyState
            title="No leads in this view"
            hint={
              category
                ? "Try another category."
                : "Leads appear once a customer identifies themselves in chat."
            }
          />
        ) : (
          <DataTable minWidth="min-w-[860px]">
              <DataTableHeader>
                  <th className="px-5 py-2.5 font-medium">#</th>
                  <th className="px-5 py-2.5 font-medium">Customer</th>
                  <th className="px-5 py-2.5 font-medium">Score</th>
                  <th className="px-5 py-2.5 font-medium">Category</th>
                  <th className="px-5 py-2.5 font-medium">Intent</th>
                  <th className="px-5 py-2.5 font-medium">Why</th>
                  <th className="px-5 py-2.5 font-medium">Location</th>
                  <th className="px-5 py-2.5 font-medium">Activity</th>
              </DataTableHeader>
              <DataTableBody>
                {leads.map((lead, index) => (
                  <DataTableRow key={lead.conversation_id}>
                    <td className="px-5 py-3 tabular-nums text-muted/70">
                      {index + 1}
                    </td>
                    <td className="px-5 py-3">
                      <ConversationLink conversationId={lead.conversation_id}>
                        {lead.customer_name ?? "Unidentified"}
                      </ConversationLink>
                      <p className="text-xs text-muted">
                        {lead.company_name ?? "—"}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <ScoreBar score={lead.score} />
                    </td>
                    <td className="px-5 py-3">
                      <CategoryBadge category={lead.category as LeadCategory} />
                    </td>
                    <td className="px-5 py-3 text-muted">
                      {titleCase(lead.intent)}
                    </td>
                    <td className="px-5 py-3">
                      <TopFactors factors={lead.factors} />
                    </td>
                    <td className="px-5 py-3 text-muted">
                      {lead.location ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-muted">
                      {timeAgo(lead.last_message_at ?? lead.scored_at)}
                    </td>
                  </DataTableRow>
                ))}
              </DataTableBody>
          </DataTable>
        )}
      </DataSurface>
      )}
    </div>
  );
}
