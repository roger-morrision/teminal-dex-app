# MOBILE-QA — Latest independent validation

- Run (UTC): 2026-08-25T10:45:30.4324471Z
- Scope: `C:\Tuan\devApps\teminal-dex-app` only — canonical Terminal DEX Expo/mobile client. No WEB/backend workspace was accessed or modified.
- Inspected DEV commit: `c989842da854248783d5dcc4155bd3b0dbc4ccd5` (`feat: accept indexer health evidence`), based on DEV handoff `MOBILE-145`.
- Scope stability: HEAD remained `c989842` before and after validation. `qa_scope_changed` is present in the shared worktree: uncommitted Whale/token-row/logo and MOBILE→WEB handoff files are explicitly excluded by the DEV handoff. QA did not run the full regression suite or device flow tests against that mixed state.
- Environment: Windows 10.0.26100; bundled workspace Node runtime; Expo SDK 57; no responsive Android device/emulator session available.

## Acceptance and regression results

| MOBILE-QA area | Result | Evidence |
| --- | --- | --- |
| MOBILE-145 schema-v1 compatibility | PASS | Manual review confirms strict schema version/source, bounded fields and quality map, strict unavailable envelope, GET-only client routing, credential-aware read, and literal `automationSafe: false`. Status and health must agree (`200` iff healthy). |
| Valid unavailable response | PASS | Focused client test accepts HTTP 503 `not_configured` unavailable evidence without execution authority; request targets only `/api/indexer/health`. |
| Adversarial contract rejection | PASS | Focused schema test rejects contradictory `503`/healthy evidence and `automationSafe: true`. |
| TypeScript | PASS (shared-worktree signal) | `node_modules/typescript/bin/tsc --noEmit` exited 0. The result is not a clean-baseline release gate because unrelated edits were present. |
| Source lint | PASS (shared-worktree signal) | `node_modules/eslint/bin/eslint.js app src` exited 0, with the same shared-worktree limitation. |
| Focused regression | PASS | `node_modules/jest/bin/jest.js --runInBand src/__tests__/schema.test.ts src/__tests__/client.test.ts`: 2/2 suites, 73/73 tests passed. |
| Full automated regression | BLOCKED | Not run: `src/__tests__/TokenRow.test.tsx` and its rendered components are uncommitted concurrent work. Running the full suite would mix DEV increments. |
| Expo public config | PASS | `node_modules/expo/bin/cli config --type public` exited 0 and resolved iOS, Android, and web targets with `terminaldex` scheme. |
| Platform hardening / bundle artifact | PASS (static) | Android release manifest denies backup and cleartext; iOS ATS forbids arbitrary loads; existing debug APK is present (269,585,012 bytes, 2026-08-25 13:51 local). No rebuild was performed. |
| Expo Doctor | SKIP | `expo-doctor` is absent; no download was attempted. |
| Android runtime navigation, all tabs/subtabs, recovery states, large text, and accessibility traversal | BLOCKED | Android SDK `adb.exe` exists but is absent from PATH; prior shared-server commands were unresponsive. No shared ADB server was modified. |
| Live WEB API contract compatibility | NOT RUN | No approved runtime endpoint/environment was supplied. WEB remains a read-only external contract. |

## Findings

### MOBILE-QA-001 — P3 / process traceability — partially resolved

- Status: PARTIALLY RESOLVED. `docs/automation-handoffs/mobile-dev-latest.md` now provides commit, scope, criteria, contract assumptions, and QA focus. Repository `AGENTS.md` is still absent.
- Affected files: required automation guidance (missing); no product files changed by QA.
- Regression risk: lower confidence that future automation has repository-local operating instructions.
- Exact NEXT_DEV_ACTION: add repository `AGENTS.md` guidance or explicitly record that no repository-local guidance is required.
- WEB contract blocker: none.

### MOBILE-QA-002 — P2 / release-certification blocker — Android runtime unavailable

- Status: OPEN.
- Reproduction: `adb` is not available on PATH; the SDK executable is at `C:\Users\tuan.tran\AppData\Local\Android\Sdk\platform-tools\adb.exe`, but no responsive device/emulator session is available for safe QA use.
- Regression risk: installed-build navigation, live/stale/empty/filtered-empty/offline/error/retry/partial-page recovery, responsive large text, and TalkBack behavior remain uncertified.
- Exact NEXT_DEV_ACTION: provide one responsive Android emulator/device via a healthy ADB server, then certify the five-tab shell and affected routes at default and enlarged font scale.
- WEB contract blocker: none.

### MOBILE-QA-003 — P2 / release-gate blocker — full suite deferred for concurrent work

- Status: OPEN.
- Reproduction: shared worktree includes uncommitted `TokenRow`/`TokenAvatar`/Whales/DEX-logo changes outside `MOBILE-145`; full Jest would not represent immutable commit `c989842`.
- Affected files: concurrent files only; `MOBILE-145` schema/client files were unchanged during QA.
- Regression risk: no clean-baseline full-suite evidence for this increment.
- Exact NEXT_DEV_ACTION: commit or isolate the concurrent mobile slice, then run `node_modules/jest/bin/jest.js --ci --runInBand` against a clean immutable HEAD.
- WEB contract blocker: none.

## Release recommendation

**MOBILE-QA CONDITIONAL NO-GO for release certification.** `MOBILE-145` passes its focused schema/client acceptance evidence and static configuration checks. Do not claim full regression or physical Android sign-off until MOBILE-QA-002 and MOBILE-QA-003 close; resolve the remaining MOBILE-QA-001 traceability gap before the next automation run.

## Safe evidence references

- Commands and outputs were captured in this automation task; no secrets, backend origins, or provider diagnostics are included here.
- Existing artifact inspected only: `android/app/build/outputs/apk/debug/app-debug.apk`.
