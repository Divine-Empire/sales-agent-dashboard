"use client";

import type { ChannelMessage, MessageStatus } from "@/lib/channel-types";
import {
  TimelineDateSeparator,
  TimelineViewport,
} from "@/components/conversations/timeline";

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
const timeFormatter = new Intl.DateTimeFormat("en-IN", {
  hour: "2-digit",
  minute: "2-digit",
});

function asDate(value: string): Date {
  return new Date(value);
}

function day(value: string): string {
  return dateFormatter.format(asDate(value));
}

function time(value: string): string {
  return timeFormatter.format(asDate(value));
}

function Status({ status }: { status?: MessageStatus }) {
  if (!status) return null;
  if (status === "failed") {
    return <span className="font-semibold text-red-400" title="Failed">!</span>;
  }
  const double = status === "delivered" || status === "read";
  return (
    <span
      className={status === "read" ? "text-sky-300" : "text-current"}
      title={status}
      aria-label={status}
    >
      {double ? "✓✓" : status === "queued" ? "◷" : "✓"}
    </span>
  );
}

function MessageContent({ message }: { message: ChannelMessage }) {
  return (
    <>
      {message.replyTo && (
        <div className="mb-2 border-l-2 border-emerald-400/70 bg-black/5 px-2 py-1 dark:bg-white/5">
          <p className="text-[10px] font-medium opacity-75">{message.replyTo.sender}</p>
          <p className="truncate text-xs opacity-70">{message.replyTo.text}</p>
        </div>
      )}
      {message.template && (
        <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider opacity-65">
          <span>Template</span>
          <span>·</span>
          <span>{message.template.name}</span>
        </div>
      )}
      {message.media && (
        <div className="mb-2 flex items-center gap-3 rounded-lg bg-black/5 p-2 dark:bg-white/5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-background/80 text-sm font-semibold text-muted">
            {message.kind === "image" ? "IMG" : "PDF"}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-xs font-medium">{message.media.name}</span>
            <span className="block text-[10px] opacity-65">{message.media.mimeType}</span>
          </span>
        </div>
      )}
      {message.text && <p className="whitespace-pre-wrap break-words">{message.text}</p>}
      {message.actions && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {message.actions.map((action) => (
            <span
              key={action}
              className="rounded-md bg-background/75 px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300"
            >
              {action}
            </span>
          ))}
        </div>
      )}
      {message.error && (
        <p className="mt-2 rounded-md bg-red-500/10 px-2 py-1 text-xs text-red-600 dark:text-red-300">
          {message.error}
        </p>
      )}
    </>
  );
}

export function WhatsAppMessageTimeline({ messages }: { messages: ChannelMessage[] }) {
  return (
    <TimelineViewport
      label="Fictional WhatsApp message timeline"
      updateKey={messages.at(-1)?.id ?? String(messages.length)}
    >
      {messages.map((message, index) => {
          const showDay = index === 0 || day(message.createdAt) !== day(messages[index - 1].createdAt);
          const inbound = message.direction === "customer";
          return (
            <li key={message.id}>
              {showDay && <TimelineDateSeparator label={day(message.createdAt)} />}
              <div className={`flex ${inbound ? "justify-start" : "justify-end"}`}>
                <article
                  aria-label={`${inbound ? "Customer" : "Business"} preview message at ${time(message.createdAt)}`}
                  className={`max-w-[88%] rounded-xl px-3 py-2 text-[13px] leading-5 shadow-sm sm:max-w-[72%] ${
                    inbound
                      ? "rounded-bl-md bg-surface text-foreground ring-1 ring-inset ring-border"
                      : message.status === "failed"
                        ? "rounded-br-md bg-red-600 text-white"
                        : "rounded-br-md bg-emerald-700 text-white"
                  }`}
                >
                  <MessageContent message={message} />
                  <p className={`mt-1 flex items-center justify-end gap-1 text-[10px] leading-none ${inbound ? "text-muted" : "text-white/75"}`}>
                    <span>{time(message.createdAt)}</span>
                    {!inbound && <Status status={message.status} />}
                  </p>
                </article>
              </div>
            </li>
          );
        })}
    </TimelineViewport>
  );
}
