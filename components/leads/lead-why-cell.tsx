"use client";

import { useState } from "react";
import type { Lead } from "@/lib/api";
import { FactorBreakdown, TopFactors } from "./factor-breakdown";

/** The compact "Why" cell in the leads table. Click to expand into the full
 * factor breakdown so a rep can see exactly what a score of 90 is made of,
 * rather than just the top 3 pills. */
export function LeadWhyCell({ lead }: { lead: Lead }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="text-left"
      >
        <TopFactors factors={lead.factors} />
      </button>
      {open && (
        <div className="mt-3 w-72 max-w-[80vw] rounded-lg border border-border bg-surface px-4 py-3 shadow-lg">
          <FactorBreakdown
            factors={lead.factors}
            score={lead.score}
            category={lead.category}
            confidence={lead.confidence}
          />
        </div>
      )}
    </div>
  );
}
