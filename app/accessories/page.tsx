import { getAccessories } from "@/lib/api";
import { Card, EmptyState, Stat } from "@/components/ui";
import { removeAccessory } from "./actions";
import { AddAccessoryForm } from "./add-accessory-form";
import { AccessoryRowActions } from "./edit-accessory-form";
import { DataStateNotice } from "@/components/data-state-notice";
import { WorkspaceHeader } from "@/components/workspace";

export const dynamic = "force-dynamic";

export default async function AccessoriesPage() {
  const accessoriesResult = await getAccessories();
  const { accessories } = accessoriesResult;

  const categories = new Set(
    accessories.map((accessory) => accessory.category).filter(Boolean),
  ).size;

  return (
    <div className="space-y-6">
      <DataStateNotice states={[accessoriesResult._dataState]} />
      <WorkspaceHeader
        title="Accessories & parts"
        description="Typed in directly — no document upload needed. Each one is indexed immediately so the agent can recommend it in chat. Not yet linked to a specific machine; that's a later pass."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Stat label="Accessories" value={accessories.length} />
        <Stat label="Categories" value={categories} />
      </div>

      <Card title="Add an accessory or part">
        <AddAccessoryForm />
      </Card>

      <Card title={`${accessories.length} in catalog`}>
        {accessories.length === 0 ? (
          <EmptyState
            title="No accessories added yet"
            hint="Add one above — it becomes recommendable in chat right away."
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
    </div>
  );
}
