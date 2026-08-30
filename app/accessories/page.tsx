import Link from "next/link";
import { getAccessories, getMachines } from "@/lib/api";
import { Card, EmptyState } from "@/components/ui";
import { removeAccessory } from "./actions";
import { AddAccessoryForm } from "./add-accessory-form";
import { AccessoryRowActions } from "./edit-accessory-form";
import { MachineSelect } from "./machine-select";
import { DataStateNotice } from "@/components/data-state-notice";
import { WorkspaceHeader } from "@/components/workspace";

export const dynamic = "force-dynamic";

/** Each accessory belongs to exactly one machine (the client's own
 * workflow: pick a machine, then add its accessories) — so this page picks
 * a machine first via a plain GET-navigating select, then shows/edits only
 * that machine's accessories. No machine chosen yet means no accessories
 * section at all, rather than a flat cross-machine list. */
export default async function AccessoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ machine_id?: string }>;
}) {
  const { machine_id: machineId } = await searchParams;
  const machinesResult = await getMachines();
  const { machines } = machinesResult;
  const selectedMachine = machines.find((m) => m.id === machineId);

  const accessoriesResult = machineId
    ? await getAccessories({ machineId })
    : { accessories: [], _dataState: undefined };
  const { accessories } = accessoriesResult;

  return (
    <div className="space-y-6">
      <DataStateNotice
        states={[
          machinesResult._dataState,
          ...(accessoriesResult._dataState ? [accessoriesResult._dataState] : []),
        ]}
      />
      <WorkspaceHeader
        title="Accessories & parts"
        description="Each machine has its own accessories — choose a machine, then add or edit what comes with it. Typed in directly and indexed immediately so the agent can recommend them once a deal is confirmed."
      />

      <Card title="Choose a machine">
        <MachineSelect machines={machines} selectedId={machineId} />
      </Card>

      {!machineId ? (
        <Card>
          <EmptyState
            title="No machine selected"
            hint="Choose a machine above to see or add its accessories."
          />
        </Card>
      ) : !selectedMachine ? (
        <Card>
          <EmptyState
            title="Machine not found"
            hint="It may have been removed from the catalog."
          />
        </Card>
      ) : (
        <>
          <Card title={`Add an accessory for ${selectedMachine.name}`}>
            <AddAccessoryForm machineId={machineId} />
          </Card>

          <Card title={`${accessories.length} accessor${accessories.length === 1 ? "y" : "ies"} for ${selectedMachine.name}`}>
            {accessories.length === 0 ? (
              <EmptyState
                title="No accessories added yet for this machine"
                hint="Add one above — it becomes recommendable in chat once a deal is confirmed."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                      <th className="px-5 py-2.5 font-medium">Name</th>
                      <th className="px-5 py-2.5 font-medium">Category</th>
                      <th className="px-5 py-2.5 font-medium">Description</th>
                      <th className="px-5 py-2.5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/70">
                    {accessories.map((accessory) => (
                      <tr
                        key={accessory.id}
                        className="transition-colors hover:bg-surface"
                      >
                        <td className="px-5 py-3 align-top text-foreground">
                          {accessory.name}
                        </td>
                        <td className="px-5 py-3 align-top text-muted">
                          {accessory.category ?? "—"}
                        </td>
                        <td className="max-w-xs px-5 py-3 align-top text-muted">
                          <span className="line-clamp-2">
                            {accessory.description ?? "—"}
                          </span>
                        </td>
                        <td className="px-5 py-3 align-top text-right">
                          <div className="flex flex-wrap items-start justify-end gap-1">
                            <AccessoryRowActions accessory={accessory} />
                            <form action={removeAccessory}>
                              <input type="hidden" name="id" value={accessory.id} />
                              <button
                                type="submit"
                                className="rounded-md px-2 py-1 text-xs text-muted transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                              >
                                Remove
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <p className="text-xs text-muted">
            Wrong machine?{" "}
            <Link href="/accessories" className="text-blue-600 dark:text-blue-400">
              Choose a different one
            </Link>
            .
          </p>
        </>
      )}
    </div>
  );
}
