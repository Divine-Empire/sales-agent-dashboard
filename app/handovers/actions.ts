"use server";

import { revalidatePath } from "next/cache";
import { patchHandover } from "@/lib/api";
import { requireDashboardSession } from "@/lib/auth";

/**
 * Update a handover's status.
 *
 * A Server Action, so the API key stays server-side — the browser posts to
 * Next.js, which calls Render. The key never appears in client JavaScript.
 */
export async function updateHandoverStatus(formData: FormData) {
  await requireDashboardSession();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !status) return;
  await patchHandover(id, status);
  revalidatePath("/handovers");
  revalidatePath("/");
}
