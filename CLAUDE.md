# sales-agent-dashboard — project context

This file exists so any agent (or human) working here has an accurate
picture of the backend this dashboard depends on, and what the parallel
sales-agent work looks like. Keep it current.

## What this is

Next.js 16 CRM dashboard for Divine Empire's AI sales agent. Server
Components + Server Actions call the sales-agent backend on Render via
`lib/api.ts` — **every** call is server-side; `SALES_AGENT_API_KEY` must
never reach the browser (`lib/api.ts` imports `server-only` specifically so
an accidental client import is a build error, not a silent leak).

Vercel project: `sales-agent-dashboard` (team `mis-thedivineemps-projects`).
Repo: `Divine-Empire/sales-agent-dashboard`.

## The backend you're calling

Repo `Divine-Empire/sales-agent` (sibling directory `../sales-agent`),
deployed at `https://sales-agent-956w.onrender.com`. **A different agent
session is actively working on it in parallel** — see that repo's
`CLAUDE.md` for full detail; the essentials:

- `conversation_id` format is always `"{channel}:{user_id}"` (e.g.
  `telegram:5377541635`) — stable, safe to use directly in a route param and
  in the URL redirect scheme this dashboard's improvement plan proposes.
- Current `/api/*` surface: `leads`, `handovers` (GET + PATCH status +
  PATCH category-override), `conversations/{id}`, `overview`,
  `reports/{type}`, `customers` (GET + PATCH), `opt-outs`, `summaries`,
  `logs`, `machines` (+ upload/text-add/delete). All require `X-API-Key`.
- **No dedicated conversation-list/inbox endpoint exists.** If a Telegram
  inbox view needs one (last-message preview, per-conversation attention
  state), that's new backend work — ask the other session for it rather
  than assembling it from several client-side round trips against
  `leads`/`summaries`/`customers`.
- **No unread/read-tracking concept exists anywhere in the schema.** Treat
  any "unread count" UI as backend-capability-gated (optional field, shown
  only when present), not something to fake client-side.
- `get_summary`/`/api/conversations/{id}` already correctly returns `summary:
  null` (not an error, not a 404) when a conversation hasn't been analysed
  yet — a "missing AI summary" state is real and distinguishable from a
  fetch failure today; build the UI to reflect that distinction rather than
  treating both as "no data."
- Lead scores are append-only — `current_leads` shows only the latest, but a
  manual override (`PATCH /api/leads/{id}?category=`) doesn't erase AI
  history, it adds to it. The next real customer message still triggers
  ordinary AI re-scoring on top. Don't build a UI that implies overriding a
  category is a permanent lock.

## WhatsApp — hard boundary, do not cross without explicit instruction

The client's real WhatsApp Business Cloud API credentials exist in the
backend's `.env` now, but:

- **The WhatsApp adapter is not implemented on the backend.**
- **The same phone number is currently live in production** on a separate
  system (`whatsapp-portal-divine.vercel.app`, its own Supabase project —
  not ours; plus a Google Apps Script receiving Meta's webhook directly).
  Meta allows one webhook per number, so this is a real, not hypothetical,
  collision risk.
- Any WhatsApp work in this dashboard **must stay UI-only against local
  fixtures** — no calls to Google Sheets, Apps Script, the WhatsApp portal's
  Supabase project, or the Meta Graph API, and no use of the real WhatsApp
  credentials, per the boundary already written into
  `.agents/improvement.md` §1 and §8. That constraint is correct and should
  not be loosened without the user saying so explicitly — it matches what
  the user has told the backend session directly.
- Never copy the `whatsapp-portal` repo's code, secrets, or database access
  into this project. Reuse it conceptually (message/status model, date
  grouping, list density) as the improvement plan already specifies, not by
  importing it.

## Current improvement plan

`.agents/improvement.md` is the active plan for this repo (CRM restructure:
shared shell, Telegram inbox backed by real data, WhatsApp preview backed by
fixtures, auth, honest loading/error/stale states). Reviewed against the
actual backend on 2026-08-17 — feasible, its own scope boundaries are sound,
and its assumptions about `conversation_id` stability, missing-summary
handling, and the missing inbox-list/unread-tracking endpoints all check out
against the real API. Follow its phase order; Phase 0 (auth + honest data
states) is explicitly release-blocking and should land before the visual
restructure.

## Conventions

Bun only (`bun install`/`bun run`), not npm/pnpm/yarn — pinned via
`vercel.json`, `package.json#packageManager`, and the Vercel dashboard's
Build & Deployment override; keep all three in sync if this ever changes.
Every page that reads live data is `force-dynamic`. Read failures from
`lib/api.ts` return typed empty/error shapes rather than throwing, so one
slow endpoint doesn't blank the whole page — the improvement plan's Phase 0
work should make "empty" and "failed" visibly distinct in the UI, not change
this fetch-layer behavior.

---

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
