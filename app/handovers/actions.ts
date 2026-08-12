"use server";

import { revalidatePath } from "next/cache";
import { patchHandover } from "@/lib/api";

/**
 * Update a handover's status.
 *
 * A Server Action, so the API key stays server-side — the browser posts to
 * Next.js, which calls Render. The key never appears in client JavaScript.
 */
export async function updateHandoverStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !status) return;
  try {
    await patchHandover(id, status);
  } catch (error) {
    // The queue is still readable if this fails; surfacing a broken page would
    // be worse than a stale status.
    console.error("[handover] update failed", error);
  }
  revalidatePath("/handovers");
  revalidatePath("/");
}
