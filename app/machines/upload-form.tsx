"use client";

import { useActionState, useState } from "react";
import { SURFACE_FIELD_CLASS } from "@/components/form-styles";
import { addFromText, uploadDocument, type UploadState } from "./actions";

const CATEGORIES = [
  "Survey Equipment",
  "Bar Bending & Cutting",
  "Compaction Equipment",
  "Concrete Equipment",
  "Concrete Cutting & Finishing",
  "Lifting & Material Handling",
  "Civil Lab & Testing",
  "Construction Chemicals",
  "Geosynthetics",
  "Safety Items",
  "Other Equipment",
];

const field = SURFACE_FIELD_CLASS;
const label = "block text-xs font-medium uppercase tracking-wide text-muted";

function Result({ state }: { state: UploadState | null }) {
  if (!state) return null;
  return (
    <p
      className={`rounded-lg px-3 py-2 text-sm ring-1 ring-inset ${
        state.ok
          ? "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30"
          : "bg-red-500/10 text-red-300 ring-red-500/30"
      }`}
    >
      {state.message}
    </p>
  );
}

export function AddMachineForm() {
  const [mode, setMode] = useState<"file" | "text">("file");
  const [uploadState, uploadAction, uploading] = useActionState(
    uploadDocument,
    null,
  );
  const [textState, textAction, adding] = useActionState(addFromText, null);

  const busy = uploading || adding;

  return (
    <div className="space-y-4 px-5 py-4">
      <div className="flex gap-2">
        {(["file", "text"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setMode(option)}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              mode === option
                ? "bg-blue-600 text-white"
                : "bg-border text-muted hover:text-foreground"
            }`}
          >
            {option === "file" ? "Upload document" : "Paste specifications"}
          </button>
        ))}
      </div>

      {mode === "file" ? (
        <form action={uploadAction} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="name">
                Machine name *
              </label>
              <input
                id="name"
                name="name"
                required
                placeholder="ManiQuip MQ-950 Concrete Pump"
                className={`mt-1 ${field}`}
              />
            </div>
            <div>
              <label className={label} htmlFor="category">
                Category *
              </label>
              <select
                id="category"
                name="category"
                required
                defaultValue=""
                className={`mt-1 ${field}`}
              >
                <option value="" disabled>
                  Select…
                </option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={label} htmlFor="machine_code">
                Model code
              </label>
              <input
                id="machine_code"
                name="machine_code"
                placeholder="MQ-950"
                className={`mt-1 ${field}`}
              />
            </div>
            <div>
              <label className={label} htmlFor="price_range">
                Price range
              </label>
              <input
                id="price_range"
                name="price_range"
                placeholder="₹18,50,000 – ₹21,00,000"
                className={`mt-1 ${field}`}
              />
            </div>
          </div>
          <div>
            <label className={label} htmlFor="file">
              Brochure or spec sheet *
            </label>
            <input
              id="file"
              name="file"
              type="file"
              required
              accept=".pdf,.docx,.txt,.md"
              className="mt-1 w-full cursor-pointer rounded-lg border border-dashed border-border bg-surface px-3 py-3 text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-border file:px-3 file:py-1.5 file:text-sm file:text-foreground"
            />
            <p className="mt-1.5 text-xs text-muted/70">
              PDF, Word or text, up to 10MB. Scanned PDFs contain images rather
              than text — use &ldquo;Paste specifications&rdquo; for those.
            </p>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
          >
            {uploading ? "Extracting and indexing…" : "Upload and index"}
          </button>
          <Result state={uploadState} />
        </form>
      ) : (
        <form action={textAction} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="t_name">
                Machine name *
              </label>
              <input
                id="t_name"
                name="name"
                required
                placeholder="Tamping Rammer TR-90"
                className={`mt-1 ${field}`}
              />
            </div>
            <div>
              <label className={label} htmlFor="t_category">
                Category *
              </label>
              <select
                id="t_category"
                name="category"
                required
                defaultValue=""
                className={`mt-1 ${field}`}
              >
                <option value="" disabled>
                  Select…
                </option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={label} htmlFor="t_text">
              Specifications *
            </label>
            <textarea
              id="t_text"
              name="text"
              required
              rows={8}
              placeholder={
                "Impact force: 15 kN\nWeight: 78 kg\nEngine: 4-stroke petrol\nPrice: approximately ₹35,000\nApplications: trench backfill, footpath compaction"
              }
              className={`mt-1 ${field} font-mono text-xs leading-relaxed`}
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
          >
            {adding ? "Indexing…" : "Add and index"}
          </button>
          <Result state={textState} />
        </form>
      )}
    </div>
  );
}
