import { DataStateNotice } from "@/components/data-state-notice";
import { DataSurface, StatusBadge, WorkspaceHeader } from "@/components/workspace";
import { getHealth } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HealthPage() {
  const health = await getHealth();
  const online = health.status === "ok";
  return (
    <div className="space-y-6">
      <DataStateNotice states={[health._dataState]} />
      <WorkspaceHeader
        title="Service health"
        description="Current connectivity between this CRM and the Render sales-agent service."
      />
      <DataSurface title="Sales agent">
        <div className="flex flex-col gap-5 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <StatusBadge tone={online ? "success" : "danger"}>
                {online ? "Operational" : "Unavailable"}
              </StatusBadge>
              <span className="text-sm font-medium">{health.service}</span>
            </div>
            <p className="mt-2 text-sm text-muted">
              {online
                ? "The CRM can reach the backend and live sales data is available."
                : "The backend did not return a healthy response. Live CRM data may be unavailable."}
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div>
              <dt className="text-xs text-muted">Status</dt>
              <dd className="mt-0.5 font-medium">{health.status}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Checked</dt>
              <dd className="mt-0.5 font-medium">{formatDateTime(health._dataState.fetchedAt)}</dd>
            </div>
          </dl>
        </div>
      </DataSurface>
      <div className="border-l-2 border-blue-500 bg-blue-500/6 px-4 py-3 text-sm leading-5 text-blue-900 dark:text-blue-200">
        Render cold starts can take several seconds. An unavailable result is shown explicitly throughout the CRM instead of being presented as empty data.
      </div>
    </div>
  );
}
