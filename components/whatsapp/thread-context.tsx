import type { WhatsAppMessageItem } from "@/lib/api";

const dateTime = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2">
      <dt className="text-[11px] uppercase tracking-wider text-muted">{label}</dt>
      <dd className="min-w-0 text-right text-[13px] font-medium tabular-nums">
        {value}
      </dd>
    </div>
  );
}

/**
 * What this thread can honestly tell an operator.
 *
 * Deliberately not the fixture inspector's shape (summary / next action /
 * products / budget): those came from the AI's lead scoring, which lives in
 * the sales-agent database keyed by `whatsapp:<phone>` and is not part of the
 * portal's conversation record. Rendering those labels against real data would
 * print a column of em-dashes and imply the analysis is missing rather than
 * simply elsewhere. So this panel reports delivery reality instead — the thing
 * the portal genuinely knows and an operator genuinely needs.
 */
export function WhatsAppThreadContext({
  messages,
  phone,
  lastActivityAt,
}: {
  messages: WhatsAppMessageItem[];
  phone: string;
  lastActivityAt: string | null;
}) {
  const inbound = messages.filter((m) => m.direction === "inbound").length;
  const outbound = messages.length - inbound;
  const failed = messages.filter((m) => m.status === "failed");
  const lastCustomer = [...messages].reverse().find((m) => m.direction === "inbound");
  const interest = [...messages]
    .reverse()
    .find((m) => m.interest_status && m.interest_status !== "Other")?.interest_status;

  return (
    <aside
      aria-label="WhatsApp thread context"
      className="min-h-0 overflow-y-auto border-t border-border bg-surface/25 xl:w-[19rem] xl:shrink-0 xl:border-l xl:border-t-0"
    >
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold">Thread</h2>
        <p className="mt-0.5 text-xs text-muted">
          Delivery and activity for this contact
        </p>
      </div>

      <dl className="divide-y divide-border px-5 py-1">
        <Row label="Number" value={phone || "—"} />
        <Row label="From customer" value={inbound} />
        <Row label="Sent to customer" value={outbound} />
        {failed.length > 0 && (
          <Row
            label="Failed"
            value={<span className="text-red-600 dark:text-red-400">{failed.length}</span>}
          />
        )}
        <Row
          label="Last activity"
          value={lastActivityAt ? dateTime.format(new Date(lastActivityAt)) : "—"}
        />
        {interest && <Row label="Signal" value={interest} />}
      </dl>

      {lastCustomer?.content && (
        <div className="border-t border-border px-5 py-4">
          <h3 className="text-[10px] font-medium uppercase tracking-wider text-muted">
            Last from customer
          </h3>
          <p className="mt-1.5 text-[13px] leading-5 text-foreground/85">
            {lastCustomer.content.length > 220
              ? `${lastCustomer.content.slice(0, 220)}…`
              : lastCustomer.content}
          </p>
        </div>
      )}

      {failed.length > 0 && (
        <div className="border-t border-border px-5 py-4">
          <h3 className="text-[10px] font-medium uppercase tracking-wider text-red-700 dark:text-red-400">
            Needs attention
          </h3>
          <p className="mt-1.5 text-[13px] leading-5 text-foreground/85">
            {failed.length === 1 ? "A message" : `${failed.length} messages`} could
            not be delivered.{" "}
            {failed.at(-1)?.error_message ?? "No reason was returned by WhatsApp."}
          </p>
        </div>
      )}

      <div className="border-t border-border px-5 py-4">
        <h3 className="text-[10px] font-medium uppercase tracking-wider text-muted">
          Replies
        </h3>
        <p className="mt-1.5 text-[13px] leading-5 text-muted">
          The AI sales agent answers new messages on this number automatically.
          To reply yourself, use the WhatsApp portal.
        </p>
      </div>
    </aside>
  );
}
