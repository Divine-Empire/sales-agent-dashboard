"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { GlobalSearch } from "./global-search";
import { SidebarCollapseButton, SidebarNav } from "./sidebar-nav";
import { ThemeToggle } from "./theme-toggle";

/** The persistent frame every page renders inside. This — not any single
 * page — is what makes navigating feel like one app with sections rather
 * than nine unrelated pages: the shell never unmounts between routes. */
export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored === "1") setCollapsed(true);
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", next ? "1" : "0");
      return next;
    });
  }

  return (
    <aside
      className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-150 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <Link
        href="/"
        className={`flex items-center gap-2.5 border-b border-border px-4 py-4 ${
          collapsed ? "justify-center" : ""
        }`}
      >
        <Image
          src="/logo_DE_light.avif"
          alt="Divine Empire"
          width={28}
          height={22}
          className="h-7 w-auto shrink-0"
          priority
        />
        {!collapsed && (
          <span className="truncate text-sm font-semibold tracking-tight text-foreground">
            Divine Empire
            <span className="ml-1.5 font-normal text-muted">Sales</span>
          </span>
        )}
      </Link>

      <div className="px-3 pt-3">
        <GlobalSearch collapsed={collapsed} />
      </div>

      <SidebarNav collapsed={collapsed} />

      <div className="space-y-0.5 border-t border-border px-3 py-3">
        <ThemeToggle collapsed={collapsed} />
        <SidebarCollapseButton collapsed={collapsed} onToggle={toggleCollapsed} />
      </div>
    </aside>
  );
}
