"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navigationTriggerRef = useRef<HTMLButtonElement>(null);

  const closeMobileNavigation = useCallback(() => {
    setMobileNavOpen(false);
    requestAnimationFrame(() => navigationTriggerRef.current?.focus());
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  if (pathname === "/login") return children;

  return (
    <div className="flex min-h-svh bg-background">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Sidebar
        mobileOpen={mobileNavOpen}
        onMobileClose={closeMobileNavigation}
      />
      <div className="flex min-h-svh min-w-0 flex-1 flex-col">
        <TopBar
          navigationTriggerRef={navigationTriggerRef}
          onOpenNavigation={() => setMobileNavOpen(true)}
        />
        <main
          id="main-content"
          tabIndex={-1}
          className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-8 xl:px-10"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
