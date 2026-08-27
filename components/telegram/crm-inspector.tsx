import type { ConversationSummary } from "@/lib/api";
import { titleCase } from "@/lib/format";
import { ScoreBreakdownToggle } from "./score-breakdown-toggle";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-medium uppercase tracking-wider text-muted">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm leading-5 text-foreground">
        {value || "—"}
      </dd>
    </div>
  );
}

export function CrmInspector({
  summary,
  factors,
  llmCalls,
  tokens,
  averageLatency,
  model,
}: {
  summary: ConversationSummary | null;
  factors: Record<string, number> | null;
  llmCalls: number;
  tokens: number;
  averageLatency: number;
  model: string | null;
}) {
  return (
    <aside
      aria-label="CRM conversation insights"
      className="min-h-0 overflow-y-auto border-t border-border bg-surface/25 xl:w-[20rem] xl:shrink-0 xl:border-l xl:border-t-0"
    >
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold">CRM insights</h2>
        <p className="mt-0.5 text-xs text-muted">AI-extracted qualification data</p>
      </div>

      {!summary ? (
        <div className="px-5 py-10 text-center">
          <p className="text-sm font-medium">Not analysed yet</p>
          <p className="mt-1 text-xs leading-5 text-muted">
            This conversation is live, but no AI summary has been generated.
          </p>
        </div>
      ) : (
        <div className="space-y-4 px-5 py-4">
          {summary.lead_score !== null && (
            <ScoreBreakdownToggle
              score={summary.lead_score}
              category={summary.lead_category}
              factors={factors}
              confidence={summary.ai_confidence}
            />
          )}

          {summary.summary && (
            <div>
              <h3 className="text-[10px] font-medium uppercase tracking-wider text-muted">
                Summary
              </h3>
              <p className="mt-1.5 text-[13px] leading-5 text-foreground/85">
                {summary.summary}
              </p>
            </div>
          )}

          {summary.next_action && (
            <div className="border-l-2 border-blue-500 pl-3">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                Next action
              </h3>
              <p className="mt-1 text-sm leading-5">{summary.next_action}</p>
            </div>
          )}

          <dl className="grid grid-cols-2 gap-x-4 gap-y-4 border-t border-border pt-4">
            <Field label="Products" value={summary.interested_machines?.join(", ")} />
            <Field label="Budget" value={summary.budget} />
            <Field label="Timeline" value={summary.timeline} />
            <Field label="Location" value={summary.location} />
            <Field label="Intent" value={titleCase(summary.customer_intent)} />
            <Field label="Language" value={summary.preferred_language?.toUpperCase()} />
            <div className="col-span-2">
              <Field label="Requirements" value={summary.requirements} />
            </div>
            <Field label="Handover" value={titleCase(summary.handover_status)} />
          </dl>
        </div>
      )}

      <div className="border-t border-border px-5 py-4">
        <h3 className="text-[10px] font-medium uppercase tracking-wider text-muted">
          Agent telemetry
        </h3>
        <dl className="mt-3 grid grid-cols-3 gap-3">
          <Field label="Calls" value={llmCalls} />
          <Field label="Tokens" value={tokens.toLocaleString()} />
          <Field label="Latency" value={llmCalls ? `${averageLatency}ms` : "—"} />
        </dl>
        {model && <p className="mt-3 truncate text-xs text-muted">Model: {model}</p>}
      </div>
    </aside>
  );
}
