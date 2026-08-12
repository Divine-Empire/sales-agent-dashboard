import type { LeadCategory } from "./api";

/** Category colours. Hot must read as urgent at a glance — a rep scanning this
 * table is deciding who to call next. */
export const CATEGORY_STYLES: Record<LeadCategory, string> = {
  hot: "bg-red-500/15 text-red-400 ring-red-500/30",
  warm: "bg-amber-500/15 text-amber-400 ring-amber-500/30",
  cold: "bg-sky-500/15 text-sky-400 ring-sky-500/30",
  not_interested: "bg-zinc-500/15 text-zinc-400 ring-zinc-500/30",
};

export const CATEGORY_LABELS: Record<LeadCategory, string> = {
  hot: "Hot",
  warm: "Warm",
  cold: "Cold",
  not_interested: "Not interested",
};

export function titleCase(value: string | null | undefined): string {
  if (!value) return "—";
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Relative time — "2h ago" tells a rep more than a timestamp when they are
 * deciding whether a lead is still warm. */
export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** `telegram:5377541635` → `telegram` / `5377541635` */
export function splitConversationId(id: string): [string, string] {
  const index = id.indexOf(":");
  if (index === -1) return ["unknown", id];
  return [id.slice(0, index), id.slice(index + 1)];
}
