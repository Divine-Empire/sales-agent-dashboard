import type { ReactNode } from "react";

export function DataTable({ minWidth, children }: { minWidth: string; children: ReactNode }) {
  return <div className="overflow-x-auto"><table className={`w-full text-sm ${minWidth}`}>{children}</table></div>;
}

export function DataTableHeader({ children }: { children: ReactNode }) {
  return <thead><tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">{children}</tr></thead>;
}

export function DataTableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-border/70">{children}</tbody>;
}

export function DataTableRow({ children }: { children: ReactNode }) {
  return <tr className="transition-colors hover:bg-surface">{children}</tr>;
}
