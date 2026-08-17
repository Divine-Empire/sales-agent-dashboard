import type { ChannelThread } from "@/lib/channel-types";
import { titleCase } from "@/lib/format";
import { CategoryBadge } from "@/components/ui";

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-medium uppercase tracking-wider text-muted">{label}</dt>
      <dd className="mt-1 break-words text-sm leading-5">{value || "—"}</dd>
    </div>
  );
}

export function WhatsAppCrmInspector({ thread }: { thread: ChannelThread }) {
  const { conversation } = thread;
  return (
    <aside
      aria-label="Fictional WhatsApp CRM context"
      className="min-h-0 overflow-y-auto border-t border-border bg-surface/25 xl:w-[20rem] xl:shrink-0 xl:border-l xl:border-t-0"
    >
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold">Customer context</h2>
        <p className="mt-0.5 text-xs text-muted">Fixture data · not a customer record</p>
      </div>
      <div className="space-y-4 px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge category={conversation.leadCategory ?? null} />
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-500/20 dark:text-emerald-300">
            {titleCase(conversation.classification)}
          </span>
        </div>
        <div>
          <h3 className="text-[10px] font-medium uppercase tracking-wider text-muted">Preview summary</h3>
          <p className="mt-1.5 text-[13px] leading-5 text-foreground/85">{thread.summary}</p>
        </div>
        <div className="border-l-2 border-emerald-500 pl-3">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Next action</h3>
          <p className="mt-1 text-sm leading-5">{thread.nextAction}</p>
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-4 border-t border-border pt-4">
          <Field label="Company" value={conversation.contact.company} />
          <Field label="Phone" value={conversation.contact.phone} />
          <Field label="Location" value={conversation.contact.location} />
          <Field label="Source" value={thread.source} />
          <div className="col-span-2"><Field label="Campaign" value={conversation.campaign} /></div>
          <div className="col-span-2"><Field label="Products" value={thread.products.join(", ")} /></div>
          <div className="col-span-2"><Field label="Requirements" value={thread.requirements} /></div>
          <Field label="Budget" value={thread.budget} />
          <Field label="Timeline" value={thread.timeline} />
        </dl>
      </div>
    </aside>
  );
}
