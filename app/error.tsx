"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[dashboard] route failed", error);
  }, [error]);

  return (
    <div className="grid min-h-[60vh] place-items-center px-4">
      <div className="max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-600 dark:text-red-400">
          Workspace error
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          This page could not be displayed
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Your session and other CRM pages are unaffected. Retry this view, and
          check the service status if the problem continues.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
