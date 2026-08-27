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

## Current CRM implementation

The improvement plan in `.agents/improvement.md` is authoritative. As of
2026-08-17, Phases 0–6 are complete:

- Phase 0: signed dashboard sessions protect every CRM route, Server Action,
  and Route Handler. `CRM_AUTH_PASSWORD` validates login and
  `CRM_SESSION_SECRET` signs the HTTP-only session cookie. Live-data failures
  are visibly different from valid empty results, and route loading/error
  boundaries preserve the shell.
- Phase 1: `AppShell` provides the persistent responsive frame, desktop
  sidebar, mobile drawer, top bar, global search, theme-correct Divine Empire
  logos, and shared workspace/filter/status primitives.
- Phase 2: `/conversations/telegram/[[...id]]` is the canonical read-only
  Telegram CRM inbox. It uses `GET /api/conversations?channel=telegram` for
  the list and the existing detail/log endpoints for the active thread. The
  UI has independent list/timeline/inspector panes, local search, honest
  missing-summary handling, and mobile list-to-chat navigation. Legacy
  `/conversations/[id]` URLs redirect to the canonical Telegram route.
- Phase 3: `/conversations/whatsapp/[[...id]]` — live and read-only since
  2026-08-26 (it began as a fixture preview). Details in the WhatsApp section
  below; that section is authoritative for this tab.
- Phase 4: Telegram and WhatsApp share the channel contract, conversation
  list shell/rows, contact header, timeline viewport, and date separators in
  `components/conversations/`. Channel-specific message bodies and CRM
  inspectors remain separate where their semantics differ. The former
  Pipeline temperature board is now the Board view at `/leads?view=board`;
  `/pipeline` redirects there for compatibility. Do not restore Pipeline as a
  separate primary-navigation concept until durable opportunity stages exist.
  Shared data-table and form-control styles replace the first repeated
  implementations; extend those primitives rather than adding new variants.
- Phase 5: `/customers/[id]` is the account workspace with complete contact
  identifiers, transcript, qualification facts, and next action. `/customers`
  has URL-persisted search, status, sort, and pagination; because the current
  backend customer endpoint supports only `limit`, these controls operate
  server-side over a bounded 500-record fetch until native query parameters
  are added. Overview is organized around hot leads, pending handovers, and
  recent conversations. `/operations/health` and the Operations navigation
  group separate service/AI telemetry from sales reporting. The former flat
  token-cost estimate was removed because it did not apply model-specific
  input and output rates.
- Phase 6: the quality pass adds keyboard skip navigation, reduced-motion
  handling, and modal focus management for the mobile drawer. Lint, typecheck,
  production build, and the disconnected-WhatsApp scan pass. A preview was
  deployed only to the linked `sales-agent-dashboard` Vercel project; no
  production promotion or `whatsapp-portal` change was made.
- Phase 7 (2026-08-27): catalog editing, an accessories/parts catalog, lead
  scoring transparency, and dashboard simplification. `/machines` gained a
  per-row Edit action (`app/machines/edit-machine-form.tsx`) wired to the
  backend's `PATCH /api/machines/{id}` — that route existed before this
  phase but had no dashboard UI. New `/accessories` page (own top-level nav
  entry under Records, not stacked into `/machines`) for the backend's new
  flat accessories catalog — **no machine linkage yet**, deliberately
  deferred; don't build UI implying that relationship exists until the
  backend adds it. `/leads`'s "Why" column is now clickable
  (`components/leads/lead-why-cell.tsx` + `factor-breakdown.tsx`) and expands
  into every scored factor against its max weight, not just the top 3 — the
  factor names/weights are a manually-kept mirror of the backend's
  `FACTOR_WEIGHTS` (`app/intelligence.py`), since the dashboard has no
  endpoint that returns them; if the backend ever changes those weights,
  this component goes stale until someone updates it by hand.
  `/logs` (raw LLM call/token/latency telemetry) was removed entirely — it
  was the closest thing to an "AI Insights" panel and wasn't sales-facing;
  the per-conversation Calls/Latency fields in the Telegram CRM inspector
  still work, since those pull `getAiLogs` scoped to one conversation, which
  was NOT removed from `lib/api.ts`. The "Insights" nav group (which only
  ever wrapped Reports) was retired; Reports moved into the Pipeline group
  alongside Overview/Leads/Handovers.

The first Telegram version is intentionally read-only. Do not make its
disabled composer operational until operator permissions, auditing, and a
backend send API have been explicitly designed.

Authenticated CRM operators need complete customer phone numbers and channel
identifiers. Do not visually mask these values in customer or conversation
workspaces. Note WhatsApp profile names are free text and real ones contain
newlines — collapse whitespace before rendering them in a single-line row
(`lib/whatsapp-live.ts` does this).

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
  `logs`, `machines` (+ upload/text-add/delete/PATCH), `accessories`
  (GET/POST/PATCH/DELETE, flat — no machine linkage yet, added 2026-08-27),
  and `whatsapp/conversations` (+ `whatsapp/conversations/{id}`, read-only,
  proxied from the portal). All require `X-API-Key`.
