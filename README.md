# Divine Empire — Sales Dashboard

Next.js dashboard for the AI sales agent. Reads from the agent's API on Render.

## Security model

Every backend call happens **server-side** — Server Components and Server
Actions only. `SALES_AGENT_API_KEY` never reaches the browser, because the API
returns customer PII (names, companies, budgets, full transcripts). `lib/api.ts`
imports `server-only`, so an accidental client import is a build error rather
than a silent leak.

Never rename these variables to `NEXT_PUBLIC_*`.

The rendered CRM is protected by a signed, HTTP-only session cookie. Configure
`CRM_AUTH_PASSWORD` and a high-entropy `CRM_SESSION_SECRET` of at least 32
characters. Server Actions and the search Route Handler verify the session in
addition to the route-level proxy check.

## Setup

```bash
bun install
cp .env.example .env.local   # fill in the two values
bun dev
```

| Variable | Value |
|---|---|
| `SALES_AGENT_API_URL` | `https://sales-agent-956w.onrender.com` |
| `SALES_AGENT_API_KEY` | Must match `DASHBOARD_API_KEY` on the Render service |
| `CRM_AUTH_PASSWORD` | Password used by authorised dashboard operators |
| `CRM_SESSION_SECRET` | Random 32+ character secret used to sign 8-hour sessions |

## Deploying to Vercel

```bash
vercel
```

Add both environment variables in the Vercel project settings. The API key must
be identical to Render's `DASHBOARD_API_KEY` — that shared secret is the whole
auth mechanism.

## Pages

| Route | BRD | Shows |
|---|---|---|
| `/` | §16 | Totals, funnel, machine interest, top leads |
| `/leads` | §9, §11 | Ranked leads with score factors, filterable by category |
| `/conversations/[id]` | §14, §16 | Full transcript, AI summary, per-conversation telemetry |
| `/handovers` | §12 | Queue with acknowledge/resolve actions |
| `/customers` | §16 | Everyone who has contacted the agent |
| `/machines` | §5 | Catalog, plus upload a brochure to index a new machine |
| `/reports` | §15 | Daily / weekly / monthly aggregates |
| `/logs` | §16 | Per-turn model, tokens, latency, estimated cost |
| `/opt-outs` | §13 | Opt-out register |

## Notes

- Every page is `force-dynamic`. Lead data changes with each conversation, and a
  cached dashboard is a misleading one.
- Read failures return empty shapes rather than throwing, so one slow endpoint
  cannot blank the whole page.
- The 45s fetch timeout accommodates Render free-tier cold starts (~30s).
- Charts are CSS bars, not a charting library — for ranked counts a div is
  legible, dependency-free, and renders server-side.
