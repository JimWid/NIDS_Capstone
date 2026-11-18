# Team integration notes

## Scope

This package changes only `frontend/`. It fits the README's JavaScript dashboard direction: Next.js on port 3000, pages under `src/pages`, charts and assistant components under `src/components`. No upstream source was committed or pushed.

Inspected repository: https://github.com/JimWid/NIDS_Capstone, commit `31b83c5` (Updated README.md). At inspection, frontend/Dockerfile, backend/Dockerfile, backend/pyproject.toml and backend/app/main.py were empty. The README's `.env.example`, `db/init.sql` and downloadable PCAP/model setup were not complete. The root Compose file references `./ml/models`, while the README also describes `machine_learning/models`; DevOps/ML need to agree on the correct path. These are full-system blockers, not frontend install failures.

## Local development split

- Frontend owner: run the default demo, edit UI and tests, maintain API contract.
- Backend owner: implement FastAPI paths and payloads in API_CONTRACT.md or propose changes.
- Detection/ML owners: populate backend-readable records with meaningful evidence and timestamps.
- LLM owner: implement POST /assistant, obtain alert context server-side and keep keys private.
- DevOps: complete schema/bootstrap, PCAP/model paths and service Dockerfiles.

Each teammate clones the repo and runs `npm ci` in frontend or builds its container. Commit the lockfile. Do not copy node_modules between machines.

## Root Docker Compose change when backend is ready

Replace the root Compose frontend environment block with:

```yaml
  frontend:
    build: ./frontend
    environment:
      NIDS_DATA_MODE: api
      BACKEND_API_URL: http://backend:8000
    depends_on:
      - backend
    ports:
      - "3000:3000"
```

This is a documented proposed change only; the root file is untouched. Use `127.0.0.1:3000:3000` if the dashboard should be accessible only on the host. Broader access needs team agreement and authentication appropriate to the network data.

Important change from the existing root comments: this frontend uses a **server-side** proxy. The browser requests `/api/nids/...` on the dashboard host. The Next.js server requests `http://backend:8000`. Docker's `backend` service name is therefore correct here; `localhost:8000` inside the frontend container is not.

Remove `NEXT_PUBLIC_API_URL` in favor of `BACKEND_API_URL`. Runtime settings work for both npm and the built Docker image. Recreate the container after changing environment variables. No build-time credentials or hardcoded team IP addresses are needed.

Use the complete root Compose command only after other service setup is finished. Until then, `docker compose -f compose.demo.yml up --build` from frontend is independent.

## What this package does not provide

No traffic capture, ML model, database schema, real LLM service, authentication, GitHub automation, paid hosting or shared remote runtime. Each teammate's local instance uses its own configured backend. To share the same data, point instances to the same authorized backend or host one authenticated full system.

## Before merge

- Run `npm test` and `npm run build`.
- Perform the Windows checklist in WINDOWS_SETUP.md.
- Build/run the Docker demo; do not run it alongside npm on the same host port.
- Agree on the API contract, switch to API mode, and verify real backend data.
- Stop the backend and verify the visible error; confirm no sample records appear.
- Check a genuine assistant explanation with a known alert ID, timeout and error behavior.
- Check empty datasets and different severities, device states and protocols.
- Open a PR; have at least one teammate review before merging.
