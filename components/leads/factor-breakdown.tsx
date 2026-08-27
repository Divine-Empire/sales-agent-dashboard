import { titleCase } from "@/lib/format";

/** Mirrors app/intelligence.py's FACTOR_WEIGHTS — kept in sync manually since
 * this is display-only (the score itself is computed backend-side as the sum
 * of these, never recomputed here). Order matters: it's the order factors
 * render in the expanded breakdown. */
const FACTOR_WEIGHTS: Record<string, number> = {
  buying_intent: 20,
  budget: 15,
  timeline: 15,
  product_fit: 10,
  decision_maker: 10,
  engagement: 10,
  business_type: 5,
  quote_request: 5,
  demo_request: 5,
  brochure_request: 5,
};

const FACTOR_HINTS: Record<string, string> = {
  buying_intent: "Explicit intent to purchase",
  budget: "Budget stated or implied",
  timeline: "When they plan to buy",
  product_fit: "What they need matches what we sell",
  decision_maker: "Authority to buy",
  engagement: "Depth of conversation, questions asked",
  business_type: "Contractor/dealer vs student/curious",
  quote_request: "Asked for a quotation",
  demo_request: "Asked for a demo or site visit",
  brochure_request: "Asked for specs or literature",
};

/** Compact form: top 3 nonzero factors as small pills. Used in dense list/
 * board rows where full context would overwhelm the row. */
export function TopFactors({ factors }: { factors: Record<string, number> }) {
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

/** Expanded form: every factor the AI scored, each against its own maximum
 * weight, so a rep can see exactly why a lead landed at its score — not just
 * the top 3. Zero-value factors still render (greyed) so "never discussed"
 * reads differently from "discussed and scored low". */
export function FactorBreakdown({
  factors,
  score,
  category,
  confidence,
}: {
  factors: Record<string, number>;
  score?: number;
  category?: string | null;
  confidence?: number | null;
}) {
  const entries = Object.keys(FACTOR_WEIGHTS).map((name) => ({
    name,
    value: factors?.[name] ?? 0,
    max: FACTOR_WEIGHTS[name],
  }));
  const contributing = entries
    .filter((entry) => entry.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-4">
      {(score !== undefined || category) && (
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {score !== undefined && (
            <span className="text-2xl font-semibold tabular-nums text-foreground">
              {score}
            </span>
          )}
          {category && (
            <span className="text-sm text-muted">
              {titleCase(category)}
              {typeof confidence === "number" &&
                ` · ${Math.round(confidence * 100)}% confidence`}
            </span>
          )}
        </div>
      )}

      {contributing.length > 0 && (
        <p className="text-xs text-muted">
          Driven mainly by{" "}
          {contributing
            .slice(0, 2)
            .map((entry) => titleCase(entry.name).toLowerCase())
            .join(" and ")}
          .
        </p>
      )}

      <ul className="space-y-2.5">
        {entries.map(({ name, value, max }) => (
          <li key={name} className="flex items-center gap-3 text-sm">
            <span
              className="w-32 shrink-0 truncate text-foreground/80"
              title={FACTOR_HINTS[name]}
            >
              {titleCase(name)}
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
              <div
                className={`h-full rounded-full ${value > 0 ? "bg-blue-500" : "bg-transparent"}`}
                style={{ width: `${(value / max) * 100}%` }}
              />
            </div>
            <span className="w-10 shrink-0 text-right tabular-nums text-muted">
              {value}/{max}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
