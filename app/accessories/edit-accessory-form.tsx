"use client";

import { useActionState, useState } from "react";
import type { Accessory } from "@/lib/api";
import { SURFACE_FIELD_CLASS } from "@/components/form-styles";
import { editAccessory, type AccessoryFormState } from "./actions";

const field = SURFACE_FIELD_CLASS;
const label = "block text-xs font-medium uppercase tracking-wide text-muted";

function Result({ state }: { state: AccessoryFormState | null }) {
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

export function AccessoryRowActions({ accessory }: { accessory: Accessory }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(editAccessory, null);

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
          <form
            action={action}
            className="space-y-3 rounded-lg border border-border bg-surface px-4 py-3"
          >
            <input type="hidden" name="id" value={accessory.id} />
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={label} htmlFor={`name-${accessory.id}`}>
                  Name *
                </label>
                <input
                  id={`name-${accessory.id}`}
                  name="name"
                  required
                  defaultValue={accessory.name}
                  className={`mt-1 ${field}`}
                />
              </div>
              <div>
                <label className={label} htmlFor={`category-${accessory.id}`}>
                  Category
                </label>
                <input
                  id={`category-${accessory.id}`}
                  name="category"
                  defaultValue={accessory.category ?? ""}
                  className={`mt-1 ${field}`}
                />
              </div>
            </div>
            <div>
              <label className={label} htmlFor={`desc-${accessory.id}`}>
                Description
              </label>
              <textarea
                id={`desc-${accessory.id}`}
                name="description"
                rows={3}
                defaultValue={accessory.description ?? ""}
                className={`mt-1 ${field}`}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-foreground/80">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={accessory.is_active}
                className="h-4 w-4 rounded border-border"
              />
              Active in catalog
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
