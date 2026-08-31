"use client";

import { useActionState } from "react";
import { removeConversation } from "@/app/conversations/actions";

/** A small trash-icon button on a conversation row — asks for confirmation
 * (a native confirm(), since this is an irreversible delete with no undo)
 * before submitting. Deliberately a plain <button type="submit"> inside its
 * own <form>, not nested inside the row's <Link>, since nested interactive
 * elements are invalid HTML and would make the delete also navigate. */
export function DeleteConversationButton({
  conversationId,
  channel,
  customerName,
}: {
  conversationId: string;
  channel: string;
  customerName: string;
}) {
  const [, formAction, pending] = useActionState(removeConversation, null);

  return (
    <form
      action={formAction}
      onClick={(e) => e.stopPropagation()}
      onSubmit={(e) => {
        if (
          !confirm(
            `Delete the conversation with ${customerName}? This removes its messages and lead data permanently and cannot be undone.`,
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="conversation_id" value={conversationId} />
      <input type="hidden" name="channel" value={channel} />
      <button
        type="submit"
        disabled={pending}
        title="Delete conversation"
        aria-label="Delete conversation"
        className="rounded-md p-1 text-muted/70 transition-colors hover:bg-red-500/10 hover:text-red-600 disabled:opacity-50 dark:hover:text-red-400"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          aria-hidden="true"
        >
          <path d="M4 6h16M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m2 0-.867 12.142A2 2 0 0117.138 20H6.862a2 2 0 01-1.995-1.858L4 6" />
          <path d="M10 11v6M14 11v6" />
        </svg>
      </button>
    </form>
  );
}
