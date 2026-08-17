"use client";

import type { Message } from "@/lib/api";
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

function dateKey(value: string | null): string {
  if (!value) return "Unknown date";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown date" : dateFormatter.format(date);
}

function messageTime(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : timeFormatter.format(date);
}

export function MessageTimeline({ messages }: { messages: Message[] }) {
  return (
    <TimelineViewport
      label="Conversation messages"
      updateKey={messages.at(-1)?.created_at ?? String(messages.length)}
    >
      {messages.map((message, index) => {
          const day = dateKey(message.created_at);
          const showDay =
            index === 0 || day !== dateKey(messages[index - 1]?.created_at ?? null);
          const inbound = message.role === "user";
          const system = message.role === "system" || message.role === "tool";

          return (
            <li key={`${message.created_at ?? "message"}-${index}`}>
              {showDay && <TimelineDateSeparator label={day} />}
              {system ? (
                <div className="mx-auto my-2 max-w-xl rounded-md bg-surface px-3 py-1.5 text-center text-[11px] leading-4 text-muted ring-1 ring-inset ring-border">
                  {message.content}
                </div>
              ) : (
                <div className={`flex ${inbound ? "justify-start" : "justify-end"}`}>
                  <article
                    aria-label={`${inbound ? "Customer" : "AI sales agent"} message at ${messageTime(message.created_at)}`}
                    className={`max-w-[88%] rounded-xl px-3 py-2 text-[13px] leading-5 shadow-sm sm:max-w-[72%] ${
                      inbound
                        ? "rounded-bl-md bg-surface text-foreground ring-1 ring-inset ring-border"
                        : "rounded-br-md bg-blue-600 text-white"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    <p
                      className={`mt-1 text-right text-[10px] leading-none ${
                        inbound ? "text-muted" : "text-blue-100/80"
                      }`}
                    >
                      {messageTime(message.created_at)}
                    </p>
                  </article>
                </div>
              )}
            </li>
          );
        })}
    </TimelineViewport>
  );
}
