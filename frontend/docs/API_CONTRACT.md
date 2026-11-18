# Proposed FastAPI contract

**Not an existing backend guarantee.** Checked against upstream commit `31b83c5`; its README names the features, but endpoint schemas are not implemented. Coordinate this proposal with the backend owner before integration. Adapt `src/lib/contract.js` and `src/lib/backend.js` if the team chooses another shape.

## Transport

Browser → same-origin `/api/nids/<resource>` → Next.js server → FastAPI.

Next.js wraps each successful response as `{ "mode": "api", "data": <backend payload> }`. FastAPI should return the payload directly, without this wrapper. Local demo responses use `mode: "demo"`.

All timestamps are ISO 8601 with timezone (UTC preferred). UI displays local time. IDs must be unique per collection. Port, packet and byte values are nonnegative numbers. Null is not a supported replacement for required fields. Unknown/empty values must be agreed with the frontend rather than silently converted to misleading defaults.

| FastAPI method/path | Payload |
|---|---|
| GET /health | Health object |
| GET /stats | Reporting-window totals and chart arrays |
| GET /devices | Array of device objects |
| GET /connections | Array of flow objects |
| GET /alerts | Array of alert objects |
| POST /assistant | `{ "reply": "..." }` |

These are read-only dashboard operations except assistant POST. There are no device-blocking, packet-capture, model-training or alert-acknowledgement commands.

## GET /health

```json
{"status":"ok","capture_mode":"replay","updated_at":"2026-11-14T20:00:00Z"}
```

The UI displays backend-reported status and capture mode literally. `api` means API-connected; it does not mean the capture mode is live. Backend should include meaningful unhealthy status text and maintain sensor freshness checks.

## GET /stats

```json
{
  "window_label":"Last 24 hours",
  "packets":1000,
  "bytes":64000,
  "traffic":[
    {"timestamp":"2026-11-14T18:00:00Z","packets":400},
    {"timestamp":"2026-11-14T19:00:00Z","packets":600}
  ],
  "protocols":[{"protocol":"TCP","packets":800},{"protocol":"UDP","packets":200}]
}
```

`traffic` must be ordered oldest to newest, with packet counts for successive nonoverlapping intervals. `protocols` contains packet counts for the same reporting window. Packet totals should agree with both chart totals. Byte count is in bytes, displayed using decimal KB/MB. Empty arrays and zero counts are valid. A reporting window of zero traffic is not evidence of an operational sensor.

## GET /devices

```json
[{
  "id":"dev-1","name":"Lab workstation","ip":"192.168.1.10",
  "mac":"02:00:00:00:00:10","os":"Windows",
  "authorization":"authorized","status":"online",
  "last_seen":"2026-11-14T19:59:00Z"
}]
```

Enums: authorization = `authorized | unknown`; status = `online | offline`. Backend owns authorization and online/offline calculations. Frontend does not change the allowlist.

## GET /connections

```json
[{
  "id":"flow-1","source_ip":"192.168.1.10","source_port":52114,
  "destination_ip":"203.0.113.10","destination_port":443,
  "protocol":"TCP","packets":100,"bytes":6400,
  "classification":"benign","last_seen":"2026-11-14T19:59:00Z"
}]
```

Classification = `benign | suspicious`. Protocol is a string. For ICMP, this initial contract uses 0 for non-applicable ports; agree on a nullable-port revision if needed. Flows are historical records, not necessarily current sockets.

## GET /alerts

```json
[{
  "id":"ALT-001","title":"Possible port scan","severity":"high",
  "source_ip":"192.168.1.47","destination_ip":"192.168.1.20",
  "detector":"rule","status":"open","timestamp":"2026-11-14T19:57:00Z",
  "description":"Multiple ports were contacted in a short interval.",
  "recommendation":"Check whether this was an authorized test."
}]
```

Enums: severity = `low | medium | high | critical`; detector = `rule | ml`; status = `open | reviewed`. Status is displayed only; changing it requires an additional agreed endpoint and UI workflow. Descriptions and recommendations should reflect evidence and uncertainty.

## POST /assistant

Request:

```json
{"message":"Explain this alert","alert_id":"ALT-001"}
```

`alert_id` is optional. `message` must have 1–2,000 characters after sensible whitespace handling. The frontend forwards only the current message and optional alert ID, not complete chat history. Backend should retrieve authorized alert context itself; the browser's message is untrusted input.

Response:

```json
{"reply":"This finding suggests reconnaissance. Check the authorized lab schedule and affected destination ports."}
```

The LLM provider integration and secrets belong in `backend/app/llm/`, not this frontend. Implement access controls, rate limits, provider timeout handling and appropriate uncertainty in the real backend before deployment to other users. The assistant output is plain text, not executable HTML or commands.

## Failures and scale

The adapter uses a 10-second timeout for GET requests and 30 seconds for assistant requests. Non-2xx status, malformed JSON, or incompatible payloads become visible errors. The dashboard doesn't substitute demo data, invent zero counts, or silently retry assistant requests. A failed refresh hides the previous dataset rather than displaying it as fresh.

Empty arrays show empty states. Frontend pagination/search/filtering operates on all records in each returned array. For larger datasets, agree on query parameters such as `limit`, `offset`, `severity`, `search`, time range and server totals, then update both adapter and table state. Do not return a paginated `{items,total}` envelope until the frontend supports it.
