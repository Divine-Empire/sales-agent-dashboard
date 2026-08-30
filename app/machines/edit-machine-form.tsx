"use client";

import { useActionState, useState } from "react";
import type { Machine } from "@/lib/api";
import { SURFACE_FIELD_CLASS } from "@/components/form-styles";
import { editMachine, type EditState } from "./actions";

const field = SURFACE_FIELD_CLASS;
const label = "block text-xs font-medium uppercase tracking-wide text-muted";

function Result({ state }: { state: EditState | null }) {
  if (!state) return null;
  return (
    <p
      className={`rounded-lg px-3 py-2 text-sm ring-1 ring-inset ${
        state.ok
          ? "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30"
          : "bg-red-500/10 text-red-300 ring-red-500/30"
      }`}
    >
      {state.message}
    </p>
  );
}

/** Inline per-row edit for a knowledge-base machine's own fields. The values shown
 * (name, category, description, price, lead time, active) are whatever RAG
 * ingestion or a prior edit produced — this form is how a rep corrects them
 * without re-uploading the source document. Toggling "open" swaps the
 * summary row for a small edit form beneath it. */
export function MachineRowActions({ machine }: { machine: Machine }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(editMachine, null);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-md px-2 py-1 text-xs text-muted transition-colors hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400"
      >
        {open ? "Close" : "Edit"}
      </button>
      {open && (
        <div className="mt-2 w-full text-left">
          <form action={action} className="space-y-3 rounded-lg border border-border bg-surface px-4 py-3">
            <input type="hidden" name="id" value={machine.id} />
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={label} htmlFor={`name-${machine.id}`}>
                  Machine name *
                </label>
                <input
                  id={`name-${machine.id}`}
                  name="name"
                  required
                  defaultValue={machine.name}
                  className={`mt-1 ${field}`}
                />
              </div>
              <div>
                <label className={label} htmlFor={`category-${machine.id}`}>
                  Category *
                </label>
                <input
                  id={`category-${machine.id}`}
                  name="category"
                  required
                  defaultValue={machine.category}
                  className={`mt-1 ${field}`}
                />
              </div>
              <div>
                <label className={label} htmlFor={`price-${machine.id}`}>
                  Price range
                </label>
                <input
                  id={`price-${machine.id}`}
                  name="price_range"
                  defaultValue={machine.price_range ?? ""}
                  className={`mt-1 ${field}`}
                />
              </div>
              <div>
                <label className={label} htmlFor={`lead-${machine.id}`}>
                  Lead time
                </label>
                <input
                  id={`lead-${machine.id}`}
                  name="lead_time"
                  defaultValue={machine.lead_time ?? ""}
                  className={`mt-1 ${field}`}
                />
              </div>
            </div>
            <div>
              <label className={label} htmlFor={`desc-${machine.id}`}>
                Description
              </label>
              <textarea
                id={`desc-${machine.id}`}
                name="description"
                rows={3}
                defaultValue={machine.description ?? ""}
                className={`mt-1 ${field}`}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-foreground/80">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={machine.is_active}
                className="h-4 w-4 rounded border-border"
              />
              Active in knowledge base
            </label>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={pending}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
              >
                {pending ? "Saving…" : "Save changes"}
              </button>
              <Result state={state} />
            </div>
          </form>
        </div>
      )}
    </>
  );
}