- `GET /api/conversations?limit=50&channel=telegram` is the dedicated inbox
  endpoint. It includes every conversation, customer/company identity, last
  message preview and role, latest lead score/category, handover status, and
  customer intent when available. Use it for the Telegram inbox rather than
  assembling several client-side requests.
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
backend's `.env`, and as of 2026-08-26 WhatsApp is live end to end. What that
does and does not permit here:

- **The sales-agent backend now answers WhatsApp automatically**, via
  `WhatsAppPortalAdapter` — it sends through the portal's own
  `/api/send-message`, never Meta directly, so the portal stays the single
  writer of its `whatsapp_portal_messages`. (An older line here said the
  adapter was unimplemented; that is no longer true.)
- **The same phone number is currently live in production** on a separate,
  already-mature system: `whatsapp-portal-divine.vercel.app`, repo
  `Divine-Empire/whatsapp-portal` (sibling directory `../whatsapp-portal`,
  audited 2026-08-26 — see that repo's own `CLAUDE.md` for full detail). It
  has its own Supabase project (not ours), its own Vercel deployment (Vercel
  project `whatsapp-portal`, team `mis-thedivineemps-projects` — the same
  team this dashboard's own Vercel project lives under; confirmed live via
  `vercel ls`/`vercel env ls` on 2026-08-26, most recent deploy 2 days old),
  and registers Meta's webhook directly against the real number. Meta allows
  one webhook per number, so registering anything from this dashboard or the
  sales-agent backend against that same number is a real, not hypothetical,
  collision risk.
- That portal is a real, feature-complete WhatsApp Business inbox — chat UI,
  template sender/tracker with delivery status, media send/receive, a
  Google-Sheets bulk-send bridge (`/api/sync-sheet`, fed by the same Apps
  Script referenced in the sales-agent repo's `app_script/`), and a
  keyword-based interest classifier. It is not a stub or a prototype; it is
  what the client actually uses today for WhatsApp.
- **The WhatsApp tab is live and read-only** (2026-08-26). It renders real
  threads from the portal via the sales-agent backend's
  `GET /api/whatsapp/conversations` and `/api/whatsapp/conversations/{id}` —
  the same server-only `lib/api.ts` client and API key as every other
  endpoint here. `lib/whatsapp-live.ts` maps portal records onto the shared
  channel contract. The fixtures, fixture adapter and fixture CRM inspector
  are deleted. Sending stays disabled pending operator permissions and an
  audit trail; the AI answers automatically, and the read-only note points an
  operator at the portal to step in.
- **Pagination**: the portal holds ~11,700 conversations. The list renders 50
  and grows by 50 via a `?show=<count>` URL param — a growing count, NOT a
  moving cursor window. An earlier version used `?before=<cursor>` and each
  click *replaced* the rows on screen, which read as conversations vanishing;
  do not reintroduce that shape. `MAX_SHOWN` (2000) is a render-weight guard,
  not a product limit; server-side search is the tool past it. Filters
  (`All`/`Unread`/`Opened`) mirror what the portal can answer — it tracks
  unread counts, not lead temperature.
- **The right pane reports delivery reality** (message counts, failures, last
  inbound, interest signal), not the fixture inspector's summary/next-action/
  budget fields. Those live in the sales-agent database keyed by
  `whatsapp:<phone>` and are not part of a portal conversation record —
  reusing those labels would print a column of em-dashes.
- **The rule that still binds** — and the whole point of the proxy design:
  this dashboard makes **no** call to Google Sheets, the Apps Script, the
  portal's Supabase, or the Meta Graph API, and holds no WhatsApp or portal
  credentials. Everything goes through the sales-agent backend on the one
  existing API key. Do not loosen that without the user saying so.
- Never copy the `whatsapp-portal` repo's code, secrets, or database access
  into this project. Reuse it conceptually (message/status model, date
  grouping, list density), not by importing it. Reading its source to learn
  how it solves something is fine and encouraged — the pagination fix above
  came from matching its own inbox behaviour.

## Current improvement plan

`.agents/improvement.md` was the plan for the CRM restructure (shared shell,
Telegram inbox on real data, WhatsApp preview on fixtures, auth, honest
loading/error/stale states). Phases 0–6 are complete, so it is now history
rather than a work list — and note its WhatsApp sections are **superseded**:
that tab runs on real portal data now, not fixtures. Its §1/§8 boundary
language is likewise superseded by the WhatsApp section above. Follow the
phase order only if picking up remaining polish; Phase 0 (auth + honest data
states) is explicitly release-blocking and should land before the visual
restructure. Phases 0–6 are complete; keep the phase table and implementation
notes current if new work is added.

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
