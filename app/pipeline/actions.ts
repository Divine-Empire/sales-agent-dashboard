"use server";

import { revalidatePath } from "next/cache";
import { overrideLeadCategory, type LeadCategory } from "@/lib/api";

/**
 * The kanban drag action, run server-side so the backend API key stays out of
 * the browser. See app/main.py's override_lead_category for what this writes:
 * a new lead_scores row, not an edit — a manual move sits in the same
 * append-only history as AI scoring and is a correction a rep can make, not a
 * permanent lock.
 */
export async function moveLeadCategory(
  conversationId: string,
  category: LeadCategory,
) {
  try {
    await overrideLeadCategory(conversationId, category);
  } catch (error) {
    console.error("[pipeline] move failed", error);
    throw error;
  }
  revalidatePath("/pipeline");
  revalidatePath("/leads");
  revalidatePath("/");
}
