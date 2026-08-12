import Link from "next/link";
import { getLeads, type LeadCategory } from "@/lib/api";
import { CATEGORY_LABELS, timeAgo, titleCase } from "@/lib/format";
import {
  Card,
  CategoryBadge,
  ConversationLink,
  EmptyState,
  ScoreBar,
} from "@/components/ui";

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
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const { leads } = await getLeads({
    limit: 200,
    category: category || undefined,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
        <p className="mt-1 text-sm text-muted">
          Ranked by score. Highest-potential customers first.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const active = (category ?? "") === filter.value;
          return (
            <Link
              key={filter.value || "all"}
              href={filter.value ? `/leads?category=${filter.value}` : "/leads"}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                active
                  ? "bg-blue-600 text-white"
                  : "bg-surface text-muted ring-1 ring-border hover:text-foreground"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      <Card title={`${leads.length} lead${leads.length === 1 ? "" : "s"}`}>
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
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-2.5 font-medium">#</th>
                  <th className="px-5 py-2.5 font-medium">Customer</th>
                  <th className="px-5 py-2.5 font-medium">Score</th>
                  <th className="px-5 py-2.5 font-medium">Category</th>
                  <th className="px-5 py-2.5 font-medium">Intent</th>
                  <th className="px-5 py-2.5 font-medium">Why</th>
                  <th className="px-5 py-2.5 font-medium">Location</th>
                  <th className="px-5 py-2.5 font-medium">Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {leads.map((lead, index) => (
                  <tr
                    key={lead.conversation_id}
                    className="transition-colors hover:bg-surface"
                  >
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
