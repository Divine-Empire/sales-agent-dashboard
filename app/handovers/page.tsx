import { getHandovers } from "@/lib/api";
import { formatDateTime, timeAgo, titleCase } from "@/lib/format";
import { Card, ConversationLink, EmptyState } from "@/components/ui";
import { updateHandoverStatus } from "./actions";
import { DataStateNotice } from "@/components/data-state-notice";
import {
  PageToolbar,
  SegmentedControl,
  StatusBadge,
  WorkspaceHeader,
} from "@/components/workspace";

export const dynamic = "force-dynamic";

const TABS = [
  { value: "pending", label: "Pending" },
  { value: "acknowledged", label: "Acknowledged" },
  { value: "resolved", label: "Resolved" },
];

const REASON_TONES = {
  formal_quote: "info",
  price_negotiation: "warning",
  bulk_order: "accent",
  customer_request: "success",
  low_confidence: "danger",
  other: "neutral",
} as const;

function StatusButton({
  id,
  status,
  label,
}: {
  id: string;
  status: string;
  label: string;
}) {
  return (
    <form action={updateHandoverStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        className="rounded-md bg-border px-2.5 py-1 text-xs text-foreground/80 transition-colors hover:bg-border hover:text-foreground"
      >
        {label}
      </button>
    </form>
  );
}

export default async function HandoversPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = status ?? "pending";
  const handoversResult = await getHandovers(active);
  const { handovers } = handoversResult;

  return (
    <div className="space-y-6">
      <DataStateNotice states={[handoversResult._dataState]} />
      <WorkspaceHeader
        title="Handover queue"
        description="Conversations the agent escalated to a human — quotes, negotiations and bulk orders."
      />

      <PageToolbar>
        <SegmentedControl
          ariaLabel="Filter handovers by status"
          activeValue={active}
          items={TABS.map((tab) => ({
            ...tab,
            href: `/handovers?status=${tab.value}`,
          }))}
        />
      </PageToolbar>

      <Card title={`${handovers.length} in queue`}>
        {handovers.length === 0 ? (
          <EmptyState
            title={`Nothing ${active}`}
            hint="The agent escalates automatically for formal quotes, negotiations and bulk orders."
          />
        ) : (
          <ul className="divide-y divide-border/70">
            {handovers.map((handover) => (
              <li key={handover.id} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge
                        tone={
                          REASON_TONES[
                            handover.reason as keyof typeof REASON_TONES
                          ] ?? REASON_TONES.other
                        }
                      >
                        {titleCase(handover.reason)}
                      </StatusBadge>
                      <ConversationLink
                        conversationId={handover.conversation_id}
                      >
                        <span className="text-sm">View conversation</span>
                      </ConversationLink>
                      <span className="text-xs text-muted/70">
                        {timeAgo(handover.notified_at)}
                      </span>
                    </div>
                    {/* The context is the point of the queue: a rep must be
                        able to pick this up without reading the transcript. */}
                    <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                      {handover.context ?? "No context recorded."}
                    </p>
                    <p className="mt-1.5 text-xs text-muted/70">
                      Raised {formatDateTime(handover.notified_at)}
                      {handover.resolved_at &&
                        ` · resolved ${formatDateTime(handover.resolved_at)}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {handover.status === "pending" && (
                      <StatusButton
                        id={handover.id}
                        status="acknowledged"
                        label="Acknowledge"
                      />
                    )}
                    {handover.status !== "resolved" && (
                      <StatusButton
                        id={handover.id}
                        status="resolved"
                        label="Mark resolved"
                      />
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
