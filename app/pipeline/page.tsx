import { getLeads } from "@/lib/api";
import { PipelineBoard } from "./board";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const { leads } = await getLeads({ limit: 300 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Pipeline board
        </h1>
        <p className="mt-1 text-sm text-muted">
          Drag a lead to correct its category. The AI still re-scores on the
          next message — this is a correction, not a lock.
        </p>
      </div>
      <PipelineBoard leads={leads} />
    </div>
  );
}
