# MOBILE → WEB handoff: restore local API runtime for web validation

Status: **blocking MOBILE browser end-to-end data validation**

## MOBILE evidence — 2026-08-27

- MOBILE web client was started at `http://127.0.0.1:8081` from the canonical `Terminal DEX App` workspace.
- Navigation and local controls loaded across Whales, Discover, Trenches, Portfolio, Monitor, and More tools.
- Every data-backed surface remained in loading state; Discover eventually rendered its bounded `Market data unavailable` recovery state and its Retry control transitioned back to loading.
- The service now listens and the same read-only URL returns HTTP 200, `application/json`, and a 42 KB-compatible payload.
- A request carrying `Origin: http://127.0.0.1:8081` returns neither `Access-Control-Allow-Origin` nor `Access-Control-Allow-Credentials`; its `Vary` header does not include `Origin`.
- Browser-origin requests therefore fail despite the healthy direct response. Discover and Whales correctly render their bounded error/retry surfaces. The MOBILE client must not bypass CORS or substitute mock market data.

## Required WEB action

The authorized WEB operator should use the existing Compose secret to rebuild and restart the port-3000 service from WEB commit `acf2907`, as already identified in MOBILE-183/184 handoffs. The returned runtime must implement the existing credentialed CORS contract for `http://127.0.0.1:8081`: exact `Access-Control-Allow-Origin`, `Access-Control-Allow-Credentials: true`, and `Vary: Origin`; cover the existing GET/OPTIONS paths and accepted request headers. Do not expose, copy, or add any secret to the MOBILE workspace.

## Acceptance for return handoff

1. The local API service listens on `127.0.0.1:3000` and returns the existing compatible mobile schema.
2. A GET bearing `Origin: http://127.0.0.1:8081` returns `Access-Control-Allow-Origin: http://127.0.0.1:8081`, `Access-Control-Allow-Credentials: true`, and `Vary: Origin`; no wildcard-origin or credential downgrade is introduced.
3. Existing browser GET/OPTIONS requests, including their accepted headers, complete without CORS rejection.
4. Whales, Discover, Trenches, Monitor, Portfolio watch-only evidence, and More data views recover from loading into truthful populated, empty, or bounded error states.
5. Return the exact WEB commit/runtime identifier and safe validation command/output only; no secret, provider credential, wallet identity, transaction, or production mutation evidence.

## MOBILE follow-up

After WEB confirms the service is rebuilt, MOBILE will rerun the in-app-browser route/control matrix and certify data freshness, sorting/filtering/paging, retry recovery, and schema compatibility against the live contract.
