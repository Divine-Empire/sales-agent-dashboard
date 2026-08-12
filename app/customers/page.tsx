import { getCustomers } from "@/lib/api";
import { timeAgo } from "@/lib/format";
import { Card, EmptyState, Stat } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const { customers } = await getCustomers();
  const optedOut = customers.filter((customer) => customer.is_opted_out).length;
  const identified = customers.filter((customer) => customer.name).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
        <p className="mt-1 text-sm text-zinc-500">
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
                <tr className="border-b border-zinc-800 text-left text-xs uppercase tracking-wide text-zinc-500">
                  <th className="px-5 py-2.5 font-medium">Name</th>
                  <th className="px-5 py-2.5 font-medium">Company</th>
                  <th className="px-5 py-2.5 font-medium">Location</th>
                  <th className="px-5 py-2.5 font-medium">Channel</th>
                  <th className="px-5 py-2.5 font-medium">Language</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 font-medium">Last seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/70">
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="transition-colors hover:bg-zinc-800/30"
                  >
                    <td className="px-5 py-3 text-zinc-200">
                      {customer.name ?? (
                        <span className="text-zinc-600">Unidentified</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-zinc-400">
                      {customer.company_name ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-zinc-400">
                      {customer.location ?? "—"}
                    </td>
                    <td className="px-5 py-3 capitalize text-zinc-400">
                      {customer.channel}
                    </td>
                    <td className="px-5 py-3 uppercase text-zinc-500">
                      {customer.preferred_language}
                    </td>
                    <td className="px-5 py-3">
                      {customer.is_opted_out ? (
                        <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs text-red-400 ring-1 ring-inset ring-red-500/30">
                          Opted out
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-400 ring-1 ring-inset ring-emerald-500/30">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-zinc-500">
                      {timeAgo(customer.updated_at)}
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
