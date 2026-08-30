import { getMachineDocuments, getMachines } from "@/lib/api";
import { formatDateTime, titleCase } from "@/lib/format";
import { Card, EmptyState, Stat } from "@/components/ui";
import { removeMachine } from "./actions";
import { AddMachineForm } from "./upload-form";
import { MachineRowActions } from "./edit-machine-form";
import { DocumentContentModal } from "./document-content-modal";
import { DataStateNotice } from "@/components/data-state-notice";
import { WorkspaceHeader } from "@/components/workspace";

export const dynamic = "force-dynamic";

export default async function MachinesPage() {
  const [machinesResult, documentsResult] = await Promise.all([
    getMachines(),
    getMachineDocuments(),
  ]);
  const { machines } = machinesResult;
  const { documents } = documentsResult;

  const indexed = documents.filter((doc) => doc.indexed_at).length;
  const categories = new Set(machines.map((machine) => machine.category)).size;

  return (
    <div className="space-y-6">
      <DataStateNotice
        states={[machinesResult._dataState, documentsResult._dataState]}
      />
      <WorkspaceHeader
        title="Product catalog"
        description="Upload a brochure and the agent can answer questions about that machine immediately — no developer required."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Machines" value={machines.length} />
        <Stat label="Categories" value={categories} />
        <Stat
          label="Documents indexed"
          value={indexed}
          hint={`${documents.length} uploaded`}
        />
      </div>

      <Card title="Add a machine">
        <AddMachineForm />
      </Card>

      <Card title={`${machines.length} in catalog`}>
        {machines.length === 0 ? (
          <EmptyState
            title="No machines added through the dashboard yet"
            hint="The bundled knowledge base is already indexed and answering questions; machines added here appear in this list."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-2.5 font-medium">Machine</th>
                  <th className="px-5 py-2.5 font-medium">Code</th>
                  <th className="px-5 py-2.5 font-medium">Category</th>
                  <th className="px-5 py-2.5 font-medium">Price range</th>
                  <th className="px-5 py-2.5 font-medium">Added</th>
                  <th className="px-5 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {machines.map((machine) => {
                  // A machine can in principle have more than one uploaded
                  // document; the most recently indexed one is what
                  // ingest_document last wrote to Qdrant, so it's the one
                  // worth surfacing here.
                  const machineDoc = documents
                    .filter((doc) => doc.machine_id === machine.id)
                    .sort(
                      (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime(),
                    )[0];
                  return (
                    <tr
                      key={machine.id}
                      className="transition-colors hover:bg-surface"
                    >
                      <td className="px-5 py-3 align-top text-foreground">{machine.name}</td>
                      <td className="px-5 py-3 align-top">
                        <code className="rounded bg-border px-1.5 py-0.5 text-xs text-foreground/80">
                          {machine.machine_code}
                        </code>
                      </td>
                      <td className="px-5 py-3 align-top text-muted">
                        {machine.category}
                      </td>
                      <td className="px-5 py-3 align-top text-muted">
                        {machine.price_range ?? "—"}
                      </td>
                      <td className="px-5 py-3 align-top text-muted">
                        {formatDateTime(machine.created_at)}
                      </td>
                      <td className="px-5 py-3 align-top text-right">
                        <div className="flex flex-wrap items-start justify-end gap-1">
                          {machineDoc && (
                            <DocumentContentModal
                              documentId={machineDoc.id}
                              machineName={machine.name}
                            />
                          )}
                          <MachineRowActions machine={machine} />
                          <form action={removeMachine}>
                            <input type="hidden" name="id" value={machine.id} />
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {documents.length > 0 && (
        <Card title="Uploaded documents">
          <ul className="divide-y divide-border/70">
            {documents.slice(0, 20).map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm"
              >
                <span className="min-w-0 truncate text-foreground/80">
                  {doc.title ?? "Untitled"}
                  <span className="ml-2 text-xs text-muted/70">
                    {titleCase(doc.doc_type)}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-muted">
                  {doc.indexed_at ? "Indexed" : "Pending"} ·{" "}
                  {formatDateTime(doc.created_at)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
