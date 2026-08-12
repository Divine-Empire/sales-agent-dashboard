import { getCustomers } from "@/lib/api";
import { timeAgo } from "@/lib/format";
import { Card, EmptyState, Stat } from "@/components/ui";
import { EditCustomerButton } from "./edit-customer";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const { customers } = await getCustomers();
  const optedOut = customers.filter((customer) => customer.is_opted_out).length;
  const identified = customers.filter((customer) => customer.name).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
        <p className="mt-1 text-sm text-muted">
          Everyone who has contacted the agent, across every channel.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total" value={customers.length} />
        <Stat label="Identified" value={identified} hint="gave a name" />
        <Stat label="Opted out" value={optedOut} />
      </div>

      <Card
        title={`${customers.length} customer${customers.length === 1 ? "" : "s"}`}
      >
        {customers.length === 0 ? (
          <EmptyState title="No customers yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-2.5 font-medium">Name</th>
                  <th className="px-5 py-2.5 font-medium">Company</th>
                  <th className="px-5 py-2.5 font-medium">Location</th>
                  <th className="px-5 py-2.5 font-medium">Channel</th>
                  <th className="px-5 py-2.5 font-medium">Language</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 font-medium">Last seen</th>
                  <th className="px-5 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="transition-colors hover:bg-surface"
                  >
                    <td className="px-5 py-3 text-foreground">
                      {customer.name ?? (
                        <span className="text-muted/70">Unidentified</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-muted">
                      {customer.company_name ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-muted">
                      {customer.location ?? "—"}
                    </td>
                    <td className="px-5 py-3 capitalize text-muted">
                      {customer.channel}
                    </td>
                    <td className="px-5 py-3 uppercase text-muted">
                      {customer.preferred_language}
                    </td>
                    <td className="px-5 py-3">
                      {customer.is_opted_out ? (
                        <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs text-red-700 ring-1 ring-inset ring-red-500/30 dark:text-red-400">
                          Opted out
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-700 ring-1 ring-inset ring-emerald-500/30 dark:text-emerald-400">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-muted">
                      {timeAgo(customer.updated_at)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <EditCustomerButton customer={customer} />
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
