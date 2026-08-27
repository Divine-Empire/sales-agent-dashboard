"use client";

import { useState } from "react";
import { CategoryBadge, ScoreBar } from "@/components/ui";
import { FactorBreakdown } from "@/components/leads/factor-breakdown";
import type { LeadCategory } from "@/lib/api";

/** The score row in CrmInspector, expandable into the full factor
 * breakdown — a rep clicking "Hot" or the score should see WHY, not just
 * the number. factors is null when no matching lead_scores row was found
 * (e.g. the summary predates lead_scores having factors, or /api/leads'
 * fetch window missed it) — the toggle still renders but says so instead
 * of showing an empty breakdown. */
export function ScoreBreakdownToggle({
  score,
  category,
  factors,
  confidence,
}: {
  score: number;
  category: LeadCategory | null;
  factors: Record<string, number> | null;
  confidence: number | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 rounded-lg text-left"
        aria-expanded={open}
      >
        <span className="flex flex-wrap items-center gap-3">
          <ScoreBar score={score} />
          <CategoryBadge category={category} />
        </span>
        <svg
          viewBox="0 0 24 24"
          className={`h-4 w-4 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="mt-3 rounded-lg border border-border bg-surface/60 px-4 py-3">
          {factors ? (
            <FactorBreakdown factors={factors} confidence={confidence} />
          ) : (
            <p className="text-xs text-muted">
              No factor breakdown available for this score yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
