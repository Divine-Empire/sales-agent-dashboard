"use server";

import { revalidatePath } from "next/cache";
import {
  ApiError,
  createAccessory,
  deleteAccessory,
  updateAccessory,
} from "@/lib/api";
import { requireDashboardSession } from "@/lib/auth";

export interface AccessoryFormState {
  ok: boolean;
  message: string;
}

/** Add an accessory/part by typing it in — no Google Sheet integration and no
 * document upload at this stage; these are entered manually and re-indexed
 * for RAG immediately so the agent can recommend them right away. */
export async function addAccessory(
  _prev: AccessoryFormState | null,
  formData: FormData,
): Promise<AccessoryFormState> {
  await requireDashboardSession();
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) {
    return { ok: false, message: "Name is required." };
  }

  try {
    await createAccessory({
      name,
      category: category || undefined,
      description: description || undefined,
    });
    revalidatePath("/accessories");
    return { ok: true, message: `${name} added and indexed.` };
  } catch (error) {
    console.error("[accessories] create failed", error);
    const message =
      error instanceof ApiError ? error.message : "Could not add the accessory.";
    return { ok: false, message };
  }
}

/** Edit an accessory's fields — re-indexed on the backend automatically so
 * RAG never serves a stale description after a correction. */
export async function editAccessory(
  _prev: AccessoryFormState | null,
  formData: FormData,
): Promise<AccessoryFormState> {
  await requireDashboardSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, message: "Missing accessory id." };

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const is_active = formData.get("is_active") === "on";

  if (!name) {
    return { ok: false, message: "Name is required." };
  }

  try {
    await updateAccessory(id, {
      name,
      category: category || undefined,
      description: description || undefined,
      is_active,
    });
    revalidatePath("/accessories");
    return { ok: true, message: "Saved." };
  } catch (error) {
    console.error("[accessories] edit failed", error);
    const message =
      error instanceof ApiError ? error.message : "Could not save changes.";
    return { ok: false, message };
  }
}

export async function removeAccessory(formData: FormData) {
  await requireDashboardSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteAccessory(id);
  revalidatePath("/accessories");
}
