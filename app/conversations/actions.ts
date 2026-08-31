"use server";

import { revalidatePath } from "next/cache";
import { ApiError, deleteConversation } from "@/lib/api";
import { requireDashboardSession } from "@/lib/auth";

export interface DeleteConversationState {
  ok: boolean;
  message: string;
}

/**
 * Permanently deletes a conversation (messages, summary, lead-score
 * history) from the inbox — for clearing test/demo conversations, not a
 * customer-facing action. The confirmation step lives in the client
 * component that calls this (a native `confirm()`), since there's no
 * server-side undo once this runs.
 */
export async function removeConversation(
  _prev: DeleteConversationState | null,
  formData: FormData,
): Promise<DeleteConversationState> {
  await requireDashboardSession();
  const conversationId = String(formData.get("conversation_id") ?? "");
  const channel = String(formData.get("channel") ?? "telegram");
  if (!conversationId) {
    return { ok: false, message: "Missing conversation id." };
  }

  try {
    await deleteConversation(conversationId);
    revalidatePath(`/conversations/${channel}`);
    return { ok: true, message: "Conversation deleted." };
  } catch (error) {
    console.error("[conversations] delete failed", error);
    const message =
      error instanceof ApiError ? error.message : "Could not delete conversation.";
    return { ok: false, message };
  }
}
