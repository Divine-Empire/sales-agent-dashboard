"use server";

import { revalidatePath } from "next/cache";
import { updateCustomer } from "@/lib/api";

/** Let a rep correct or fill in a customer's own fields. Server Action so the
 * backend API key stays server-side. */
export async function editCustomer(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const fields = {
    name: String(formData.get("name") ?? "").trim() || undefined,
    company_name: String(formData.get("company_name") ?? "").trim() || undefined,
    location: String(formData.get("location") ?? "").trim() || undefined,
    phone: String(formData.get("phone") ?? "").trim() || undefined,
    email: String(formData.get("email") ?? "").trim() || undefined,
  };

  try {
    await updateCustomer(id, fields);
  } catch (error) {
    console.error("[customers] update failed", error);
  }
  revalidatePath("/customers");
}
