"use client";

import { useRouter } from "next/navigation";
import type { DataState } from "@/lib/api";

export function DataStateNotice({ states }: { states: DataState[] }) {
  const router = useRouter();
  const unavailable = states.find((state) => state.status === "unavailable");

  if (!unavailable) return null;

  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-between gap-3 border-y border-amber-500/30 bg-amber-500/8 px-4 py-3 text-sm"
    >
      <div>
        <p className="font-medium text-amber-900 dark:text-amber-200">
          Live data is temporarily unavailable
        </p>
        <p className="mt-0.5 text-xs text-amber-800/80 dark:text-amber-300/75">
          {unavailable.message} Empty values below are fallbacks, not confirmed
          results.
        </p>
      </div>
      <button
        type="button"
        onClick={() => router.refresh()}
        className="rounded-md border border-amber-600/30 px-3 py-1.5 text-xs font-semibold text-amber-900 transition hover:bg-amber-500/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 dark:text-amber-200"
      >
        Retry
      </button>
    </div>
  );
}
