# NIDS Dashboard

An ordinary, editable Next.js frontend for JimWid/NIDS_Capstone. All application files live in `frontend/`. No ChatGPT hosting, account, proprietary service, or deployment is required. Your team can run the same files from Git.

**Start here: [Windows setup](docs/WINDOWS_SETUP.md).**

## What works now

- Overview: captured packet/byte totals, visible devices, recorded flows, open alerts, traffic chart, protocol breakdown and recent alerts.
- Devices: names, IP/MAC addresses, authorization, status and last-seen time.
- Connections: source/destination IPs and ports, protocol, packet/byte counts, classification and last-seen time.
- Alerts: severity filter, keyword search, chronological sorting, details and assistant context.
- Tables: pagination, empty states, search, filtering and export of all filtered rows as CSV.
- Assistant panel: labeled scripted examples in demo mode; real backend requests in API mode. Failed messages remain editable for retry.
- Manual refresh and optional 30-second refresh. Alert status is read-only; it is not a local acknowledgement workflow.
- Responsive layout, native keyboard-accessible dialogs and text alternatives for chart data.

Demo mode uses synthetic fixtures. It does not capture traffic, execute a detector, contact an LLM, or write to PostgreSQL. It needs no credentials. API mode never falls back to demo data on failure.

## Quick start

Prerequisite: Node.js 22+ (a currently supported LTS recommended), npm and a browser.

From this `frontend` folder:

```powershell
npm.cmd ci
npm.cmd run dev
```

Open http://localhost:3000. On macOS/Linux, use `npm` instead of `npm.cmd`.

No configuration file is required for demo mode. You can create one with:

```powershell
Copy-Item .env.example .env.local
```

Development saves automatically update the page. Stop the server with Ctrl+C.

## Quality checks

```powershell
npm.cmd test
npm.cmd run build
npm.cmd start
```

Stop the dev server before `start`, because both use port 3000. `next.config.mjs` also produces standalone server output for Docker. For the extracted standalone artifact use `node .next/standalone/server.js`; the Dockerfile copies its required static assets into place.

## Standalone Docker demo

Keep Docker Desktop open. From `frontend`:

```powershell
docker compose -f compose.demo.yml up --build
```

Open http://localhost:3000. Stop with Ctrl+C, then:

```powershell
docker compose -f compose.demo.yml down
```

This Compose file runs only the dashboard and binds it to your computer's loopback interface. It does not start unfinished backend/detection services.

Alternatively, from the repository root:

```powershell
docker build -t nids-dashboard ./frontend
docker run --rm -p 127.0.0.1:3000:3000 nids-dashboard
```

The container defaults to demo mode. It runs the built standalone Next.js server as the non-root `node` user. Dockerfile uses Node 24; the lockfile fixes application dependencies.

## Connect FastAPI later

In `frontend/.env.local`:

```dotenv
NIDS_DATA_MODE=api
BACKEND_API_URL=http://localhost:8000
```

Restart Next.js. This is server-side runtime configuration, so Docker can change it without rebuilding JavaScript. The browser talks to Next.js at `/api/nids/...`, and Next.js forwards to the configured FastAPI address. There is no browser-to-Postgres connection.

Read [API contract](docs/API_CONTRACT.md) and [team integration](docs/INTEGRATION.md). The endpoint shapes are a **proposal**, because the upstream README does not define them and its backend files were empty at revision `31b83c5`.

For Docker Compose, set `BACKEND_API_URL=http://backend:8000` on the frontend service. Within a container, `localhost` is that container, not the backend service or Windows. `NEXT_PUBLIC_API_URL` is accepted as a legacy server-side fallback, but prefer `BACKEND_API_URL` and remove the old setting to avoid ambiguity.

No secrets belong in `NEXT_PUBLIC_*` variables. Keep LLM provider keys on the FastAPI server.

## Where to edit

| File | Purpose |
|---|---|
| `src/pages/index.jsx` | Overview |
| `src/pages/devices.jsx` | Device table |
| `src/pages/connections.jsx` | Flow table |
| `src/pages/alerts.jsx` | Alert table and selection |
| `src/components/Layout.jsx` | Navigation, mode banner, refresh controls |
| `src/components/ProjectProvider.jsx` | Data fetching and refresh state |
| `src/components/Table.jsx` | Search, filters, sorting, pagination and CSV |
| `src/components/Charts.jsx` | Traffic and protocol charts |
| `src/components/AlertDetail.jsx` | Alert evidence and explanation action |
| `src/components/Assistant.jsx` | Chat panel |
| `src/styles.css` | Colors, spacing and responsive layout |
| `src/lib/demo.js` | Clearly synthetic sample records |
| `src/lib/contract.js` | Endpoint paths and response validation |
| `src/lib/backend.js` | FastAPI request adapter |
| `src/pages/api/nids/[resource].js` | Server routes and mode selection |

Charts use CSS bars with accessible text/data tables. No chart library or external font service is required. Do not add `src/pages/api` files to the Python backend: these routes run as part of the Next.js frontend.

## Current limitations

- API integration requires the team's real backend and data pipeline. No real detector, database or LLM implementation is bundled.
- Device/flow/alert counts summarize the returned arrays, not the entire network or a guaranteed global database count. Flow count is not a count of currently open sockets.
- The proposed API returns arrays. UI pagination is client-side. Add server-side pagination and matching totals before using large datasets.
- Traffic totals use the backend's reporting window, which is displayed on the overview. No unsupported time-range control is shown.
- Data is requested on initial load, manual refresh or the optional 30-second interval; it is not a streaming/WebSocket view.
- Demo data is regenerated with recent example timestamps on request. It does not persist or represent captured traffic.
- Chat is session-only within its open panel. Backend receives the current question and optional alert ID, not previous conversation messages.
- All users of a deployed instance would share its configured backend. This frontend does not implement accounts or access control. Keep it in a trusted local lab; add authentication/authorization and assistant rate limits before external exposure.

No files outside `frontend/` were changed, and nothing was pushed to GitHub.
