import { getReport } from "@/lib/api";
import { BarRow, Card, EmptyState, Stat } from "@/components/ui";
import { DataStateNotice } from "@/components/data-state-notice";
import {
  PageToolbar,
  SegmentedControl,
  WorkspaceHeader,
} from "@/components/workspace";

export const dynamic = "force-dynamic";

const PERIODS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
] as const;

type Period = (typeof PERIODS)[number]["value"];

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period } = await searchParams;
  const active = (PERIODS.find((p) => p.value === period)?.value ??
    "daily") as Period;
  const report = await getReport(active);
  const { metrics } = report;
  const maxMachine = Math.max(1, ...metrics.top_machines.map((m) => m.count));

  return (
    <div className="space-y-6">
      <DataStateNotice states={[report._dataState]} />
      <WorkspaceHeader
        title="Reports"
        description={
          report.period_start && report.period_end
            ? `${report.period_start} to ${report.period_end}`
            : "Aggregated activity"
        }
      />

      <PageToolbar>
        <SegmentedControl
          ariaLabel="Select reporting period"
          activeValue={active}
          items={PERIODS.map((option) => ({
            ...option,
            href: `/reports?period=${option.value}`,
          }))}
        />
      </PageToolbar>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Leads" value={metrics.leads} />
        <Stat label="Hot" value={metrics.hot} tone="hot" />
        <Stat label="Warm" value={metrics.warm} tone="warm" />
        <Stat label="Cold" value={metrics.cold} tone="cold" />
        <Stat label="Not interested" value={metrics.not_interested} />
        <Stat label="Handovers" value={metrics.handovers} />
        <Stat label="Opt-outs" value={metrics.opt_outs} />
        <Stat
          label="Conversion"
          value={
            metrics.leads > 0
              ? `${Math.round((metrics.hot / metrics.leads) * 100)}%`
              : "—"
          }
          hint="leads that turned hot"
        />
      </div>

      <Card title="Most requested products">
        {metrics.top_machines.length === 0 ? (
          <EmptyState
            title="No product interest in this period"
            hint="Try a wider period."
          />
        ) : (
          <div className="space-y-2.5 px-5 py-4">
            {metrics.top_machines.map((row) => (
              <BarRow
                key={row.machine}
                label={row.machine}
                value={row.count}
                max={maxMachine}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
