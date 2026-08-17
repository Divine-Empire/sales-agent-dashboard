import { NextResponse } from "next/server";
import { getCustomers, getLeads } from "@/lib/api";
import { hasDashboardSession } from "@/lib/auth";

/**
 * Route Handler, not a Server Action — the sidebar search needs a fetchable
 * endpoint the client component can call as the user types. Still server-side
 * only: this runs on the Vercel server, never the browser, so the backend API
 * key stays put.
 */
export async function GET(request: Request) {
  if (!(await hasDashboardSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const query = new URL(request.url).searchParams.get("q")?.trim().toLowerCase();
  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const [{ leads }, { customers }] = await Promise.all([
    getLeads({ limit: 300 }),
    getCustomers(300),
  ]);

  const matches = (text: string | null | undefined) =>
    text?.toLowerCase().includes(query) ?? false;

  const leadResults = leads
    .filter(
      (lead) => matches(lead.customer_name) || matches(lead.company_name),
    )
    .slice(0, 8)
    .map((lead) => ({
      type: "lead" as const,
      id: lead.conversation_id,
      title: lead.customer_name ?? "Unidentified",
      subtitle: lead.company_name ?? lead.conversation_id,
      href: `/conversations/${encodeURIComponent(lead.conversation_id)}`,
    }));

  const customerResults = customers
    .filter(
      (customer) =>
        matches(customer.name) ||
        matches(customer.company_name) ||
        matches(customer.phone),
    )
    .slice(0, 8)
    .map((customer) => ({
      type: "customer" as const,
      id: customer.id,
      title: customer.name ?? "Unidentified",
      subtitle: customer.company_name ?? customer.channel_user_id,
      href: `/customers`,
    }));

  // Dedupe by title+subtitle — the same person often appears in both lists.
  const seen = new Set<string>();
  const results = [...leadResults, ...customerResults].filter((r) => {
    const key = `${r.title}|${r.subtitle}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return NextResponse.json({ results: results.slice(0, 10) });
}
