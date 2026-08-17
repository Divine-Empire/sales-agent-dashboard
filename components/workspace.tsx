import Link from "next/link";
import type { ReactNode } from "react";

export function WorkspaceHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <div className="mt-1 max-w-3xl text-sm leading-6 text-muted">
            {description}
          </div>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function PageToolbar({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-10 flex-wrap items-center justify-between gap-3">
      {children}
    </div>
  );
}

export function SegmentedControl({
  items,
  activeValue,
  ariaLabel,
}: {
  items: ReadonlyArray<{ value: string; label: string; href: string }>;
  activeValue: string;
  ariaLabel: string;
}) {
  return (
    <nav
      aria-label={ariaLabel}
      className="inline-flex max-w-full gap-1 overflow-x-auto rounded-xl bg-surface p-1 ring-1 ring-border"
    >
      {items.map((item) => {
        const active = activeValue === item.value;
        return (
          <Link
            key={item.value || "all"}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-500 ${
              active
                ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                : "text-muted hover:text-foreground"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "info" | "success" | "warning" | "danger" | "accent";
}) {
  const tones = {
    neutral: "bg-zinc-500/10 text-zinc-700 ring-zinc-500/20 dark:text-zinc-300",
    info: "bg-blue-500/10 text-blue-700 ring-blue-500/20 dark:text-blue-300",
    success:
      "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300",
    warning:
      "bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-300",
    danger: "bg-red-500/10 text-red-700 ring-red-500/20 dark:text-red-300",
    accent:
      "bg-purple-500/10 text-purple-700 ring-purple-500/20 dark:text-purple-300",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function DataSurface({
  title,
  meta,
  children,
  className = "",
}: {
  title?: ReactNode;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-border bg-surface ${className}`}
    >
      {(title || meta) && (
        <div className="flex min-h-14 items-center justify-between gap-3 border-b border-border px-5 py-3">
          {title && <h2 className="text-sm font-semibold text-foreground">{title}</h2>}
          {meta && <div className="text-xs text-muted">{meta}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
