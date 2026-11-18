# Validation record

The automated test suite covers demo schemas, combined search/filter behavior, CSV escaping/formula protection, malformed response rejection, message limits, adapter routing, assistant payloads, backend failures, route method/resource rejection and the demo response envelope.

Results: `npm test` passed all 11 tests; `npm run build` succeeded and produced Overview, Devices, Connections, Alerts and the API route.

Environment limitations: Docker is not installed in the build workspace, so image build/run must be verified on your Windows Docker Desktop installation. The available browser preview launcher passes Vite-only arguments (`--host`, `--strictPort`) to Next.js, preventing its startup; browser visual/interaction QA could not be completed here. No production network, trained model or real LLM was available for end-to-end NIDS testing.

Use WINDOWS_SETUP.md for the manual browser/Docker checks and INTEGRATION.md for backend acceptance checks. Automated tests do not replace those checks.
