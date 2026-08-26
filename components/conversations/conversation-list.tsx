import Link from "next/link";
import type { ReactNode } from "react";

type ChannelTone = "telegram" | "whatsapp";

const TONES = {
  telegram: {
    avatar: "bg-sky-500/12 text-sky-700 dark:text-sky-300",
    active: "bg-sky-500/10",
    focus: "focus-visible:outline-sky-500",
    input:
      "focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15",
    filter: "bg-sky-600 text-white",
  },
  whatsapp: {
    avatar: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
    active: "bg-emerald-500/10",
    focus: "focus-visible:outline-emerald-500",
    input:
      "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15",
    filter: "bg-emerald-600 text-white",
  },
} as const;

export function contactInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "?"
  );
}

export function ConversationListShell({
  channel,
  activeId,
  title,
  subtitle,
  status,
  searchAction,
  searchId,
  searchPlaceholder,
  query,
  hiddenFields,
  filters,
  activeFilter,
  emptyTitle,
  emptyHint,
  footer,
  children,
}: {
  channel: ChannelTone;
  activeId?: string;
  title: string;
  subtitle: ReactNode;
  status: ReactNode;
  searchAction: string;
  searchId: string;
  searchPlaceholder: string;
  query?: string;
  hiddenFields?: Record<string, string>;
  filters?: ReadonlyArray<{ value: string; label: string; href: string }>;
  activeFilter?: string;
  emptyTitle?: string;
  emptyHint?: string;
  /** Rendered under the rows — used for "Load more" pagination. */
  footer?: ReactNode;
  children?: ReactNode;
}) {
  const tone = TONES[channel];
  const empty = !children;

  return (
    <aside
      aria-label={`${title} conversations`}
      className={`min-h-0 flex-col border-r border-border bg-surface/35 md:flex ${
        activeId ? "hidden" : "flex"
      } md:w-[18rem] md:shrink-0 xl:w-[19.5rem]`}
    >
      <div className="border-b border-border p-3">
        <div className="flex items-center justify-between gap-3 px-1 pb-3">
          <div>
            <h1 className="text-base font-semibold tracking-tight">{title}</h1>
            <div className="text-xs text-muted">{subtitle}</div>
          </div>
          {status}
        </div>
        <form action={searchAction} role="search">
          {Object.entries(hiddenFields ?? {}).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
          <label htmlFor={searchId} className="sr-only">
            Search {title} conversations
          </label>
          <div className="relative">
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
            <input
              id={searchId}
              name="q"
              defaultValue={query}
              placeholder={searchPlaceholder}
              className={`h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm placeholder:text-muted/70 focus:outline-none ${tone.input}`}
            />
          </div>
        </form>
        {filters && filters.length > 0 && (
          <nav aria-label={`Filter ${title} conversations`} className="mt-3 flex gap-1">
            {filters.map((filter) => {
              const active = activeFilter === filter.value;
              return (
                <Link
                  key={filter.value}
                  href={filter.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-md px-2 py-1 text-xs font-medium transition ${
                    active
                      ? tone.filter
                      : "text-muted hover:bg-background hover:text-foreground"
                  }`}
                >
                  {filter.label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {empty ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm font-medium">{emptyTitle}</p>
            {emptyHint && (
              <p className="mt-1 text-xs leading-5 text-muted">{emptyHint}</p>
            )}
          </div>
        ) : (
          <>
            <ul className="divide-y divide-border/70">{children}</ul>
            {footer}
          </>
        )}
      </div>
    </aside>
  );
}

export function ConversationListRow({
  channel,
  href,
  active,
  name,
  timestamp,
  preview,
  previewPrefix,
  badges,
}: {
  channel: ChannelTone;
  href: string;
  active: boolean;
  name: string;
  timestamp: string;
  preview: string;
  previewPrefix?: ReactNode;
  badges?: ReactNode;
}) {
  const tone = TONES[channel];
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`flex gap-3 px-3.5 py-3 transition-colors focus-visible:outline-2 focus-visible:outline-inset ${tone.focus} ${
          active ? tone.active : "hover:bg-background/80"
        }`}
      >
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-semibold ${tone.avatar}`}
        >
          {contactInitials(name)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className="truncate text-sm font-medium">{name}</span>
            <span className="shrink-0 text-[11px] text-muted">{timestamp}</span>
          </span>
          <span className="mt-0.5 block truncate text-xs text-muted">
            {previewPrefix}
            {preview}
          </span>
          {badges && <span className="mt-2 flex items-center gap-1.5">{badges}</span>}
        </span>
      </Link>
    </li>
  );
}
