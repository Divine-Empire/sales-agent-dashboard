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

/** Renders the profile's `### Heading` / plain-paragraph markdown
 * (data/product_profile_template.md's shape, produced by the backend's
 * structure_product_profile) as actual headings and paragraphs — a rep
 * reading this should see a formatted profile, not raw "###" characters.
 * Deliberately a small hand-rolled parser rather than a markdown library:
 * the shape is fixed and narrow (## title, ### section, plain paragraphs),
 * not general-purpose markdown. */
function FormattedProfile({ content }: { content: string }) {
  const lines = content.split("\n");
  const blocks: { type: "h2" | "h3" | "p"; text: string }[] = [];
  let paragraph: string[] = [];

  const flush = () => {
    const text = paragraph.join(" ").trim();
    if (text) blocks.push({ type: "p", text });
    paragraph = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flush();
      continue;
    }
    if (trimmed.startsWith("### ")) {
      flush();
      blocks.push({ type: "h3", text: trimmed.slice(4) });
    } else if (trimmed.startsWith("## ")) {
      flush();
      blocks.push({ type: "h2", text: trimmed.slice(3) });
    } else {
      paragraph.push(trimmed);
    }
  }
  flush();

  if (blocks.length === 0) {
    return <p className="text-sm text-muted">No content yet.</p>;
  }

  return (
    <div className="space-y-3 text-left">
      {blocks.map((block, index) => {
        if (block.type === "h2") {
          return (
            <h2
              key={index}
              className="text-left text-base font-semibold text-foreground"
            >
              {block.text}
            </h2>
          );
        }
        if (block.type === "h3") {
          return (
            <h3
              key={index}
              className="pt-2 text-left text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300"
            >
              {block.text}
            </h3>
          );
        }
        return (
          <p key={index} className="text-left text-sm leading-6 text-foreground/85">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}

/** A machine's document content, opened as a modal (not an inline expand) —
 * view mode shows the profile formatted (headings/paragraphs, not raw
 * markdown); edit mode is a plain textarea over the same raw text. Content
 * is fetched lazily, only when the modal actually opens, via a Server
 * Action bridge (lib/api.ts's getMachineDocument is server-only and can't
 * be called from this client component directly). */
export function DocumentContentModal({
  documentId,
  machineName,
}: {
  documentId: string;
  machineName: string;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"view" | "edit">("view");
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
  }, [open, content, loading, documentId]);

  // A successful save should show the new content in view mode, not the
  // stale pre-edit text — editMachineDocument echoes the saved content back
  // in its result, so there's nothing to re-fetch or read from the DOM.
  useEffect(() => {
    if (state?.ok && state.content !== undefined) {
      setContent(state.content);
      setMode("view");
    }
  }, [state]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md px-2 py-1 text-xs text-muted transition-colors hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400"
      >
        View/Edit content
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl border border-border bg-background shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  {machineName}
                </h2>
                <p className="text-xs text-muted">Product profile content</p>
              </div>
              <div className="flex items-center gap-2">
                {content !== null && !loadError && (
                  <div className="flex gap-1 rounded-lg bg-surface p-1 ring-1 ring-border">
                    <button
                      type="button"
                      onClick={() => setMode("view")}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                        mode === "view"
                          ? "bg-blue-600 text-white"
                          : "text-muted hover:text-foreground"
                      }`}
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("edit")}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                        mode === "edit"
                          ? "bg-blue-600 text-white"
                          : "text-muted hover:text-foreground"
                      }`}
                    >
                      Edit
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="rounded-md p-1.5 text-muted transition-colors hover:bg-border/50 hover:text-foreground"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {loading && content === null && !loadError ? (
                <p className="text-sm text-muted">Loading…</p>
              ) : loadError ? (
                <p className="text-sm text-red-400">
                  Could not load this document&apos;s content. Try again shortly.
                </p>
              ) : mode === "view" ? (
                <FormattedProfile content={content ?? ""} />
              ) : (
                <form action={action} className="space-y-3">
                  <input type="hidden" name="document_id" value={documentId} />
                  <textarea
                    name="content"
                    rows={20}
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
          </div>
        </div>
      )}
    </>
  );
}
