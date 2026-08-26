"use client";

import { usePathname } from "next/navigation";
import type { RefObject } from "react";
import { GlobalSearch } from "./global-search";

const TITLES: Record<string, string> = {
  "/": "Overview",
  "/leads": "Leads",
  "/handovers": "Handovers",
  "/customers": "Customers",
  "/machines": "Product catalog",
  "/reports": "Reports",
  "/logs": "AI performance",
  "/operations/health": "Service health",
  "/opt-outs": "Compliance",
};

function titleFor(pathname: string): string {
  if (pathname.startsWith("/conversations/telegram")) return "Telegram inbox";
  if (pathname.startsWith("/conversations/whatsapp")) return "WhatsApp";
  if (pathname.startsWith("/conversations/")) return "Conversation";
  return TITLES[pathname] ?? "Sales CRM";
}

export function TopBar({
  navigationTriggerRef,
  onOpenNavigation,
}: {
  navigationTriggerRef: RefObject<HTMLButtonElement | null>;
  onOpenNavigation: () => void;
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/92 px-4 backdrop-blur-md sm:px-6 lg:px-8 xl:px-10">
      <button
        ref={navigationTriggerRef}
        type="button"
        onClick={onOpenNavigation}
        aria-label="Open navigation"
        className="-ml-2 grid h-10 w-10 place-items-center rounded-lg text-muted transition hover:bg-surface hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 lg:hidden"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold tracking-tight text-foreground">
          {titleFor(pathname)}
        </p>
        <p className="hidden text-[11px] text-muted sm:block">
          Divine Empire Sales CRM
        </p>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden w-[min(28vw,22rem)] sm:block">
          <GlobalSearch />
        </div>
        <div className="sm:hidden">
          <GlobalSearch compact />
        </div>
        <span className="hidden items-center gap-2 text-xs text-muted xl:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Secure workspace
        </span>
      </div>
    </header>
  );
}
