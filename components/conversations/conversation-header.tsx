import Link from "next/link";
import type { ReactNode } from "react";
import { contactInitials } from "./conversation-list";

export function ConversationHeader({
  channel,
  backHref,
  name,
  subtitle,
  badge,
}: {
  channel: "telegram" | "whatsapp";
  backHref: string;
  name: string;
  subtitle: ReactNode;
  badge?: ReactNode;
}) {
  const avatar =
    channel === "telegram"
      ? "bg-sky-500/12 text-sky-700 dark:text-sky-300"
      : "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300";
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-3 sm:px-4">
      <Link
        href={backHref}
        aria-label={`Back to ${channel} conversations`}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-surface hover:text-foreground md:hidden"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </Link>
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold ${avatar}`}
      >
        {contactInitials(name)}
      </span>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-sm font-semibold">{name}</h1>
        <p className="truncate text-xs text-muted">{subtitle}</p>
      </div>
      {badge}
    </header>
  );
}
