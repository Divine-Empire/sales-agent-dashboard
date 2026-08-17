"use client";

import { useOptimistic, useState, useTransition } from "react";
import type { Lead, LeadCategory } from "@/lib/api";
import { CATEGORY_LABELS, timeAgo } from "@/lib/format";
import { ConversationLink, ScoreBar } from "@/components/ui";
import { moveLeadCategory } from "@/app/leads/actions";

const COLUMNS: LeadCategory[] = ["cold", "warm", "hot", "not_interested"];
const COLUMN_ACCENT: Record<LeadCategory, string> = {
  hot: "border-t-red-500",
  warm: "border-t-amber-500",
  cold: "border-t-sky-500",
  not_interested: "border-t-zinc-400 dark:border-t-zinc-600",
};

export function LeadBoard({ leads }: { leads: Lead[] }) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<LeadCategory | null>(null);
  const [, startTransition] = useTransition();
  const [optimisticLeads, applyOptimisticMove] = useOptimistic(
    leads,
    (current, move: { conversationId: string; category: LeadCategory }) =>
      current.map((lead) =>
        lead.conversation_id === move.conversationId
          ? { ...lead, category: move.category }
          : lead,
      ),
  );

  function move(conversationId: string, category: LeadCategory) {
    const lead = optimisticLeads.find(
      (item) => item.conversation_id === conversationId,
    );
    if (!lead || lead.category === category) return;
    startTransition(async () => {
      applyOptimisticMove({ conversationId, category });
      await moveLeadCategory(conversationId, category);
    });
  }

  function drop(category: LeadCategory) {
    const conversationId = draggingId;
    setDraggingId(null);
    setDragOverColumn(null);
    if (conversationId) move(conversationId, category);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {COLUMNS.map((category) => {
        const columnLeads = optimisticLeads
          .filter((lead) => lead.category === category)
          .sort((a, b) => b.score - a.score);
        return (
          <section
            key={category}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOverColumn(category);
            }}
            onDragLeave={() =>
              setDragOverColumn((current) =>
                current === category ? null : current,
              )
            }
            onDrop={(event) => {
              event.preventDefault();
              drop(category);
            }}
            className={`flex min-h-44 flex-col border-t-2 bg-surface/35 ${COLUMN_ACCENT[category]} ${
              dragOverColumn === category ? "ring-2 ring-inset ring-blue-500/40" : ""
            }`}
          >
            <header className="flex items-center justify-between border-b border-border px-3 py-2.5">
              <h2 className="text-sm font-semibold">{CATEGORY_LABELS[category]}</h2>
              <span className="text-xs tabular-nums text-muted">{columnLeads.length}</span>
            </header>
            <div className="flex-1 space-y-2 p-2.5">
              {columnLeads.length === 0 ? (
                <p className="px-2 py-6 text-center text-xs text-muted">No leads</p>
              ) : (
                columnLeads.map((lead) => (
                  <article
                    key={lead.conversation_id}
                    draggable
                    onDragStart={() => setDraggingId(lead.conversation_id)}
                    onDragEnd={() => setDraggingId(null)}
                    className={`rounded-lg border border-border bg-background p-3 shadow-sm transition-opacity ${
                      draggingId === lead.conversation_id ? "opacity-40" : ""
                    }`}
                  >
                    <ConversationLink conversationId={lead.conversation_id}>
                      <p className="truncate text-sm font-medium">
                        {lead.customer_name ?? "Unidentified"}
                      </p>
                    </ConversationLink>
                    <p className="truncate text-xs text-muted">
                      {lead.company_name ?? lead.conversation_id}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <ScoreBar score={lead.score} />
                      <span className="text-[11px] text-muted/70">
                        {timeAgo(lead.last_message_at ?? lead.scored_at)}
                      </span>
                    </div>
                    <label className="mt-2 block text-[10px] font-medium uppercase tracking-wider text-muted">
                      Move to
                      <select
                        value={lead.category}
                        onChange={(event) =>
                          move(
                            lead.conversation_id,
                            event.target.value as LeadCategory,
                          )
                        }
                        className="mt-1 h-8 w-full rounded-md border border-border bg-background px-2 text-xs normal-case tracking-normal text-foreground"
                      >
                        {COLUMNS.map((option) => (
                          <option key={option} value={option}>
                            {CATEGORY_LABELS[option]}
                          </option>
                        ))}
                      </select>
                    </label>
                  </article>
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
