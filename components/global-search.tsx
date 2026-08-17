"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface SearchResult {
  type: "lead" | "customer";
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

/** Debounced client search hitting /api/search — see that route for why it's
 * a Route Handler rather than calling the backend directly from here (the API
 * key must never reach browser JavaScript). */
export function GlobalSearch({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (query.trim().length < 2) {
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results ?? []);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={compact ? "Search leads and customers" : undefined}
        className={`flex items-center gap-3 rounded-lg border border-border bg-surface text-sm text-muted transition-colors hover:border-muted/40 hover:text-foreground ${
          compact ? "h-10 w-10 justify-center" : "w-full px-3 py-2"
        }`}
      >
        <svg
          className="h-4 w-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
        </svg>
        {!compact && (
          <>
            <span className="flex-1 truncate text-left">Search…</span>
            <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted">
              ⌘K
            </kbd>
          </>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-start justify-center bg-slate-950/50 px-4 pt-[12vh] backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="global-search-title"
            className="w-full max-w-lg rounded-xl border border-border bg-background shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <h2 id="global-search-title" className="sr-only">
                Search leads and customers
              </h2>
              <svg
                className="h-4 w-4 shrink-0 text-muted"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => {
                  const next = event.target.value;
                  setQuery(next);
                  if (next.trim().length < 2) {
                    setResults([]);
                    setLoading(false);
                  } else {
                    setLoading(true);
                  }
                }}
                placeholder="Search leads and customers by name, company, or phone…"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
              />
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {loading && (
                <p className="px-3 py-6 text-center text-sm text-muted">
                  Searching…
                </p>
              )}
              {!loading && query.trim().length >= 2 && results.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-muted">
                  No matches for &ldquo;{query}&rdquo;
                </p>
              )}
              {!loading &&
                results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    type="button"
                    onClick={() => go(result.href)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-surface"
                  >
                    <span>
                      <span className="font-medium text-foreground">
                        {result.title}
                      </span>
                      <span className="ml-2 text-muted">
                        {result.subtitle}
                      </span>
                    </span>
                    <span className="shrink-0 rounded bg-surface px-1.5 py-0.5 text-[10px] uppercase text-muted">
                      {result.type}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
