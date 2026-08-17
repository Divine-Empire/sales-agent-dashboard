"use server";

import { revalidatePath } from "next/cache";
import { overrideLeadCategory, type LeadCategory } from "@/lib/api";
import { requireDashboardSession } from "@/lib/auth";

/** Adds a manual category correction to the append-only lead score history. */
export async function moveLeadCategory(
  conversationId: string,
  category: LeadCategory,
) {
  await requireDashboardSession();
  await overrideLeadCategory(conversationId, category);
  revalidatePath("/leads");
  revalidatePath("/");
}
