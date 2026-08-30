"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { SURFACE_FIELD_CLASS } from "@/components/form-styles";
import {
  editMachineDocument,
  fetchMachineDocumentContent,
  type DocumentEditState,
} from "./actions";

function Result({ state }: { state: DocumentEditState | null }) {
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

/** "View/Edit content" toggle for one uploaded document. Fetches the full
 * content (list_machine_documents deliberately omits it) only when opened,
 * client-side via a Server Action rather than in the page's own server
 * render — this content can run to several KB per document across
 * potentially many documents, not worth loading for rows nobody expands. */
export function DocumentContentToggle({
  documentId,
  title,
}: {
  documentId: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [loading, startLoading] = useTransition();
  const [state, action, pending] = useActionState(editMachineDocument, null);

  useEffect(() => {
    if (open && content === null && !loading) {
      startLoading(async () => {
        const result = await fetchMachineDocumentContent(documentId);
        if (!result.ok && !result.content) {
          setLoadError(true);
          return;
        }
        setContent(result.content);
      });
    }
    // Re-open after a successful save re-fetches nothing — the form's own
    // textarea already holds the saved value, so there's nothing stale to
    // replace it with.
  }, [open, content, loading, documentId]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="shrink-0 rounded-md px-2 py-1 text-xs text-muted transition-colors hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400"
      >
        {open ? "Close" : "View/Edit content"}
      </button>
      {open && (
        <div className="mt-2 rounded-lg border border-border bg-surface px-4 py-3">
          {loading && !content && !loadError ? (
            <p className="text-xs text-muted">Loading…</p>
          ) : loadError ? (
            <p className="text-xs text-red-400">
              Could not load this document&apos;s content. Try again shortly.
            </p>
          ) : (
            <form action={action} className="space-y-3">
              <input type="hidden" name="document_id" value={documentId} />
              <label className="block text-xs font-medium uppercase tracking-wide text-muted">
                {title}
              </label>
              <textarea
                name="content"
                rows={16}
                defaultValue={content ?? ""}
                className={`font-mono text-xs leading-relaxed ${SURFACE_FIELD_CLASS}`}
              />
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
                >
                  {pending ? "Saving…" : "Save changes"}
                </button>
                <Result state={state} />
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
