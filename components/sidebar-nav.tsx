"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Grouped so new pages have an obvious place to land — a flat list gets
 * unreadable past ~8 items, which this project will exceed. */
const NAV_GROUPS: {
  label: string;
  items: { href: string; label: string; icon: string }[];
}[] = [
  {
    label: "Conversations",
    items: [
      { href: "/conversations/telegram", label: "Telegram", icon: "send" },
      {
        href: "/conversations/whatsapp",
        label: "WhatsApp",
        icon: "message",
      },
    ],
  },
  {
    label: "Pipeline",
    items: [
      { href: "/", label: "Overview", icon: "grid" },
      { href: "/leads", label: "Leads", icon: "list" },
      { href: "/handovers", label: "Handovers", icon: "handoff" },
    ],
  },
  {
    label: "Records",
    items: [
      { href: "/customers", label: "Customers", icon: "users" },
      { href: "/machines", label: "Catalog", icon: "box" },
    ],
  },
  {
    label: "Insights",
    items: [{ href: "/reports", label: "Reports", icon: "chart" }],
  },
  {
    label: "Operations",
    items: [
      { href: "/operations/health", label: "Service health", icon: "pulse" },
      { href: "/logs", label: "AI performance", icon: "cpu" },
    ],
  },
  {
    label: "Compliance",
    items: [{ href: "/opt-outs", label: "Opt-outs", icon: "shield" }],
  },
];

const ICONS: Record<string, React.ReactNode> = {
  grid: (
    <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" />
  ),
  list: <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />,
  handoff: (
    <path d="M8 12h8m-4-4l4 4-4 4M4 6v12a2 2 0 002 2h4M20 6v12a2 2 0 01-2 2h-4" />
  ),
  users: (
    <path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm8 3.13a4 4 0 010 7.75M16 3.13a4 4 0 010 7.75" />
  ),
  box: (
    <path d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8" />
  ),
  chart: <path d="M3 3v18h18M8 17V9m4 8V5m4 12v-6" />,
  cpu: (
    <path d="M9 3v2m6-2v2M9 19v2m6-2v2M3 9h2M3 15h2M19 9h2M19 15h2M7 7h10v10H7V7z" />
  ),
  shield: (
    <path d="M12 3l8 4v5c0 5-4 8-8 9-4-1-8-4-8-9V7l8-4zM9.5 12l1.8 1.8L14.5 10" />
  ),
  send: (
    <path d="m21 4-7.6 16-4.3-6.2L3 10l18-6ZM9.1 13.8l4.3 2.7V20" />
  ),
  message: (
    <path d="M20 11.5a8 8 0 0 1-11.8 7L3 20l1.5-5.1A8 8 0 1 1 20 11.5Z" />
  ),
  pulse: <path d="M3 12h4l2.2-5 4.2 10 2.1-5H21" strokeLinecap="round" />,
  panel: <path d="M4 4h16v16H4V4zm5 0v16" />,
};

function Icon({ name }: { name: string }) {
  return (
    <svg
      className="h-4 w-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinejoin="round"
    >
      {ICONS[name]}
    </svg>
  );
}

export function SidebarNav({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p
            className={`mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted/70 ${
              collapsed ? "lg:hidden" : ""
            }`}
          >
              {group.label}
          </p>
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-blue-500/10 font-medium text-blue-700 ring-1 ring-inset ring-blue-500/15 dark:text-blue-300"
                      : "text-muted hover:bg-border/50 hover:text-foreground"
                  }`}
                >
                  <Icon name={item.icon} />
                  <span className={`truncate ${collapsed ? "lg:hidden" : ""}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function SidebarCollapseButton({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-border/50 hover:text-foreground"
    >
      <Icon name="panel" />
      {!collapsed && <span>Collapse</span>}
    </button>
  );
}
