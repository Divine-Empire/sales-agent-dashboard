import Link from "next/link";
import { getCustomers } from "@/lib/api";
import { timeAgo } from "@/lib/format";
import { EmptyState, Stat } from "@/components/ui";
import { EditCustomerButton } from "./edit-customer";
import { DataStateNotice } from "@/components/data-state-notice";
import {
  DataTable,
  DataTableBody,
  DataTableHeader,
  DataTableRow,
} from "@/components/data-table";
import { DataSurface, WorkspaceHeader } from "@/components/workspace";
import { FIELD_CLASS } from "@/components/form-styles";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const customersResult = await getCustomers(500);
  const allCustomers = customersResult.customers;
  const optedOut = allCustomers.filter((customer) => customer.is_opted_out).length;
  const identified = allCustomers.filter((customer) => customer.name).length;
  const query = params.q?.trim().toLocaleLowerCase() ?? "";
  const status = params.status === "active" || params.status === "opted_out"
    ? params.status
    : "all";
  const sort = params.sort === "oldest" || params.sort === "name"
    ? params.sort
    : "recent";
  const filtered = allCustomers
    .filter((customer) => {
      if (status === "active" && customer.is_opted_out) return false;
      if (status === "opted_out" && !customer.is_opted_out) return false;
      if (!query) return true;
      return [
        customer.name,
        customer.company_name,
        customer.phone,
        customer.email,
        customer.channel_user_id,
        customer.location,
      ].some((value) => value?.toLocaleLowerCase().includes(query));
    })
    .sort((a, b) => {
      if (sort === "name") return (a.name ?? "").localeCompare(b.name ?? "");
      const delta = new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      return sort === "oldest" ? -delta : delta;
    });
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const requestedPage = Number.parseInt(params.page ?? "1", 10);
  const page = Math.min(Math.max(Number.isNaN(requestedPage) ? 1 : requestedPage, 1), pageCount);
  const customers = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function pageHref(nextPage: number) {
    const url = new URLSearchParams();
    if (params.q) url.set("q", params.q);
    if (status !== "all") url.set("status", status);
    if (sort !== "recent") url.set("sort", sort);
    url.set("page", String(nextPage));
    return `/customers?${url}`;
  }

  return (
    <div className="space-y-6">
      <DataStateNotice states={[customersResult._dataState]} />
      <WorkspaceHeader
        title="Customers"
        description="Everyone who has contacted the agent, across every channel."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total" value={allCustomers.length} />
        <Stat label="Identified" value={identified} hint="gave a name" />
        <Stat label="Opted out" value={optedOut} />
      </div>

      <DataSurface
        title={`${filtered.length} customer${filtered.length === 1 ? "" : "s"}`}
        meta={filtered.length > PAGE_SIZE ? `Page ${page} of ${pageCount}` : undefined}
      >
        <form className="grid gap-3 border-b border-border px-4 py-3 sm:grid-cols-[minmax(15rem,1fr)_10rem_10rem_auto]" action="/customers">
          <label className="sr-only" htmlFor="customer-search">Search customers</label>
          <input
            id="customer-search"
            name="q"
            defaultValue={params.q}
            placeholder="Search name, company, phone, email or location"
            className={FIELD_CLASS}
          />
          <label className="sr-only" htmlFor="customer-status">Customer status</label>
          <select id="customer-status" name="status" defaultValue={status} className={FIELD_CLASS}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="opted_out">Opted out</option>
          </select>
          <label className="sr-only" htmlFor="customer-sort">Sort customers</label>
          <select id="customer-sort" name="sort" defaultValue={sort} className={FIELD_CLASS}>
            <option value="recent">Recently updated</option>
            <option value="oldest">Oldest updated</option>
            <option value="name">Name</option>
          </select>
          <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">Apply</button>
        </form>

        {customers.length === 0 ? (
          <EmptyState
            title={allCustomers.length === 0 ? "No customers yet" : "No matching customers"}
            hint={allCustomers.length > 0 ? "Change the search or status filter." : undefined}
          />
        ) : (
          <DataTable minWidth="min-w-[920px]">
              <DataTableHeader>
                  <th className="px-5 py-2.5 font-medium">Name</th>
                  <th className="px-5 py-2.5 font-medium">Company</th>
                  <th className="px-5 py-2.5 font-medium">Phone</th>
                  <th className="px-5 py-2.5 font-medium">Location</th>
                  <th className="px-5 py-2.5 font-medium">Channel</th>
                  <th className="px-5 py-2.5 font-medium">Language</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 font-medium">Last seen</th>
                  <th className="px-5 py-2.5" />
              </DataTableHeader>
              <DataTableBody>
                {customers.map((customer) => (
                  <DataTableRow key={customer.id}>
                    <td className="px-5 py-3 text-foreground">
                      <Link href={`/customers/${customer.id}`} className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                        {customer.name ?? "Unidentified"}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-muted">
                      {customer.company_name ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-muted">{customer.phone ?? "—"}</td>
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
                  </DataTableRow>
                ))}
              </DataTableBody>
          </DataTable>
        )}
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
            {page > 1 ? <Link href={pageHref(page - 1)} className="text-blue-600 hover:text-blue-500 dark:text-blue-400">← Previous</Link> : <span />}
            <span className="text-xs text-muted">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
            {page < pageCount ? <Link href={pageHref(page + 1)} className="text-blue-600 hover:text-blue-500 dark:text-blue-400">Next →</Link> : <span />}
          </div>
        )}
      </DataSurface>
    </div>
  );
}
