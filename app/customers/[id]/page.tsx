import Link from "next/link";
import { notFound } from "next/navigation";
import { DataStateNotice } from "@/components/data-state-notice";
import { MessageTimeline } from "@/components/telegram/message-timeline";
import { CategoryBadge, EmptyState, ScoreBar } from "@/components/ui";
import { DataSurface, StatusBadge, WorkspaceHeader } from "@/components/workspace";
import { getConversation, getCustomers } from "@/lib/api";
import { formatDateTime, titleCase } from "@/lib/format";
import { EditCustomerButton } from "../edit-customer";

export const dynamic = "force-dynamic";

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] font-medium uppercase tracking-wider text-muted">{label}</dt>
      <dd className="mt-1 break-words text-sm text-foreground">{value || "—"}</dd>
    </div>
  );
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customersResult = await getCustomers(500);
  const customer = customersResult.customers.find((item) => item.id === id);
  if (!customer) notFound();

  const conversationId = `${customer.channel}:${customer.channel_user_id}`;
  const detail = await getConversation(conversationId);
  const { summary, messages } = detail;

  return (
    <div className="space-y-6">
      <DataStateNotice states={[customersResult._dataState, detail._dataState]} />
      <Link
        href="/customers"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-foreground"
      >
        <span aria-hidden="true">←</span> Customers
      </Link>
      <WorkspaceHeader
        title={customer.name ?? "Unidentified customer"}
        description={customer.company_name ?? `Customer since ${formatDateTime(customer.created_at)}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge tone={customer.is_opted_out ? "danger" : "success"}>
              {customer.is_opted_out ? "Opted out" : "Active"}
            </StatusBadge>
            <EditCustomerButton customer={customer} />
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <DataSurface title="Conversation" meta={`${messages.length} messages`}>
            {messages.length === 0 ? (
              <EmptyState
                title="No conversation history"
                hint="The conversation may have been cleared or is temporarily unavailable."
              />
            ) : (
              <div className="flex h-[32rem] flex-col">
                <MessageTimeline messages={messages} />
              </div>
            )}
          </DataSurface>
        </div>

        <aside className="space-y-5">
          <DataSurface title="Contact details">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-4 px-5 py-4 xl:grid-cols-1">
              <Field label="Phone" value={customer.phone} />
              <Field label="Email" value={customer.email} />
              <Field label="Channel" value={titleCase(customer.channel)} />
              <Field label="Channel ID" value={customer.channel_user_id} />
              <Field label="Location" value={customer.location} />
              <Field label="Language" value={customer.preferred_language.toUpperCase()} />
              <Field label="Last updated" value={formatDateTime(customer.updated_at)} />
            </dl>
          </DataSurface>

          <DataSurface title="Qualification">
            {!summary ? (
              <EmptyState title="Not analysed yet" />
            ) : (
              <div className="space-y-4 px-5 py-4">
                <div className="flex flex-wrap items-center gap-3">
                  {summary.lead_score !== null && <ScoreBar score={summary.lead_score} />}
                  <CategoryBadge category={summary.lead_category} />
                </div>
                {summary.summary && (
                  <p className="text-[13px] leading-5 text-foreground/85">{summary.summary}</p>
                )}
                {summary.next_action && (
                  <div className="border-l-2 border-blue-500 pl-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">Next action</p>
                    <p className="mt-1 text-sm leading-5">{summary.next_action}</p>
                  </div>
                )}
                <dl className="grid grid-cols-2 gap-4 border-t border-border pt-4 xl:grid-cols-1">
                  <Field label="Products" value={summary.interested_machines.join(", ")} />
                  <Field label="Budget" value={summary.budget} />
                  <Field label="Timeline" value={summary.timeline} />
                  <Field label="Intent" value={titleCase(summary.customer_intent)} />
                  <Field label="Requirements" value={summary.requirements} />
                </dl>
              </div>
            )}
          </DataSurface>
        </aside>
      </div>
    </div>
  );
}
