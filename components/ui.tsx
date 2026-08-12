import Link from "next/link";
import type { LeadCategory } from "@/lib/api";
import { CATEGORY_LABELS, CATEGORY_STYLES } from "@/lib/format";

export function Card({
  title,
  action,
  children,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/40">
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3.5">
          {title && (
            <h2 className="text-sm font-semibold text-zinc-200">{title}</h2>
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "hot" | "warm" | "cold";
}) {
  const toneClass = {
    default: "text-zinc-100",
    hot: "text-red-400",
    warm: "text-amber-400",
    cold: "text-sky-400",
  }[tone];
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className={`mt-1.5 text-3xl font-semibold tabular-nums ${toneClass}`}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

export function CategoryBadge({ category }: { category: LeadCategory | null }) {
  if (!category) {
    return <span className="text-zinc-600">—</span>;
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${CATEGORY_STYLES[category]}`}
    >
      {CATEGORY_LABELS[category]}
    </span>
  );
}

/** Score bar. The number alone does not convey "how close to 100" at a glance
 * when a rep is scanning twenty rows. */
export function ScoreBar({ score }: { score: number }) {
  const tone =
    score >= 70 ? "bg-red-500" : score >= 40 ? "bg-amber-500" : "bg-sky-500";
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-8 text-sm font-semibold tabular-nums">{score}</span>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full ${tone}`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
    </div>
  );
}

/** Horizontal bar. CSS widths rather than a charting library — for ranked
 * counts a div is legible, dependency-free, and renders server-side. */
export function BarRow({
  label,
  value,
  max,
  tone = "blue",
}: {
  label: string;
  value: number;
  max: number;
  tone?: "blue" | "sky";
}) {
  const width = Math.max(2, Math.round((value / max) * 100));
  const bar = tone === "sky" ? "bg-sky-500/70" : "bg-blue-500/70";
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-40 shrink-0 truncate text-zinc-300" title={label}>
        {label}
      </span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full ${bar}`}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="w-8 shrink-0 text-right tabular-nums text-zinc-400">
        {value}
      </span>
    </div>
  );
}

/** Conversion funnel. Each stage shows its own count plus the drop-off from the
 * stage above — the drop-off is the number a sales manager actually acts on. */
export function Funnel({
  stages,
}: {
  stages: { stage: string; count: number }[];
}) {
  const top = Math.max(1, stages[0]?.count ?? 1);
  return (
    <ol className="space-y-3 px-5 py-4">
      {stages.map((stage, index) => {
        const width = Math.max(4, Math.round((stage.count / top) * 100));
        const previous = stages[index - 1]?.count;
        const dropped =
          previous !== undefined && previous > 0
            ? Math.round(((previous - stage.count) / previous) * 100)
            : null;
        return (
          <li key={stage.stage}>
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-zinc-300">{stage.stage}</span>
              <span className="tabular-nums text-zinc-400">
                {stage.count}
                {dropped !== null && dropped > 0 && (
                  <span className="ml-2 text-xs text-zinc-600">
                    −{dropped}%
                  </span>
                )}
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
                style={{ width: `${width}%` }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="px-5 py-12 text-center">
      <p className="text-sm text-zinc-400">{title}</p>
      {hint && <p className="mt-1 text-xs text-zinc-600">{hint}</p>}
    </div>
  );
}

export function ConversationLink({
  conversationId,
  children,
}: {
  conversationId: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={`/conversations/${encodeURIComponent(conversationId)}`}
      className="text-blue-400 transition-colors hover:text-blue-300"
    >
      {children}
    </Link>
  );
}
