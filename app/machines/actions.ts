"use server";

import { revalidatePath } from "next/cache";
import {
  addMachineFromText,
  ApiError,
  deleteMachine,
  updateMachine,
  uploadMachineDocument,
} from "@/lib/api";
import { requireDashboardSession } from "@/lib/auth";

export interface UploadState {
  ok: boolean;
  message: string;
}

/**
 * Upload a brochure or spec sheet and index it for the agent.
 *
 * Runs server-side so the API key never reaches the browser. Extraction errors
 * from the backend (422) carry messages written for a user — "this looks like a
 * scanned PDF" — so they are surfaced verbatim rather than replaced with a
 * generic failure.
 */
export async function uploadDocument(
  _prev: UploadState | null,
  formData: FormData,
): Promise<UploadState> {
  await requireDashboardSession();
  const file = formData.get("file");
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Choose a file to upload." };
  }
  if (!name || !category) {
    return { ok: false, message: "Machine name and category are required." };
  }

  try {
    const result = await uploadMachineDocument(formData);
    revalidatePath("/machines");
    if (result.embedded === 0) {
      return {
        ok: false,
        message:
          result.error ??
          "Text was extracted but could not be indexed. Try again shortly.",
      };
    }
    return {
      ok: true,
      message: `${result.name} indexed — ${result.embedded} chunk${
        result.embedded === 1 ? "" : "s"
      } from ${result.characters_extracted?.toLocaleString() ?? "?"} characters. The agent can answer questions about it now.`,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 422) {
      // The backend's extraction messages are user-facing by design.
      return { ok: false, message: error.message.replace(/^.*?: \d+ /, "") };
    }
    console.error("[machines] upload failed", error);
    return {
      ok: false,
      message:
        "Upload failed. Check the file is a text-based PDF, Word document, or text file under 10MB.",
    };
  }
}

/** Paste specifications directly — the path for scanned PDFs, which have no
 * text layer to extract. */
export async function addFromText(
  _prev: UploadState | null,
  formData: FormData,
): Promise<UploadState> {
  await requireDashboardSession();
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const text = String(formData.get("text") ?? "").trim();

  if (!name || !category || !text) {
    return {
      ok: false,
      message: "Name, category and specifications are all required.",
    };
  }

  try {
    const result = await addMachineFromText(formData);
    revalidatePath("/machines");
    return {
      ok: true,
      message: `${result.name} indexed — ${result.embedded} chunk${
        result.embedded === 1 ? "" : "s"
      }. The agent can answer questions about it now.`,
    };
  } catch (error) {
    console.error("[machines] text add failed", error);
    return { ok: false, message: "Could not add the machine. Try again." };
  }
}

export async function removeMachine(formData: FormData) {
  await requireDashboardSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteMachine(id);
  revalidatePath("/machines");
}

export interface EditState {
  ok: boolean;
  message: string;
}

/** Edit a catalog entry's own fields (price, description, etc.) without
 * re-uploading its source document — wired to the PATCH /api/machines/{id}
 * route that already existed on the backend but had no dashboard UI. */
export async function editMachine(
  _prev: EditState | null,
  formData: FormData,
): Promise<EditState> {
  await requireDashboardSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, message: "Missing machine id." };

  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price_range = String(formData.get("price_range") ?? "").trim();
  const lead_time = String(formData.get("lead_time") ?? "").trim();
  const is_active = formData.get("is_active") === "on";

  if (!name || !category) {
    return { ok: false, message: "Name and category are required." };
  }

  try {
    await updateMachine(id, {
      name,
      category,
      description: description || undefined,
      price_range: price_range || undefined,
      lead_time: lead_time || undefined,
      is_active,
    });
    revalidatePath("/machines");
    return { ok: true, message: "Saved." };
  } catch (error) {
    console.error("[machines] edit failed", error);
    const message =
      error instanceof ApiError ? error.message : "Could not save changes.";
    return { ok: false, message };
  }
}
