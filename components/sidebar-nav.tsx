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
    label: "Pipeline",
    items: [
      { href: "/", label: "Overview", icon: "grid" },
      { href: "/leads", label: "Leads", icon: "list" },
      { href: "/pipeline", label: "Pipeline board", icon: "columns" },
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
    items: [
      { href: "/reports", label: "Reports", icon: "chart" },
      { href: "/logs", label: "AI logs", icon: "cpu" },
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
  columns: <path d="M4 4h5v16H4V4zm7.5 0h5v16h-5V4zM19 4h1v16h-1V4z" />,
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
  search: <path d="M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-4.35-4.35" />,
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

export function SidebarNav({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          {!collapsed && (
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted/70">
              {group.label}
            </p>
          )}
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
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-blue-600 text-white"
                      : "text-muted hover:bg-border/50 hover:text-foreground"
                  }`}
                >
                  <Icon name={item.icon} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
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
