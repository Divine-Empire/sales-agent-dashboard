"use client";

import { useOptimistic, useState, useTransition } from "react";
import type { Lead, LeadCategory } from "@/lib/api";
import { CATEGORY_LABELS, timeAgo } from "@/lib/format";
import { ConversationLink, ScoreBar } from "@/components/ui";
import { moveLeadCategory } from "./actions";

const COLUMNS: LeadCategory[] = ["cold", "warm", "hot", "not_interested"];

const COLUMN_ACCENT: Record<LeadCategory, string> = {
  hot: "border-t-red-500",
  warm: "border-t-amber-500",
  cold: "border-t-sky-500",
  not_interested: "border-t-zinc-400 dark:border-t-zinc-600",
};

function LeadCard({
  lead,
  dragging,
  onDragStart,
  onDragEnd,
}: {
  lead: Lead;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`cursor-grab rounded-lg border border-border bg-background p-3 shadow-sm transition-opacity active:cursor-grabbing ${
        dragging ? "opacity-40" : ""
      }`}
    >
      <ConversationLink conversationId={lead.conversation_id}>
        <p className="text-sm font-medium">
          {lead.customer_name ?? "Unidentified"}
        </p>
      </ConversationLink>
      <p className="truncate text-xs text-muted">
        {lead.company_name ?? lead.conversation_id}
      </p>
      <div className="mt-2 flex items-center justify-between">
        <ScoreBar score={lead.score} />
        <span className="text-[11px] text-muted/70">
          {timeAgo(lead.last_message_at ?? lead.scored_at)}
        </span>
      </div>
    </div>
  );
}

export function PipelineBoard({ leads }: { leads: Lead[] }) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<LeadCategory | null>(
    null,
  );
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

  const byColumn = (category: LeadCategory) =>
    optimisticLeads
      .filter((lead) => lead.category === category)
      .sort((a, b) => b.score - a.score);

  function handleDrop(category: LeadCategory) {
    setDragOverColumn(null);
    const conversationId = draggingId;
    setDraggingId(null);
    if (!conversationId) return;
    const lead = optimisticLeads.find(
      (l) => l.conversation_id === conversationId,
    );
    if (!lead || lead.category === category) return;

    startTransition(async () => {
      applyOptimisticMove({ conversationId, category });
      await moveLeadCategory(conversationId, category);
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {COLUMNS.map((category) => {
        const columnLeads = byColumn(category);
        const isOver = dragOverColumn === category;
        return (
          <div
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
              handleDrop(category);
            }}
            className={`flex flex-col rounded-xl border border-border border-t-2 bg-surface/40 ${COLUMN_ACCENT[category]} ${
              isOver ? "ring-2 ring-blue-500/50" : ""
            }`}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <h3 className="text-sm font-semibold">
                {CATEGORY_LABELS[category]}
              </h3>
              <span className="rounded-full bg-border px-2 py-0.5 text-xs tabular-nums text-muted">
                {columnLeads.length}
              </span>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-3">
              {columnLeads.length === 0 ? (
                <p className="px-2 py-6 text-center text-xs text-muted">
                  Drop a lead here
                </p>
              ) : (
                columnLeads.map((lead) => (
                  <LeadCard
                    key={lead.conversation_id}
                    lead={lead}
                    dragging={draggingId === lead.conversation_id}
                    onDragStart={() => setDraggingId(lead.conversation_id)}
                    onDragEnd={() => setDraggingId(null)}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
