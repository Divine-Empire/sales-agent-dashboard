"use client";

import { SURFACE_FIELD_CLASS } from "@/components/form-styles";
import type { Machine } from "@/lib/api";

/** Plain GET-navigating machine picker — no client state beyond the native
 * select, submits the form (and so navigates to ?machine_id=...) the moment
 * a machine is chosen. Needs "use client" only for the onChange handler;
 * the page itself stays a Server Component. */
export function MachineSelect({
  machines,
  selectedId,
}: {
  machines: Machine[];
  selectedId?: string;
}) {
  return (
    <form method="get" className="px-5 py-4">
      <label className="block text-xs font-medium uppercase tracking-wide text-muted">
        Machine
      </label>
      <select
        name="machine_id"
        defaultValue={selectedId ?? ""}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className={`mt-1 max-w-md ${SURFACE_FIELD_CLASS}`}
      >
        <option value="" disabled>
          Select a machine…
        </option>
        {machines.map((machine) => (
          <option key={machine.id} value={machine.id}>
            {machine.name} ({machine.machine_code})
          </option>
        ))}
      </select>
    </form>
  );
}
