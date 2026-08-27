"use client";

import { useActionState } from "react";
import { SURFACE_FIELD_CLASS } from "@/components/form-styles";
import { addAccessory, type AccessoryFormState } from "./actions";

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

/** Type in an accessory/part directly — no Sheet sync, no file upload. The
 * paste-in workflow the client actually uses today, kept as simple as
 * "Paste specifications" is for machines (upload-form.tsx). */
export function AddAccessoryForm() {
  const [state, action, pending] = useActionState(addAccessory, null);

  return (
    <form action={action} className="space-y-3 px-5 py-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="name">
            Name *
          </label>
          <input
            id="name"
            name="name"
            required
            placeholder="Diamond Cutting Blade 14&quot;"
            className={`mt-1 ${field}`}
          />
        </div>
        <div>
          <label className={label} htmlFor="category">
            Category
          </label>
          <input
            id="category"
            name="category"
            placeholder="Cutting accessories"
            className={`mt-1 ${field}`}
          />
        </div>
      </div>
      <div>
        <label className={label} htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Fits Concrete Cutting & Finishing machines. General-purpose diamond blade for reinforced concrete and asphalt."
          className={`mt-1 ${field}`}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
      >
        {pending ? "Adding…" : "Add accessory"}
      </button>
      <Result state={state} />
    </form>
  );
}
