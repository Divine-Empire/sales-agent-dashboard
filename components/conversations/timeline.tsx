"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function TimelineViewport({
  label,
  updateKey,
  children,
}: {
  label: string;
  updateKey: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [updateKey]);
  return (
    <div
      ref={ref}
      aria-label={label}
      className="min-h-0 flex-1 overflow-y-auto bg-background px-4 py-4 sm:px-5"
    >
      <ol className="mx-auto max-w-[46rem] space-y-1.5">{children}</ol>
    </div>
  );
}

export function TimelineDateSeparator({ label }: { label: string }) {
  return (
    <div className="my-3 flex items-center gap-3" aria-label={label}>
      <span className="h-px flex-1 bg-border" />
      <span className="text-[11px] font-medium text-muted">{label}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
