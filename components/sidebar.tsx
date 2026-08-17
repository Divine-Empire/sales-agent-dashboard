"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { SidebarCollapseButton, SidebarNav } from "./sidebar-nav";
import { ThemeToggle } from "./theme-toggle";
import { logout } from "@/app/login/actions";

/** The persistent frame every page renders inside. This — not any single
 * page — is what makes navigating feel like one app with sections rather
 * than nine unrelated pages: the shell never unmounts between routes. */
export function Sidebar({
  mobileOpen,
  onMobileClose,
}: {
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const mobileDrawerRef = useRef<HTMLElement>(null);
  const collapsed = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("sidebar-preference", onStoreChange);
      window.addEventListener("storage", onStoreChange);
      return () => {
        window.removeEventListener("sidebar-preference", onStoreChange);
        window.removeEventListener("storage", onStoreChange);
      };
    },
    () => localStorage.getItem("sidebar-collapsed") === "1",
    () => false,
  );

  function toggleCollapsed() {
    localStorage.setItem("sidebar-collapsed", collapsed ? "0" : "1");
    window.dispatchEvent(new Event("sidebar-preference"));
  }

  useEffect(() => {
    if (!mobileOpen) return;

    const drawer = mobileDrawerRef.current;
    const selector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    drawer?.querySelector<HTMLElement>(selector)?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onMobileClose();
        return;
      }
      if (event.key !== "Tab" || !drawer) return;

      const items = Array.from(drawer.querySelectorAll<HTMLElement>(selector));
      if (items.length === 0) return;
      const first = items[0];
      const last = items.at(-1)!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, onMobileClose]);

  return (
    <>
      <button
        type="button"
        aria-label="Close navigation"
        onClick={onMobileClose}
        className={`fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[1px] transition-opacity lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        ref={mobileDrawerRef}
        role={mobileOpen ? "dialog" : undefined}
        aria-modal={mobileOpen ? "true" : undefined}
        aria-label="Primary navigation"
        className={`fixed inset-y-0 left-0 z-50 flex h-svh w-72 shrink-0 flex-col border-r border-border bg-surface transition-[transform,width] duration-200 ease-out lg:visible lg:sticky lg:top-0 lg:z-20 lg:translate-x-0 ${
          mobileOpen
            ? "visible translate-x-0 shadow-2xl"
            : "invisible -translate-x-full"
        } ${collapsed ? "lg:w-[72px]" : "lg:w-64"}`}
      >
      <div
        className={`flex h-16 items-center gap-2.5 border-b border-border px-4 ${
          collapsed ? "lg:justify-center" : ""
        }`}
      >
        <Link
          href="/"
          onClick={onMobileClose}
          className={`flex min-w-0 items-center gap-2.5 ${
            collapsed ? "lg:justify-center" : ""
          }`}
        >
          <Image
            src="/logo_DE_dark.avif"
            alt="Divine Empire"
            width={28}
            height={22}
            className="h-7 w-auto shrink-0 dark:hidden"
            priority
          />
          <Image
            src="/logo_DE_light.avif"
            alt=""
            width={28}
            height={22}
            className="hidden h-7 w-auto shrink-0 dark:block"
            priority
          />
          <span
            className={`truncate text-sm font-semibold tracking-tight text-foreground ${
              collapsed ? "lg:hidden" : ""
            }`}
          >
            Divine Empire
            <span className="ml-1.5 font-normal text-muted">Sales</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            onMobileClose();
          }}
          aria-label="Close navigation"
          className="ml-auto grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-border/50 hover:text-foreground lg:hidden"
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
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <SidebarNav collapsed={collapsed} onNavigate={onMobileClose} />

      <div className="space-y-0.5 border-t border-border px-3 py-3">
        <ThemeToggle collapsed={collapsed} />
        <form action={logout}>
          <button
            type="submit"
            title={collapsed ? "Sign out" : undefined}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-border/50 hover:text-foreground"
          >
            <svg
              className="h-4 w-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M10 17l5-5-5-5M15 12H3M14 4h5a2 2 0 012 2v12a2 2 0 01-2 2h-5" />
            </svg>
            <span className={collapsed ? "lg:hidden" : ""}>Sign out</span>
          </button>
        </form>
        <div className="hidden lg:block">
          <SidebarCollapseButton
            collapsed={collapsed}
            onToggle={toggleCollapsed}
          />
        </div>
      </div>
      </aside>
    </>
  );
}
