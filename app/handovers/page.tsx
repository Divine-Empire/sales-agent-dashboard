import Link from "next/link";
import { getHandovers } from "@/lib/api";
import { formatDateTime, timeAgo, titleCase } from "@/lib/format";
import { Card, ConversationLink, EmptyState } from "@/components/ui";
import { updateHandoverStatus } from "./actions";

export const dynamic = "force-dynamic";

const TABS = [
  { value: "pending", label: "Pending" },
  { value: "acknowledged", label: "Acknowledged" },
  { value: "resolved", label: "Resolved" },
];

const REASON_TONES: Record<string, string> = {
  formal_quote: "bg-blue-500/15 text-blue-400 ring-blue-500/30",
  price_negotiation: "bg-amber-500/15 text-amber-400 ring-amber-500/30",
  bulk_order: "bg-purple-500/15 text-purple-400 ring-purple-500/30",
  customer_request: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30",
  low_confidence: "bg-red-500/15 text-red-400 ring-red-500/30",
  other: "bg-zinc-500/15 text-zinc-400 ring-zinc-500/30",
};

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
        className="rounded-md bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-white"
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
  const { handovers } = await getHandovers(active);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Handover queue
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Conversations the agent escalated to a human — quotes, negotiations
          and bulk orders.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/handovers?status=${tab.value}`}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              active === tab.value
                ? "bg-blue-600 text-white"
                : "bg-zinc-900 text-zinc-400 ring-1 ring-zinc-800 hover:text-zinc-100"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <Card title={`${handovers.length} in queue`}>
        {handovers.length === 0 ? (
          <EmptyState
            title={`Nothing ${active}`}
            hint="The agent escalates automatically for formal quotes, negotiations and bulk orders."
          />
        ) : (
          <ul className="divide-y divide-zinc-800/70">
            {handovers.map((handover) => (
              <li key={handover.id} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                          REASON_TONES[handover.reason] ?? REASON_TONES.other
                        }`}
                      >
                        {titleCase(handover.reason)}
                      </span>
                      <ConversationLink
                        conversationId={handover.conversation_id}
                      >
                        <span className="text-sm">View conversation</span>
                      </ConversationLink>
                      <span className="text-xs text-zinc-600">
                        {timeAgo(handover.notified_at)}
                      </span>
                    </div>
                    {/* The context is the point of the queue: a rep must be
                        able to pick this up without reading the transcript. */}
                    <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                      {handover.context ?? "No context recorded."}
                    </p>
                    <p className="mt-1.5 text-xs text-zinc-600">
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
