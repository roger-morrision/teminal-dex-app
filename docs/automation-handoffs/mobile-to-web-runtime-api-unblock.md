# MOBILE → WEB handoff: restore local API runtime for web validation

Status: **blocking MOBILE browser end-to-end data validation**

## MOBILE evidence — 2026-08-27

- MOBILE web client was started at `http://127.0.0.1:8081` from the canonical `Terminal DEX App` workspace.
- Navigation and local controls loaded across Whales, Discover, Trenches, Portfolio, Monitor, and More tools.
- Every data-backed surface remained in loading state; Discover eventually rendered its bounded `Market data unavailable` recovery state and its Retry control transitioned back to loading.
- A read-only request to `http://127.0.0.1:3000/api/trending?period=24h&sort=trending&limit=50&view=mobile` failed with `HttpRequestException: No connection could be made because the target machine actively refused it. (127.0.0.1:3000)`.
- This is stronger than a malformed-payload/UI regression: no service is listening on the MOBILE development API origin. The MOBILE client correctly contains the failure and exposes recovery; it must not substitute mock market data.

## Required WEB action

The authorized WEB operator should use the existing Compose secret to rebuild and restart the port-3000 service from WEB commit `acf2907`, as already identified in MOBILE-183/184 handoffs. Do not expose, copy, or add any secret to the MOBILE workspace.

## Acceptance for return handoff

1. The local API service listens on `127.0.0.1:3000`.
2. Credentialed browser-origin reads from `http://127.0.0.1:8081` are allowed for the existing MOBILE contract; no wildcard-origin or credential downgrade is introduced.
3. `GET /api/trending?period=24h&sort=trending&limit=50&view=mobile` returns HTTP 200 and the existing compatible mobile schema.
4. Whales, Discover, Trenches, Monitor, Portfolio watch-only evidence, and More data views recover from loading into truthful populated, empty, or bounded error states.
5. Return the exact WEB commit/runtime identifier and safe validation command/output only; no secret, provider credential, wallet identity, transaction, or production mutation evidence.

## MOBILE follow-up

After WEB confirms the service is rebuilt, MOBILE will rerun the in-app-browser route/control matrix and certify data freshness, sorting/filtering/paging, retry recovery, and schema compatibility against the live contract.
