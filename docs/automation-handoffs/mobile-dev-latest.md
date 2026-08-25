# MOBILE DEV → QA handoff

- Story: `MOBILE-145` — WEB indexer-health schema-v1 compatibility.
- Base commit: `8317820`.
- Result commit: the commit containing this handoff; QA must resolve and pin `git rev-parse HEAD` before testing.
- Scope: `src/api/schema.ts`, `src/api/client.ts`, focused schema/client tests, and MOBILE audit records only.
- Concurrent scope excluded: token-row, token-avatar, DEX-logo, Whales, and MOBILE→WEB handoff changes already present in the worktree.

## Changed behavior

- MOBILE can parse `GET /api/indexer/health` schema version 1 as healthy/degraded or explicitly unavailable.
- The contract rejects unknown execution authority, contradictory upstream status/health pairs, oversized quality maps, and malformed evidence.
- The client performs a credential-aware GET and accepts a valid unavailable envelope returned with HTTP 503.

## Acceptance checklist

- [x] Source and schema version are exact.
- [x] Missing configuration, unavailable upstream, and invalid contract remain distinct.
- [x] Healthy and degraded evidence retain bounded tip/freshness/ingestion/quality fields.
- [x] `automationSafe` is always literal `false`.
- [x] No UI, signing, submission, trading, or backend write path is introduced.

## QA commands and scenarios

- Focused: run `jest --runInBand src/__tests__/schema.test.ts src/__tests__/client.test.ts`.
- Gates: run TypeScript, local ESLint over `app` and `src`, then the full Jest suite.
- Inspect a valid 200 healthy envelope, a valid 503 unavailable envelope, and rejected 503/healthy plus `automationSafe: true` adversarial shapes.
- Confirm `git show --name-only HEAD` excludes the concurrent token-row/logo work listed above.

## Known risks and next action

- No production screen consumes this health evidence yet; visual presentation remains a separate BA/PO story.
- `MOBILE-QA-002` remains blocked on a stable Android/ADB runtime.
- `NEXT_QA_ACTION`: independently verify the immutable result commit and record pass/fail evidence without modifying product code.
