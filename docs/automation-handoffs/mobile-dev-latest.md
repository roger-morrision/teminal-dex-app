# MOBILE DEV → QA handoff

## MOBILE-200 — Discover stale and scroll-retry evidence

- Trigger/base: QA report `ca1d543` accepted persistent runtime/current/empty/offline recovery but found stale evidence indistinct and pagination unreachable with a one-row first page; result: containing immutable DEV commit.
- Stable outcomes: `MOBILE-DATA-548` exposes stale provider evidence as an accessible live alert on primary Discover; `MOBILE-FIXTURE-549` makes the deterministic first page 24 unique mixed-DEX rows so real viewport scrolling can trigger `onEndReached`; `MOBILE-QA-550` preserves a 25th second-page row and one-shot cursor=1 503→200 retry.
- Production boundary: only truthful rendering of the existing `freshness.isStale` contract changed. The larger dataset exists exclusively in the opt-in MOBILE QA fixture and retains explicit fixture provenance.
- Acceptance: stale scenario displays localized `STALE / DEGRADED`; page-failure-once renders 24 initial rows, scroll triggers cursor `1`, existing rows remain visible after controlled 503, Retry requests the same cursor, and BONK appears after 200 recovery.
- Validation: fixture 3/3 PASS including 24 unique first-page addresses; primary accessibility 68/68 PASS; TypeScript PASS; affected ESLint PASS. Full regression and Doctor follow in containing-commit evidence.
- NEXT_QA_ACTION: pin the containing commit, start the persistent runtime, select stale and require the primary alert, then select page-failure-once, scroll Discover to the footer, verify retained rows/error/Retry, press Retry, and require BONK with no console errors.
- NEXT_WEB_ACTION: none; WEB remains read-only.

## MOBILE-199 — persistent verified fixture runtime

- Trigger/base: QA report `4d5dfbe` accepted the deterministic provider boundary but could not keep Metro reachable after its launching command ended; result: containing immutable DEV commit.
- Stable outcomes: `MOBILE-RUNTIME-544` starts Metro and the MOBILE QA fixture as detached exact-commit processes; `MOBILE-RUNTIME-545` waits up to 120 seconds for both bounded ports because the first Expo Web graph can exceed 45 seconds on this host; `MOBILE-SEC-546` records ownership/state only in the OS temp directory and refuses unowned shutdown; `MOBILE-OPS-547` provides explicit status and stop commands.
- Exact commands: `npm run qa:runtime:start -- --metro-port 8101 --fixture-port 3099`; `npm run qa:runtime:status`; `npm run qa:runtime:stop`. Start requires a clean tracked worktree, injects `MOBILE_BUILD_COMMIT=<HEAD>` and `EXPO_PUBLIC_API_URL=http://127.0.0.1:3099`, limits Metro to two workers, and never terminates occupied ports.
- Persistence/evidence: state and stdout/stderr live under `%TEMP%` as `terminal-dex-mobile-verified-runtime*`; no log, cache, build output, environment file, or provider payload is written to the repository. The operator must run stop after QA.
- Validation: TypeScript PASS; affected ESLint PASS; build-provenance 13/13 PASS; full Jest 89 suites / 482 tests PASS; Expo Doctor 21/21 PASS. Exact committed launcher `01ed18e` started detached Metro PID 41084 on 8103 and fixture PID 7668 on 3101, returned after both listeners were ready, and remained reachable after the launching shell ended: fixture HTTP 200 and `/monitor` HTTP 200 (52,287 bytes). Status reported both PIDs alive. Explicit stop removed the state and status returned `{running:false}` with both listeners closed. The initial 45-second attempt was cleanly stopped and motivated the bounded 120-second cold-start allowance.
- Findings reconciled: 17 carried release lanes. This closes the runtime-lifetime prerequisite for controlled browser evidence but does not itself claim rendered, device, accessibility, storage, Privy, performance, or upstream-Noble acceptance.
- NEXT_QA_ACTION: pin the containing commit, start the persistent runtime, confirm both PIDs/ports remain alive after the command exits, exercise fixture scenarios in the rendered UI, then run the explicit stop command and verify both listeners close.
- NEXT_WEB_ACTION: none; WEB remains read-only.

## MOBILE-198 — deterministic provider and recovery lane

- Trigger/base: QA report `0397573` accepted hydration commit `bdb613c`; result: containing immutable DEV commit. WEB remained read-only.
- Stable outcomes: `MOBILE-FIXTURE-540` adds a QA-only schema-compatible trending provider; `MOBILE-FIXTURE-541` supplies current/stale/empty/offline states; `MOBILE-FIXTURE-542` supplies a one-shot second-page failure with exact-cursor retry; `MOBILE-SEC-543` bounds control to five declared states behind an explicit header and exposes no secret/provider payload.
- Production boundary: the app API client, schemas, production configuration, and production data paths are unchanged. The fixture runs only when an operator explicitly starts `npm run qa:provider-fixture` and points a development build at it. It binds port 3099 by default, returns `mobile_qa_fixture` / `deterministic_test_fixture` provenance, stores nothing, signs nothing, and cannot trade.
- Exact runtime: terminal 1 `npm run qa:provider-fixture`; web terminal 2 set `EXPO_PUBLIC_API_URL=http://127.0.0.1:3099` then run `npm run dev:verified -- --web`; Android emulator uses `EXPO_PUBLIC_API_URL=http://10.0.2.2:3099`. Change state with POST `/__mobile_qa_fixture__/state?scenario=current|empty|stale|offline|page-failure-once` and header `x-mobile-fixture-control: qa-local`.
- Acceptance mapping: current→empty/stale/offline→current supports recovery evidence for `MOBILE-QA-273`/`287`; `page-failure-once` makes `MOBILE-QA-279` deterministic; current mixed-DEX pages make `MOBILE-QA-278` reset/filter behavior deterministic. Physical storage fault injection (`MOBILE-QA-275`) remains unavailable because no production runtime hook was introduced.
- Validation: fixture server 3/3 PASS; TypeScript PASS; `eslint app src scripts` PASS; full Jest 89 suites / 481 tests PASS; Expo Doctor 21/21 PASS. No export was required because runtime application code, packages, and bundler configuration are unchanged.
- Findings reconciled: 17 carried lanes. Four now have an operator-controlled runtime prerequisite; 13 remain physical-device/accessibility/layout/lifecycle/storage/performance, authorized Privy, or upstream Noble lanes. No acceptance result is inferred until QA runs the exact build.
- NEXT_QA_ACTION: pin the containing commit, run the fixture plus exact development build, execute current/empty/stale/offline recovery and one-shot cursor retry, then record build marker, route, locale, scenario, and console/device evidence.
- NEXT_WEB_ACTION: none. This fixture is MOBILE-owned QA infrastructure and requests no API/provider mutation.

## MOBILE-197 — browser hydration and console gate

- Trigger/base: QA NO-GO `829cdb2` against immutable `fed4403`; result: containing immutable DEV commit. WEB remained read-only.
- Stable outcome: `MOBILE-WEB-538` resolves `MOBILE-QA-288`. Regression control: `MOBILE-QA-539` adds an opt-in loopback browser-console capture gate; it is not enabled in normal serving or production output.
- Root cause/fix: the root safe-area provider had no deterministic server/client initial metrics, and the browser-dependent Expo tab navigator rendered during static hydration. Root layout now uses fixed initial safe-area metrics; the tab navigator renders a matching inert shell for the server/first client snapshot and mounts immediately after hydration. Native provider updates and post-hydration responsive dimensions remain active.
- Browser-console gate: `serve-web-export.mjs --capture-console` injects a diagnostic-only pre-bundle reporter, captures `console.error`, `window.error`, and unhandled rejections at a bounded loopback endpoint, and supports explicit reset between routes. Normal mode retains GET/HEAD-only semantics. Unit coverage is 3/3.
- Exact export command: `expo export --platform web --output-dir %TEMP%\terminal-dex-mobile-web-hydration-fix2` with bundled Node on PATH. Output contains 26 HTML routes; generated output is untracked.
- Artifact provenance: `index.html` 24,853 bytes / SHA-256 `E1477F6DEF6EE78EC60AB846783F0E23ADD616DA9807D55C347AD87B453278AB`; `whales.html` and `discover.html` 27,391 bytes / SHA-256 `6B383F1B4054252DA2FBBE873BBA8ACA81B6510B6BB804356E7C4F6017FB9B89`; `auth.html` 25,623 bytes / SHA-256 `F83FA01D2E4E71BB9E0E6C60E0AABF6855DECDE9F51B5C9F0A6A787EA4BB1ECA`.
- Exact browser evidence: real in-app browser loaded `/whales`, `/discover`, and `/auth` independently with capture reset between routes. Each route rendered its expected interactive DOM and returned `errors: []`; the final diagnostic endpoint returned `[]`. Before the fix, the same gate reproduced React #418 on Whales and Discover and proved Auth was resolved by deterministic safe-area metrics.
- Validation: TypeScript PASS; `eslint app src scripts` PASS; focused hydration 3/3 PASS; export-server 3/3 PASS; full Jest 89 suites / 481 tests PASS; Expo Doctor 21/21 PASS; fresh 26-route web export PASS. Known Noble/multiformats fallback warnings remain non-fatal and guarded.
- Findings reconciled: 20 release lanes. The hydration failure is closed; exact shortfall 17 remains `MOBILE-QA-269..280` plus `MOBILE-QA-283..287`, owned by physical-device/accessibility/layout/lifecycle/performance QA, controlled provider/network/storage fixtures, authorized live Privy operation, or upstream Noble maintainers.
- NEXT_QA_ACTION: pin the containing commit; rebuild a fresh export; run the capture-console server and require empty arrays after `/whales`, `/discover`, and `/auth`; then repeat route UI and device matrices.
- NEXT_WEB_ACTION: none; no API/schema/provider change is requested.

## MOBILE-196 — SDK patch alignment and route-complete export

- Trigger/base: QA NO-GO handoff against `65c26e8`; result: containing immutable DEV commit.
- Stable IDs: `MOBILE-TOOLCHAIN-536` and `MOBILE-EXPORT-537`.
- Changed behavior/files: `package.json` and `package-lock.json` align the three Doctor-required SDK patches (`expo ~57.0.18`, `expo-constants ~57.0.16`, `expo-font ~57.0.2`). `package-scripts.test.ts` pins that compatibility boundary. No generated export is tracked.
- Exact export command: `expo export --platform web --output-dir %TEMP%\terminal-dex-mobile-web-65c26e8-expo5718` using the repository-local Expo CLI with bundled Node on PATH.
- Artifact provenance: isolated output `C:\Users\TUAN~1.TRA\AppData\Local\Temp\terminal-dex-mobile-web-65c26e8-expo5718`; 26 HTML routes. `index.html` = 24,853 bytes, SHA-256 `5FD5CBA5FC44EC2614997B12A681E71037544E9C51AB634790064801EEFB6CAC`; `whales.html` = 44,552 bytes, SHA-256 `B6A4FD0110D4A0A3A0241ABCB6A746941C5EEA755BEDE9FFB83A1F2D699A1864`.
- Route proof: loopback export server returned HTTP 200 for `/` (24,853 bytes), `/whales` (44,542 bytes), `/discover` (42,175 bytes), and `/auth` (25,622 bytes). The old ignored `dist/` was neither trusted nor changed.
- Exact validation: Expo Doctor 21/21 PASS; Expo compatibility PASS; static web export PASS with 26 routes; loopback route proof PASS; export-server 2/2 PASS; TypeScript PASS; ESLint PASS; full Jest 89 suites / 480 tests PASS; focused package contract 1 suite / 10 tests PASS.
- Safety: MOBILE only; WEB, environment files, secrets, provider state, generated output, signing, transactions, trading, and CopyTrade remained untouched. Known upstream Noble/multiformats fallback warnings remain non-fatal and guarded.
- BA/PO reconciliation: 20 release lanes reviewed. Two material ready outcomes completed; exact shortfall 18 consists of physical-device/accessibility/layout/lifecycle/performance, controlled provider/network/storage fixtures, authorized live Privy operation, and upstream Noble ownership.
- NEXT_QA_ACTION: pin the immutable result; rerun `node scripts/run-expo-doctor.mjs`, the exact export command above into a fresh directory, verify all 26 route artifacts and the four loopback HTTP 200 checks, then continue UI/device lanes.
- NEXT_WEB_ACTION: none; WEB remains read-only and no API/schema change is requested.

## MOBILE-195 — Doctor npm isolation closure

- Base: `46b8667`; result: containing commit.
- ID: `MOBILE-QA-276` fully resolved by `MOBILE-TOOLCHAIN-535` after fresh QA proved child Node was fixed but child npm remained absent.
- Changed behavior/files: `scripts/run-expo-doctor.mjs` creates and finally-removes an ephemeral npm command on child PATH; `scripts/doctor-npm-inspector.mjs` implements only `--version` and lockfile-backed `explain`; unsupported/mutating commands fail closed. `src/__tests__/doctor-npm-inspector.test.ts` and package-script coverage protect the boundary.
- Acceptance evidence: exact non-escalated bundled-node invocation `node scripts/run-expo-doctor.mjs` exits 0 with `21/21 checks passed`; absent `@unimodules/core`, `expo-cli`, and `@react-native-vector-icons/common` results are derived from the committed lockfile, not fabricated package output.
- Exact validation: TypeScript PASS; source and affected-script ESLint PASS with zero warnings; focused inspector/package-script tests PASS; full Jest PASS (88 suites / 476 tests); Expo Doctor PASS (21/21) in the non-escalated QA-style shell.
- Security/safety: the compatibility command cannot install/update/remove packages; no environment file, cache, provider, WEB, wallet, signing, submission, trade, or production data path changes. Temporary command files are removed in finally-style cleanup.
- NEXT_QA_ACTION: pin the result commit and rerun the exact command in the clean archive shell that produced `spawn npm ENOENT`; confirm 21/21 and absence of retained `terminal-dex-doctor-*` temporary directories, then continue the exact-build runtime/device matrix.
- NEXT_WEB_ACTION: none; WEB remains read-only.

## MOBILE-194 — Doctor child runtime and verified-port recovery

- Base: `c4df51c`; result: containing commit.
- IDs: `MOBILE-QA-276` resolved by `MOBILE-TOOLCHAIN-533`; occupied runtime port blocker resolved by `MOBILE-RUNTIME-534`.
- Changed behavior/files: `scripts/run-expo-doctor.mjs` runs the local Doctor with the exact current Node directory prepended to child PATH; `package.json` routes the diagnostic through it. `scripts/start-verified.mjs` selects the first free loopback port in a bounded 19-port window when no explicit port is supplied, preserves `MOBILE_DEV_PORT`, and never terminates another process. Focused package/launcher tests protect both contracts.
- Acceptance evidence: the exact bundled-node wrapper invocation reports `21/21 checks passed`; the launcher contract proves explicit-port precedence, bounded selection, environment override, and absence of termination logic.
- Exact validation: TypeScript PASS; affected ESLint PASS; focused 2 suites / 19 tests PASS; full Jest PASS (87 suites / 470 tests); Expo compatibility PASS; Expo Doctor PASS (21/21).
- Security/safety: no WEB, environment, secret, provider, wallet, signing, submission, trade, or CopyTrade mutation. Existing processes are never terminated. No production mock data or generated output was added.
- Findings reconciled: 20 release lanes. Material outcomes completed: 2. Exact shortfall to 20: 18; the remaining lanes require authorized live Privy/provider operation, controlled provider fixtures, physical hardware/assistive technology, or upstream Noble remediation. Owner/carry-forward: QA/device (`MOBILE-QA-269..275`, `MOBILE-QA-280`), QA/provider fixture (`MOBILE-QA-278..279`), upstream dependency (`MOBILE-QA-277`), authorized identity/provider operator (live Privy and current ingestion evidence).
- NEXT_QA_ACTION: from the immutable result run `npm run diagnostics:doctor`, then run `npm run dev:verified -- --web` while 8081 is occupied and verify it reports/serves the next free port; execute Privy recovery and physical-device matrices on that exact build.
- NEXT_WEB_ACTION: keep WEB read-only from MOBILE; provider operations should supply controlled current/partial-failure evidence for QA without changing MOBILE production data paths.

## MOBILE-193 — bounded Privy initialization recovery

- Base: `9890872`; result: containing commit.
- IDs: `MOBILE-AUTH-529` bounded initialization, `MOBILE-RECOVERY-530` return path, `MOBILE-A11Y-531` announced alert/action semantics, `MOBILE-I18N-532` English/Vietnamese recovery copy.
- Fourteen-phase reconciliation: all phases remain implemented at source and automated-gate level. Existing phases 2–10 were verified without churn. This increment closes the remaining safe dependency-ready Phase 1/12 gap; no backend capability, provider result, or physical-device evidence was invented.
- Changed behavior/files: `app/auth.tsx` changes an unresolved Privy initialization from an infinite spinner to a 12-second bounded state with a localized alert and Return to app button; `src/settings/SettingsProvider.tsx` adds typed EN/VI copy; `src/__tests__/AuthScreen.test.tsx` and `src/__tests__/SettingsProvider.test.tsx` protect timing, navigation, and localization.
- Acceptance evidence: the spinner is present before the deadline; at 12 seconds it is removed, the alert is rendered, and pressing Return calls router back. Configured/ready provider behavior remains unchanged.
- Exact validation: TypeScript PASS; `eslint app src` PASS; focused Auth/Settings/Privy tests PASS (3 suites / 5 tests); full Jest PASS (87 suites / 468 tests); Expo compatibility PASS; Expo Doctor PASS (21/21); configured Web export PASS (26 routes including `/auth`); configured Android and iOS Hermes exports PASS. Native exports retain the known non-fatal upstream Noble `./crypto.js` strict-exports fallback warning.
- Security/evidence: public Privy identifiers were process-local only and were never printed, copied, staged, or committed. No environment file, WEB file, mock data, signing, submission, trading, or CopyTrade activation changed.
- Remaining conditional evidence: authorized live Privy signup/login/cancel/session-restore/logout; physical TalkBack/VoiceOver/Switch Access, large-text/layout, lifecycle/network fault injection, and performance; current provider ingestion fixtures.
- NEXT_QA_ACTION: pin the result commit and exercise unready → timeout → Return on Web and Android; then execute live EN/VI email and Google flows plus session restoration using an authorized exact development build, recording device/OS/build/provider evidence.
- NEXT_WEB_ACTION: keep WEB read-only from MOBILE. WEB/provider operations must maintain current discovery/indexer/research ingestion and deterministic qualified-current fixtures; no API schema change is requested.

## MOBILE-192 — Windows Metro file-handle recovery

- Base: `d1a633c`; result: containing commit.
- ID: `MOBILE-DEV-EMFILE-528`.
- Changed behavior/files: `scripts/start-verified.mjs` injects a two-worker default only when the operator did not supply `--max-workers`; `MOBILE_METRO_MAX_WORKERS` is accepted only as an integer from 1 through 8; `src/__tests__/build-provenance.test.ts` protects the bounded/default/override contract.
- Exact validation: TypeScript PASS; focused ESLint PASS; focused launcher suite 10/10 PASS; full Jest 86 suites / 467 tests PASS.
- Runtime evidence: the pre-fix verified port-8082 run logged `EMFILE: too many open files` during concurrent first-route bundles, then recovered and rendered Privy EN/VI with working More→Auth, Close, Settings, language switching, enabled provider buttons, and zero browser console errors.
- Known runtime blocker: port 8081 is held by PID 56660 and port 8082 by the prior verified PID 58776. Termination approval was denied because PID 56660 ownership could not be proven; the code fix is committed but exact port-8081 replacement requires the user/operator to close or explicitly authorize replacement of that session.
- NEXT_QA_ACTION: start the result commit with `npm run dev:verified -- --web --port 8081 --clear`, confirm the log includes `--max-workers 2` behavior through absence of `EMFILE`, then repeat More→Privy, EN/VI, close/back, and console-error checks.
- NEXT_WEB_ACTION: none; WEB remains read-only.

## MOBILE-191 — fourteen-phase completion and Privy release hardening

- Base: `1b820ff`; result: containing commit.
- IDs: `MOBILE-AUTH-523` public-config compatibility, `MOBILE-SEC-524` public-secret rejection, `MOBILE-I18N-525` bilingual Privy flow, `MOBILE-BUNDLE-526` configured three-platform exports, `MOBILE-RELEASE-527` fourteen-phase acceptance ledger.
- Changed behavior/files: `app.config.js` safely accepts the authorized public WEB aliases without storing their values; `app/auth.tsx`, `app/(tabs)/more.tsx`, and `src/settings/SettingsProvider.tsx` localize all Privy states in EN/VI; focused config/settings regressions protect both behavior and security.
- Phase acceptance: phases 1–14 are reconciled and implemented at source/automated-gate level. Existing phases 2–10 were verified, not churned. No backend capability, provider evidence, transaction path, or production mock was invented.
- Exact validation: `tsc --noEmit` PASS; `eslint app src` PASS with zero warnings; `jest --runInBand` PASS 86 suites / 466 tests; `expo install --check` PASS; `expo-doctor` PASS 21/21; configured Web export PASS with `/auth`; configured Android export PASS (3,411 modules, 9.4 MB Hermes, 46 assets); configured iOS export PASS (3,287 modules, 9.1 MB Hermes, 42 assets).
- Security evidence: WEB `.env.local` was read only for the two named public values and injected only into child export/config processes; no value was printed, copied, staged, or committed. Secret-shaped `privy_app_secret_*` values fail closed. Production trading/signing/submission/CopyTrade activation remains disabled.
- Known conditional: Android/iOS exports retain the regression-guarded upstream Noble `./crypto.js` strict-exports fallback warning; bundles succeed without unresolved modules.
- Runtime scenarios for QA: EN and VI unconfigured setup state; email signup/login OTP success, invalid and expired recovery; Google success/cancel/offline; session restoration; logout; account entry from More; Portfolio ownership remains separate; 320dp/large-text plus TalkBack/VoiceOver/Switch Access; offline/reconnect/background/restore; Whales/Discover live/empty/stale/retry with current provider evidence.
- NEXT_QA_ACTION: pin the result commit, configure only authorized public IDs in the exact development build, then execute the runtime/device matrix above and record build marker, OS/device, locale, provider outcome, screenshots, accessibility findings, and performance evidence.
- NEXT_WEB_ACTION: keep WEB read-only from MOBILE; WEB/provider operations must keep discovery/indexer/research heartbeats current and supply deterministic qualified-current fixtures. No API-schema change is requested.

## MOBILE Privy identity integration

- Base: `a492ad2`; result: containing commit.
- IDs: `MOBILE-AUTH-518..520`, `MOBILE-SEC-521`, `MOBILE-BUNDLE-522`.
- Changed behavior/files: `app/auth.tsx` provides accessible signup/login/account UI; `src/auth/PrivyAuthProvider.native.tsx` uses Privy Expo email OTP and Google; `.web.tsx` uses Privy's web modal; `app/_layout.tsx` installs the provider; More exposes account state; `app.config.js` accepts public App/Client IDs; `metro.config.js` keeps native jose on WebCrypto; package manifests include official peers and patched axios/ws overrides.
- Acceptance evidence: TypeScript PASS; full source ESLint PASS; focused Privy 2 suites/4 tests PASS; full Jest 85 suites/463 tests PASS; Expo install check PASS; Doctor 21/21 PASS; web static export PASS (26 routes including `/auth`); Android Hermes export PASS (3,411 modules, 9.4 MB); npm production audit 0 high/critical and 20 moderate.
- Security acceptance: no secret/environment file or backend mutation; provider errors are bounded; missing config fails closed; authentication cannot verify a Solana wallet or enable trade/sign/submit/CopyTrade paths.
- Runtime scenarios: (1) unconfigured build shows setup prerequisite; (2) new email gets OTP and creates account; (3) existing email logs in; (4) invalid/expired OTP remains recoverable; (5) Google success/cancel/offline; (6) process restart restores Privy session; (7) logout clears it; (8) Portfolio still separately requires verified wallet ownership.
- Known blocker/owner: live authentication evidence requires the authorized Privy operator to provide the public App ID and mobile Client ID and register URL scheme `terminaldex`. These identifiers were not inspected or invented.
- NEXT_QA_ACTION: create an exact development build with authorized identifiers and execute all eight scenarios on web and Android, recording Privy dashboard/client configuration and build commit.
- NEXT_WEB_ACTION: confirm email and Google are enabled in the existing Privy application and provide/authorize its public App ID plus MOBILE Client ID; no WEB source change requested.

## MOBILE blocker cleanup — Monitor DEX, web semantics, and Expo SDK

- Base: `4d1b8f2`; result: containing commit.
- Closed/reconciled IDs: `MOBILE-FILTER-515`, `MOBILE-A11Y-517`, and `MOBILE-QA-276`.
- Changed behavior/files: `src/components/MonitorTokenTable.tsx` stores observed DEX selections canonically; `src/__tests__/MonitorTokenTable.test.tsx` covers mixed Pump.fun/letsbonk filtering and reset; `package.json`/`package-lock.json` align nine Expo SDK patches and declare the separated React Native/Jest renderer peers.
- Prior immutable fixes: Discover sibling detail/watchlist controls are commit `3c2ac41`; Trenches sibling detail/quote controls are commit `4d1b8f2`.
- Acceptance evidence: TypeScript PASS; full source ESLint PASS; focused blocker regression 3 suites/17 tests PASS; full regression 83 suites/459 tests PASS; Expo compatibility PASS; Expo Doctor 21/21 PASS; Android Hermes export PASS (1,729 modules, 5.7 MB bundle) with the guarded upstream Noble fallback warning.
- Security evidence: production audit has no high/critical finding at the configured threshold. Eleven moderate Expo configuration-tooling advisories remain; `npm audit fix --force` would break compatibility by downgrading Expo to 46 and was not used.
- Runtime scenarios for QA: Monitor → Filters → observed DEX Pump.fun must remove letsbonk rows and show the filtered count; Reset must restore both providers. Discover and Trenches must expose sibling actions with `button button = 0` and no fresh hydration error. Run Expo Doctor with bundled Node on PATH and repeat Android export.
- Known external conditions: physical TalkBack/VoiceOver/Switch Access, physical-device large-text/layout/performance, lifecycle/storage/network fault injection, and upstream Noble package exports. These are not represented as code failures or silently closed.
- NEXT_QA_ACTION: pin the result commit and independently rerun the scenarios and exact commands above.
- NEXT_WEB_ACTION: none; WEB remains read-only and current local-browser CORS is recorded PASS.

## MOBILE-184 — localized Token and Wallet percentages

- Base: `e0a6dc9`; result: containing commit.
- Findings: 20 reconciled; completed all 16 safe outcomes (`MOBILE-I18N-483..498`); exact shortfall 4 (`MOBILE-QA-269..271`, `MOBILE-WEB-CORS-001`) with external owners.
- Changed behavior/files: shared bounded `localizedFixed`/`localizedPercent` formatters drive Token Detail holder/cluster/trader/early-buyer/overview/narrative evidence and Wallet Intelligence reliability/performance/balance/portfolio evidence.
- Acceptance evidence: TypeScript PASS; full source ESLint PASS; focused available Jest PASS (3 suites/19 tests); full Jest PASS (83 suites/457 tests); two requested wallet suite names were absent and are explicitly not counted.
- Runtime scenario: switch EN/VI and exercise fractional/whole/non-finite values across Token Detail and Wallet Intelligence, verifying separators, precision, and fallback without changed calculations.
- Known risks: physical assistive verification and stale WEB port-3000 runtime remain externally owned.
- NEXT_QA_ACTION: independently classify all 16 IDs and add rendered wallet regression if required.
- NEXT_WEB_ACTION: authorized operator supplies the existing Compose secret and rebuilds/restarts port 3000 from `acf2907`.

## MOBILE-183 — localized cross-surface quantities

- Base: `7c85998`; result: containing commit.
- Findings: 20 reconciled; completed all 13 safe outcomes (`MOBILE-I18N-470..482`); exact shortfall 7 (`MOBILE-QA-269..274`, `MOBILE-WEB-CORS-001`) with external owners.
- Changed behavior/files: a shared `localizedNumber` formats Portfolio and wallet holdings, Market Intelligence slots, Token Detail holder/index counts, and Operations tip/recovery/persisted counters using selected EN/VI; non-finite values fail closed.
- Acceptance evidence: TypeScript PASS; full source ESLint PASS; focused Jest PASS (4 suites/16 tests); full Jest PASS (83 suites/456 tests).
- Runtime scenario: switch EN/VI across all five product areas and verify thousands/decimal separators plus invalid-number fallback without changed source values.
- Known risks: physical accessibility/layout/offline evidence remains external; WEB CORS code is committed at `acf2907`, but the stale port-3000 container awaits authorized secret-backed rebuild/restart.
- NEXT_QA_ACTION: independently classify all 13 IDs through the runtime scenario.
- NEXT_WEB_ACTION: authorized WEB operator supplies existing Compose secret and rebuilds/restarts port 3000, then verifies credentialed Whales/Discover web reads.

## MOBILE-182 — localized Token Detail chronology

- Base: `a2c5f6b`; result: containing commit.
- Findings: 20 reconciled; completed all three safe outcomes (`MOBILE-I18N-467..469`); exact shortfall 17 (`MOBILE-QA-269..280`, `MOBILE-QA-283..287`) with external owners.
- Changed behavior/files: Token Detail early buyers, security snapshots, and Whale events delegate provider time to the shared localized defensive formatter.
- Acceptance evidence: TypeScript PASS; full source ESLint PASS; focused Jest PASS (3 suites/17 tests); full Jest PASS (83 suites/455 tests).
- Runtime scenario: switch EN/VI and feed seconds, milliseconds, ISO, and malformed timestamps through all three Token Detail evidence sections; verify localized/fallback output without reordered rows.
- Known risks: exact physical accessibility/layout/recovery/performance and controlled provider fixtures remain external.
- NEXT_QA_ACTION: independently classify all three IDs through the runtime scenario, then continue the blocked matrix.
- NEXT_WEB_ACTION: none.

## MOBILE-181 — localized AI and Track chronology

- Base: `f409ec2`; result: containing commit.
- Findings: 20 reconciled; completed all seven safe outcomes (`MOBILE-I18N-460..464`, `MOBILE-DATA-465..466`); exact shortfall 13 (`MOBILE-QA-269..280`, `MOBILE-QA-283`) with external owners.
- Changed behavior/files: AI discovery observations plus Track delivery, social, durable-history, and event timestamps use `observedDateTime`; the shared formatter accepts numeric or ISO provider time and fails closed for malformed strings.
- Acceptance evidence: TypeScript PASS; full source ESLint PASS; focused Jest PASS (2 suites/9 tests); full Jest PASS (83 suites/455 tests).
- Runtime scenario: switch EN/VI; feed seconds, milliseconds, valid ISO, and malformed time through AI and all four Track surfaces; verify localized/fallback output with unchanged ordering.
- Known risks: physical accessibility/layout/recovery/performance and controlled provider/network fixtures remain external.
- NEXT_QA_ACTION: independently classify all seven IDs through the runtime scenario, then continue the blocked matrix.
- NEXT_WEB_ACTION: none.

## MOBILE-180 — shared defensive relative ages

- Base: `cce8d4a`; result: containing commit.
- Findings: 20 reconciled; completed all 15 safe outcomes (`MOBILE-DATA-445..459`); exact shortfall 5 (`MOBILE-QA-269..273`) with physical-device/network-fixture owners.
- Changed behavior/files: `src/lib/format.ts` centralizes localized relative age; Discover, Trenches, Operations, and Monitor delegate to it, accepting seconds/milliseconds and rejecting malformed/future evidence; the formatter regression protects localized days and future fallback.
- Acceptance evidence: TypeScript PASS; full source ESLint PASS; focused Jest PASS (4 suites/32 tests); full Jest PASS (83 suites/455 tests); public Expo config PASS via the bundled Node runtime.
- Runtime scenario: on all four surfaces feed seconds and milliseconds timestamps at minutes/hours/days, malformed, and future values; switch EN/VI and verify truthful age/fallback without changing row order.
- Known risks: physical assistive-technology, 320dp/large-text, and controlled offline/reconnect validation remain external.
- NEXT_QA_ACTION: independently classify all 15 IDs through the runtime scenario, then execute `MOBILE-QA-269..273` when devices/fixtures are available.
- NEXT_WEB_ACTION: none.

## MOBILE-179 — localized live-Whale relative age

- Base: `502424a`; result: containing commit.
- Findings: 20 reconciled; completed all six safe outcomes (`MOBILE-I18N-439..442`, `MOBILE-DATA-443..444`); exact shortfall 14 (`MOBILE-QA-269..280`, `MOBILE-QA-283..284`) with external owners.
- Changed behavior/files: shared `relativeObservedAge` normalizes seconds/milliseconds into four bounded age units and rejects malformed/nonpositive/future time; live Whale cards translate the resulting unit through EN/VI settings.
- Acceptance evidence: TypeScript PASS; full source ESLint PASS; focused Jest PASS (2 suites/17 tests); full Jest PASS (83 suites/454 tests); public Expo config PASS.
- Runtime scenario: feed live Whale observations at 30 seconds, 2 minutes, 3 hours, 2 days, malformed, and future time; switch EN/VI and verify exact age/fallback without changing order.
- Known risks: physical accessibility/layout/recovery/performance, Doctor, Noble exports, and controlled provider fixtures remain external.
- NEXT_QA_ACTION: independently classify all six IDs through the runtime scenario, then continue the blocked matrix.
- NEXT_WEB_ACTION: none.

## MOBILE-178 — truthful localized Whale chronology

- Base: `b0663ac`; result: containing commit.
- Findings: 20 reconciled; completed all five safe outcomes (`MOBILE-I18N-434`, `MOBILE-DATA-435..438`); exact shortfall 15 (`MOBILE-QA-269..280`, `MOBILE-QA-283..285`) with external owners.
- Changed behavior/files: shared `observedDateTime` handles provider seconds/milliseconds, EN/VI locale, and invalid fallback; Whale flow uses it; Whale market snapshots localize market-cap shorthand and missing partial values.
- Acceptance evidence: TypeScript PASS; full source ESLint PASS; focused Jest PASS (3 suites/17 tests); full Jest PASS (83 suites/453 tests); public Expo config PASS.
- Runtime scenario: switch EN/VI on accumulating/distributing Whale views; inspect valid seconds/milliseconds and malformed observation times; exercise full, partial, and absent market snapshots.
- Known risks: physical accessibility/layout/recovery/performance, Doctor, Noble exports, and controlled provider fixtures remain external.
- NEXT_QA_ACTION: independently classify all five IDs using the runtime scenario, then continue the blocked matrix.
- NEXT_WEB_ACTION: none.

## MOBILE-177 — localized Discover market metrics

- Base: `03b342a`; result: containing commit.
- Findings: 20 reconciled; completed all four safe outcomes (`MOBILE-I18N-430`, `MOBILE-A11Y-431..433`); exact shortfall 16 (`MOBILE-QA-269..280`, `MOBILE-QA-283..286`) with external owners.
- Changed behavior/files: TokenRow localizes visible market-cap shorthand and groups price/market-cap/selected-period change into a truthful accessibility label; EN/VI catalog and focused regression cover available and unavailable change.
- Acceptance evidence: TypeScript PASS; full source ESLint PASS; focused TokenRow PASS (1 suite/12 tests); full Jest PASS (83 suites/452 tests); public Expo config PASS.
- Runtime scenario: in Discover switch 1h/6h/24h and EN/VI across positive, negative, and missing provider change; verify the visual second row and announced snapshot agree exactly.
- Known risks: physical assistive-tech/layout/recovery/performance, Doctor, Noble exports, and controlled provider fixtures remain external.
- NEXT_QA_ACTION: independently classify the four IDs with the runtime scenario, then continue the blocked matrix.
- NEXT_WEB_ACTION: none.

## MOBILE-176 — localized token and DEX artwork semantics

- Base: `5a1c4f3`; result: containing commit.
- Findings: 20 reconciled; completed all five safe outcomes (`MOBILE-I18N-425..429`); exact shortfall 15 (`MOBILE-QA-269..280`, `MOBILE-QA-283..285`) with external owners.
- Changed behavior/files: shared `TokenAvatar` and `DexLogo` accept caller-localized semantics; Discover and Token Detail supply EN/VI labels; Settings catalog and TokenRow regression protect the behavior.
- Acceptance evidence: TypeScript PASS; full source ESLint PASS; focused Jest PASS (2 suites/19 tests); full Jest PASS (83 suites/451 tests); public Expo config PASS.
- Runtime scenario: switch EN/VI; load and fail provider artwork; render Raydium and missing DEX evidence on Discover; open Token Detail and repeat token artwork checks. Confirm identity/navigation remain unchanged.
- Known risks: exact dev-client route plus physical accessibility/layout/recovery/performance, Doctor, Noble exports, and provider fixtures remain external.
- NEXT_QA_ACTION: independently classify all five IDs through the runtime scenario, then continue the blocked matrix.
- NEXT_WEB_ACTION: none.

## MOBILE-175 — Discover token-row localization integrity

- Base: `25c939b`; result: containing commit.
- Findings: 20 reconciled; completed all eight safe outcomes (`MOBILE-I18N-417..424`); exact shortfall 12 (`MOBILE-QA-269..280`) due unchanged external ownership.
- Changed behavior/files: `TokenRow` obtains eight user-facing strings from `SettingsProvider`; EN/VI catalogs and a rendered Vietnamese regression protect actions, unavailable/verified evidence, volume, and social semantics.
- Acceptance evidence: TypeScript PASS; full source ESLint PASS; focused TokenRow PASS (1 suite/11 tests); full Jest PASS (83 suites/451 tests); public Expo config PASS.
- Runtime scenario: open Discover, switch EN/VI, inspect a row with missing age/holders and social evidence, then toggle watch state; verify visible and accessibility text changes without changing navigation or stored watch intent.
- Known risks: physical-device accessibility/layout/recovery/performance, Doctor, Noble exports, and provider Monitor fixtures remain external.
- NEXT_QA_ACTION: independently classify all eight IDs in EN/VI with visual and screen-reader checks, then continue `MOBILE-QA-269..280` as fixtures allow.
- NEXT_WEB_ACTION: none.

## MOBILE-174 — deterministic recovery and strict whale threshold

- Base: `056f997`; result: containing commit.
- Findings: 20 reconciled; completed both safe outcomes (`MOBILE-QA-282`, `MOBILE-DATA-416`); exact shortfall 18, enumerated with owners in `WORKLOG.md`.
- Changed behavior/files: `src/__tests__/AsyncSurface.test.tsx` uses bounded async discovery and explicit teardown; `src/lib/whale-activity.ts` requires `valueUsd > 10_000`; `src/__tests__/whale-activity.test.ts` protects exact boundary behavior.
- Acceptance: exact grouped pair passed three consecutive runs (2 suites/35 tests each); whale suite passed (1 suite/11 tests); TypeScript and full source ESLint passed; full Jest passed (83 suites/450 tests); web production export passed (25 routes).
- Runtime scenarios: induce local-reset failure while the touch suite is loaded and verify the recovery action appears without teardown leakage; supply eligible holder evidence at $10,000/$10,001 and verify only the latter receives the token whale identity.
- Known risks: physical accessibility/layout/performance, controlled recovery, provider fixtures, Doctor child-process behavior, and Noble exports remain externally owned.
- NEXT_QA_ACTION: pin the result and independently classify `MOBILE-QA-282` and `MOBILE-DATA-416`, then execute blocked findings in stable-ID order as fixtures become available.
- NEXT_WEB_ACTION: no contract change; provider owners should supply controlled fixtures for `MOBILE-QA-278`, `MOBILE-QA-279`, and `MOBILE-QA-288`.

## MOBILE-173 — compact-control completion and quote-input boundary

- Base: `2440b95`; result: containing commit.
- Findings: 20 reconciled. Completed all 15 safe outcomes (`MOBILE-TOUCH-401..414`, `MOBILE-DATA-415`); exact shortfall 5 (`MOBILE-QA-269..273`) due physical device/network-fixture ownership.
- Changed behavior: 14 compact action/search/filter/recovery families expose 44px-equivalent geometry; quote amounts normalize non-decimal/repeated-separator input and cap whole/fraction precision before request state.
- Evidence: touch/async suites PASS (2 suites/35 tests); TypeScript/full source ESLint PASS; full Jest PASS (83 suites/450 tests); public Expo config PASS.
- Runtime scenarios: edge-tap named controls at normal/enlarged text; enter currency signs, exponent text, repeated decimal points, and overlong precision; confirm bounded UI value and no request until explicit quote action.
- Known risks: physical accessibility/small-screen/offline recovery, Doctor child-Node failure, and Noble fallback remain external.
- NEXT_QA_ACTION: pin the result, independently verify all 15 implemented IDs, and run the five blocked device/network scenarios when fixtures exist.
- NEXT_WEB_ACTION: none.

## MOBILE-172 — 20/20 secondary controls and loaded regression stability

- Base: `16ee90f`; result: containing commit.
- Findings/outcomes: completed `MOBILE-QA-281` plus `MOBILE-TOUCH-380..398`; exact shortfall 0.
- Changed behavior: the Monitor test keeps act-safe cleanup and uses a bounded 15s loaded-suite budget; 19 interactive families across AI, Market Intelligence, Operations, Research, Wallet Intelligence, Token Detail, Monitor, and Trade expose 44px geometry or compact-switch hit slop.
- Evidence: exact QA grouped command passes three consecutive runs (2 suites/24 tests each); TypeScript/full source ESLint PASS; full Jest PASS (83 suites/442 tests); public Expo config PASS.
- Runtime scenario: repeat the grouped command in a clean archive; edge-tap and screen-reader-focus each named control at 1.0×/1.3× font scale, checking selection, input, toggle, delete, and retry-safe behavior.
- Known risks: immutable device traversal, Doctor child-Node failure, physical assistive technology, and Noble fallback remain QA/toolchain/upstream owned.
- NEXT_QA_ACTION: pin the result, independently classify all 20 IDs, run archive-loaded grouping/full gates and physical edge-tap traversal.
- NEXT_WEB_ACTION: none.

## MOBILE-171 — 20/20 auxiliary motor-accessibility and regression stability

- Base: `bc21809`; result: containing commit.
- BA/PO and DEV: 20 current findings reconciled and 20 material outcomes completed (`MOBILE-QA-281`, `MOBILE-TOUCH-361..379`); exact shortfall 0.
- Changed behavior: Monitor grouped-test interaction/cleanup is act-safe; AI, CopyTrade, Research, Wallet Intelligence, Operations, Market Intelligence, Trade, Track, Settings, and Token Detail expose 19 measured interactive control families at a 44px minimum.
- Changed files: ten production routes, two focused regressions, and MOBILE evidence documents only.
- Evidence: TypeScript/full source ESLint PASS; focused Jest PASS (2 suites/16 tests); full Jest PASS (83 suites/433 tests); public Expo config PASS.
- Runtime scenario: edge-tap every named control at 1.0× and 1.3× font scale; verify focus, labels, wrapping, selection state, and retry behavior; repeat grouped Monitor suites to check order stability.
- Known risks: physical-device motor/accessibility evidence, exact API 37 traversal, restricted-shell Doctor, and Noble fallback remain QA-owned.
- NEXT_QA_ACTION: pin the result, independently classify all 20 IDs, repeat grouped Monitor and release gates, then perform device edge-tap traversal.
- NEXT_WEB_ACTION: none.

## MOBILE-170 — 20/20 live-feed evidence integrity

- Base: `c28a7f6`; result: containing commit.
- BA/PO and DEV: 20 current findings reconciled and 20 material outcomes completed (`MOBILE-DATA-341..360`); exact shortfall 0.
- Changed behavior: CopyTrade, Market Intelligence, Monitor, Trenches, Whales, and Track normalize 20 audited quality/source/provider/RPC/channel/status outputs; provider arrays trim, deduplicate, and fall back truthfully.
- Changed files: six production areas, shared formatter/regression, and MOBILE evidence documents only.
- Evidence: TypeScript/full source ESLint PASS; focused Jest 7 suites/24 tests PASS; full Jest 83 suites/423 tests PASS; public Expo config PASS.
- Runtime scenario: inject blank, whitespace, and duplicate provider evidence for each ID; verify localized fallback labels, stable provider ordering, no empty separators, and unchanged navigation/retry behavior.
- Known risks: immutable API 37 traversal, physical accessibility/resilience/performance, npm-enabled Doctor, and Noble fallback remain separately QA-owned.
- NEXT_QA_ACTION: pin the result, independently classify all 20 IDs, run malformed live-feed traversal and standard release gates.
- NEXT_WEB_ACTION: none.

## MOBILE-169 — 20/20 evidence-label integrity

- Base: `6d53b9e`; result: containing commit.
- BA/PO and DEV: 20 current findings reconciled and 20 material outcomes completed (`MOBILE-DATA-321..325`, `MOBILE-A11Y-326`, `MOBILE-DATA-327..340`); exact shortfall 0.
- Changed behavior: twenty distinct quality/source/provider/method/DEX/token outputs across Operations, Whales, Wallet Intelligence, Track, Token Detail, Discover, Monitor, and Trenches trim valid values and localize blank/missing evidence.
- Changed files: eight production areas plus shared formatter/test and MOBILE evidence documents.
- Evidence: TypeScript/full source ESLint PASS; focused Jest 7 suites/15 tests PASS; full Jest 83 suites/422 tests PASS; public Expo config PASS.
- Runtime scenario: inject whitespace-only values for each stable ID, verify localized fallback labels in visual and accessibility output, and confirm navigation/retry behavior remains unchanged.
- Known risks: exact API 37 provenance traversal, physical accessibility/resilience/performance, npm-enabled Doctor, Noble fallback, and provider-controlled Monitor scenarios remain separately QA-owned.
- NEXT_QA_ACTION: pin the result, independently classify all 20 IDs, run malformed-evidence UI traversal and standard release gates.
- NEXT_WEB_ACTION: none.

## MOBILE-168 — cross-surface provenance normalization

- Base: `df8b438`; result: containing commit.
- BA/PO: 20 current findings reconciled; 8 material outcomes completed (`MOBILE-DATA-301..308`); exact shortfall 12 (`MOBILE-QA-269..280`) with unchanged external owners.
- Changed behavior: Token Detail, Quote Review, Operations, Discover, Monitor, Trenches, Market Intelligence, and Wallet Intelligence trim valid provider labels and localize blank/missing DEX or source evidence.
- Changed files: eight production surfaces, shared formatter/test, and MOBILE evidence documents only.
- Evidence: TypeScript/full source ESLint PASS; focused Jest 4 suites/9 tests PASS; full Jest 83 suites/422 tests PASS; public Expo config PASS.
- Runtime scenario: provide whitespace-only DEX/source values to each named surface and verify a localized unavailable/unknown label appears, valid labels remain trimmed, and row/detail navigation is unchanged.
- Known risks: immutable API 37 coverage, physical accessibility/resilience/performance, npm-enabled Doctor, Noble fallback, and provider-controlled Monitor scenarios remain externally owned.
- NEXT_QA_ACTION: pin the result and independently classify `MOBILE-DATA-301..308` using malformed-evidence fixtures and the standard release gates.
- NEXT_WEB_ACTION: none.

## MOBILE-167 — Monitor provider DEX normalization

- Base: `6646131`; result: containing commit.
- BA/PO: 20 current findings reconciled. Completed 8 material ready outcomes (`MOBILE-DATA-281..288`); exact shortfall 12 (`MOBILE-QA-269..280`) with unchanged device/toolchain/upstream/provider-fixture owners recorded in `WORKLOG.md`.
- Changed behavior: malformed/blank/reserved DEX values cannot crash or create blank controls; case variants deduplicate; limiting follows normalization; selected filters compare null-safely; stale selections fail soft to All; rows localize unavailable provenance.
- Changed files: Monitor table/store, focused regression, and MOBILE evidence documents only.
- Evidence: TypeScript/full source ESLint PASS; focused Jest PASS (1 suite/6 tests); full Jest PASS (83 suites/421 tests); public Expo config PASS. Restricted-shell Doctor is blocked because its child `node` is unavailable.
- Runtime scenario: inject undefined/blank/`All`/case-duplicate DEX values into Monitor pages, open DEX filters, select a surviving option, refresh without it, and verify no crash, blank/duplicate choice, stranded empty table, or undefined provenance.
- Known risks: immutable API 37 rerun and physical accessibility/performance checks remain QA-owned; provider reset/cursor-failure fixtures remain unavailable.
- NEXT_QA_ACTION: pin the result and independently classify `MOBILE-DATA-281..288`, then run the Monitor runtime scenario and standard release gates.
- NEXT_WEB_ACTION: none.

## MOBILE-166 — Trenches provider DEX normalization

- Base: `51fd2e8`; result: containing commit.
- BA/PO: 20 current findings reconciled. Completed 8 material ready outcomes (`MOBILE-DATA-261..268`); exact shortfall 12 (`MOBILE-QA-269..280`) with device/toolchain/upstream/provider-fixture owners recorded in `WORKLOG.md`.
- Changed behavior: invalid/blank/reserved DEX values are excluded; case variants deduplicate with stable first casing; limiting occurs after normalization; filter comparison is null-safe; stale selection fails soft to All; card provenance uses localized unavailable evidence.
- Changed files: Trenches screen/filter library, focused regression, and MOBILE evidence documents only.
- Evidence: TypeScript/full source ESLint PASS; focused Jest PASS (3 suites/9 tests); full Jest PASS (83 suites/419 tests); public Expo config PASS. Restricted-shell Doctor remains 17/21 because child npm cannot spawn.
- Runtime scenario: inject undefined/blank/`All`/case-duplicate DEX values, open filter panel, select surviving DEX, refresh with selection removed, confirm no React key warning or undefined option and truthful card provenance.
- Known risks: immutable API 37 rerun is pending; Doctor/Noble/physical accessibility/provider-fixture blockers remain `MOBILE-QA-269..280`.
- NEXT_QA_ACTION: rerun the QA-021 reproduction on the immutable result and independently classify outcomes 261..268.
- NEXT_WEB_ACTION: none.

## MOBILE-165 — 20/20 touch-target and motor accessibility

- Base: `fe31e0c`; result: containing commit.
- Findings/outcomes: `MOBILE-TOUCH-241..260`; 20 measured production control families corrected, remaining to 20: 0. Acceptance evidence and ranking are in `WORKLOG.md`.
- Changed behavior: Discover mode/period/filter/retry/DEX/reset/apply; Monitor refresh/window/preset/direction/DEX/sort/density/reset/pagination; and Trenches lane/filter/launchpad/reset controls now meet a 44px target floor.
- Changed files: three production surfaces, focused touch-target regression, and MOBILE evidence documents only.
- Evidence: TypeScript and full source ESLint PASS; focused Jest PASS (5 suites/81 tests); full Jest PASS (83 suites/417 tests); public Expo config PASS. Restricted-shell Doctor is 17/21 because child `npm` is unavailable; normal-environment 21/21 remains in MOBILE-162.
- Runtime scenarios: edge-tap every named control at normal and 1.3× font scale; traverse horizontal rails with TalkBack/Switch Access; verify no overlap, clipping, or lost selection state.
- Known risk: physical-device motor-accessibility and small-screen visual confirmation remain external QA evidence.
- NEXT_QA_ACTION: pin the result and independently classify all 20 IDs, then run type/lint/full Jest/public config/device scenarios.
- NEXT_WEB_ACTION: none.

## MOBILE-164 — 20/20 input integrity and async-control safety

- Base: `31b683f`; result: containing commit.
- Findings/outcomes: `MOBILE-DATA-221..240`; 20 distinct material production behaviors completed, remaining to 20: 0. Acceptance criteria and source evidence are in `WORKLOG.md`.
- Changed behavior: exact-address/search inputs are natively bounded; Research and alert decimals normalize before state/API validation; radio sets expose group semantics; CopyTrade sizing fields align native and sanitizer bounds; Portfolio and tracked-wallet mutations cannot overlap.
- Changed files: Portfolio, Wallet Intelligence, Research Workspace/store, Whales, Monitor, CopyTrade, focused tests, and MOBILE evidence documents only.
- Evidence: TypeScript PASS; focused/full source ESLint PASS; focused Jest PASS (5 suites/24 tests); full Jest PASS (82 suites/414 tests); public Expo config PASS. Restricted-shell Doctor is 17/21 because child `npm` is unavailable; normal-environment 21/21 remains in MOBILE-162.
- Runtime scenarios: paste overlong address/search/decimal values; enter multiple decimal points; toggle grouped choices with TalkBack; rapidly press wallet disconnect/revoke/load/save/remove; force local persistence failure and retry.
- Known risk: physical-device keyboard, paste, and accessibility traversal remain QA device work.
- NEXT_QA_ACTION: validate all 20 IDs on the immutable result, rerun type/lint/full Jest/Expo diagnostics, and perform API 37 plus physical-device scenarios when available.
- NEXT_WEB_ACTION: none.

## MOBILE-163 — 20/20 filter integrity and accessibility batch

- Base: `2830415`; result: containing commit.
- Findings/outcomes: `MOBILE-A11Y-201..204`, `MOBILE-DATA-205..207`, `MOBILE-UX-208`, `MOBILE-A11Y-209..218`, and `MOBILE-DATA-219..220`. All 20 are material production behaviors with acceptance criteria recorded in `WORKLOG.md`; remaining to 20: 0.
- Changed behavior: Discover exposes tab/radio/modal/filter/pagination state and normalizes bounded thresholds; Monitor exposes separate exclusive groups, checkboxes, a real density switch, named reset, and truthful pagination state; Trenches aligns native/state text limits and caps bonding progress at 100.
- Changed files: `app/(tabs)/discover.tsx`, `app/(tabs)/trenches.tsx`, `src/components/MonitorTokenTable.tsx`, `src/lib/trenches.ts`, focused tests, and MOBILE evidence documents.
- Acceptance evidence: TypeScript PASS; focused ESLint PASS; focused Jest PASS (3 suites/12 tests); full Jest PASS (82 suites/411 tests). Restricted-shell Doctor 17/21 because child `npm` is unavailable; compatibility check blocked on external user-cache `EPERM`; normal-environment 21/21 remains recorded in MOBILE-162. No production mock/API/transaction behavior added.
- Runtime scenarios: Discover mode/period/DEX traversal; malformed threshold paste; modal open/close; pagination retry while busy; Monitor window/preset/direction/DEX/sort/density traversal; reset and load-more; Trenches 50-character keyword and 100% bonding cap.
- Known risk: TalkBack/VoiceOver traversal requires physical-device confirmation. API 37 already rendered Whales/Discover through the current Metro bundle without fatal or module-resolution errors; native rebuild remains host-loopback blocked.
- NEXT_QA_ACTION: pin the result commit and independently classify all 20 IDs pass/fail/blocked, then rerun type/lint/full Jest and API 37 runtime scenarios.
- NEXT_WEB_ACTION: none.

## MOBILE-162 — repository-local Expo Doctor

- Base: `6c5c5a9`; result: containing commit.
- Changed files/behavior: exact dev dependency `expo-doctor` 1.20.3; `diagnostics:doctor = expo-doctor`; command contract forbids implicit global/`npx`; dynamic config consumes Expo's supplied static config and preserves nullable public commit provenance.
- Acceptance: local Doctor 21/21; local Expo compatibility, TypeScript, and full primary-worktree Jest pass. Focused command/config Jest passes 14/14; the initial lint found one stale test-only suppression, removed before the final zero-warning lint gate.
- Security/release: development diagnostics only; no API, wallet, signing, submission, trading, credential, or WEB behavior changed. Existing 11 moderate build-tool advisories remain separately bounded by MOBILE-161.
- NEXT_QA_ACTION: pin the result; run `npm run diagnostics:doctor`, command/config focused tests, TypeScript, ESLint, full Jest, public config, and platform exports. Close `MOBILE-QA-008` only on 21/21 from the immutable checkout.
- 20/20 reconciliation: 20 findings reviewed; eight material diagnostic/config outcomes completed; shortfall 12 carried forward without padding.

---

## MOBILE-161 — dependency-audit runtime boundary

- Base: `b73b47a`; result: containing commit.
- Evidence: `npm audit --package-lock-only --omit=dev --json` reports 11 moderate, 0 high, 0 critical. Root advisory `uuid` 7.0.3 (`GHSA-w5hq-g745-h8pq`) is reached through `@expo/config-plugins → xcode` in Expo configuration/build tooling. npm's suggested Expo 46 downgrade and forced remediation were not applied.
- Changed files/behavior: `dependency-audit-boundary.test.ts` adds six fail-visible checks for direct-dependency exclusion, exact transitive path/versions, and absence of `uuid`/`xcode` runtime imports. Product, API, wallet, and transaction behavior are unchanged.
- Acceptance: focused Jest 6/6, TypeScript, warning-free source ESLint, and full primary-worktree Jest pass.
- Known risk: the upstream moderate advisory remains open and must be reevaluated with compatible Expo/xcode updates; the guard bounds exposure but is not a vulnerability fix.
- NEXT_QA_ACTION: pin the result; rerun the production audit and focused/full gates; fail if high/critical findings appear, if the exact path changes without review, or if either package enters runtime source.
- 20/20 reconciliation: 20 findings reviewed; six material security-boundary outcomes completed; shortfall 14 carried forward without padding.

---

## MOBILE-160 — rendered SnipeCard query settlement

- Base: `55326ce`; result: containing commit.
- Changed files/behavior: `SnipeCard.test.tsx` awaits visible success settlement in both initial-query cases and disappearance of Retry after recovered refetch. Product code is unchanged.
- Acceptance: focused CI 3/3; TypeScript; zero-warning focused ESLint; primary full CI Jest 81/403 with no `act` warning. Immutable QA expects 81/401 after excluding two concurrent TokenRow tests.
- NEXT_QA_ACTION: pin the result, run focused then full `--ci --runInBand`, scan stdout/stderr for `act`/overlapping-act warnings, and close MOBILE-QA-013 only when the immutable 81/401 run is warning-free.
- 20/20 reconciliation: 20 findings reviewed; three material rendered-settlement outcomes completed; shortfall 17 carried forward without padding.

---

## MOBILE-159 — SDK 57 patch compatibility

- Base: `c6ea00c`; result: containing commit.
- Changed files/behavior: `package.json` and `package-lock.json` align Expo `~57.0.16`, Constants `~57.0.14`, Dev Client `~57.0.15`, and Router `~57.0.16`. No product/API/transaction behavior changed.
- Acceptance: `diagnostics:expo` PASS; TypeScript; zero-warning source ESLint; primary full Jest 81/403; public config PASS; Android export PASS (1 Hermes bundle / 46 assets). Immutable QA expects 81/401 excluding two concurrent TokenRow tests.
- Known evidence: Noble warning remains under MOBILE-QA-004; stale pre-upgrade Metro cache fell back to a successful full crawl; npm reported 11 moderate audit findings and no automatic/force remediation was run.
- NEXT_QA_ACTION: pin the result; independently run local diagnostics, immutable 81/401 tests, public config, and Android/iOS/web exports. Open exact security findings as stable IDs before any audit remediation. Continue device-owned MOBILE-QA-002 separately.
- 20/20 reconciliation: 20 findings reviewed; four material compatibility outcomes completed; shortfall 16 carried forward without padding.

---

## MOBILE-158 — repository-local Expo diagnostics

- Base: `95541dd`; result: containing commit.
- Changed files/behavior: `package.json` adds `diagnostics:expo = expo install --check`; `package-scripts.test.ts` requires the declared local Expo executable and forbids implicit global/npx resolution.
- Acceptance: command-contract Jest 6/6; TypeScript; zero-warning focused ESLint; primary full Jest 81/403. Immutable QA expects 81/401 after excluding the concurrent two TokenRow tests.
- Current diagnostic result: expected FAIL with Expo `57.0.15→~57.0.16`, Constants `57.0.13→~57.0.14`, Dev Client `57.0.14→~57.0.15`, Router `57.0.15→~57.0.16`.
- NEXT_QA_ACTION: pin the result, verify the local command and exact fail-closed list, then keep release NO-GO until a separate dependency update makes it pass. This provides a local diagnostic substitute but does not claim full Expo Doctor coverage.
- 20/20 reconciliation: 20 findings reviewed; two material diagnostic outcomes completed; shortfall 18 carried forward without padding.

---

## MOBILE-157 — Noble fallback compatibility guard

- Base: `8d8971d`; result: containing commit.
- Changed files/behavior: `src/__tests__/noble-bundle-compatibility.test.ts` formalizes the bounded `MOBILE-QA-004` disposition. It pins nested Curves 1.9.7 / Hashes 1.8.0, records `./crypto` versus `./crypto.js`, requires CommonJS+ESM fallback files, and rejects silent root overrides. Product/runtime code is unchanged.
- Acceptance: focused 5/5; TypeScript; zero-warning focused ESLint; primary full Jest 81/402. Immutable QA expects 81/400 because the concurrent TokenRow slice remains excluded.
- NEXT_QA_ACTION: pin the result commit; run focused/full tests and all three exports. Mark `MOBILE-QA-004` conditionally accepted only if bundles complete with the known warning and all five guards pass.
- 20/20 reconciliation: 20 findings reviewed; five material compatibility outcomes completed; shortfall 15 carried forward without padding.

---

## MOBILE-156 — warning-free SnipeCard settlement

- Base: `a0ae4da`; result: containing commit.
- Changed files/behavior: `src/__tests__/SnipeCard.test.tsx` waits for the initial `fetchTokenDetail` query in the research/removal and threshold cases before test teardown. Product code is unchanged.
- Acceptance: focused SnipeCard 3/3; TypeScript; zero-warning focused ESLint; primary-worktree full Jest 80/397 with no React `act` console warning. The separate dirty TokenRow slice accounts for two tests, so immutable QA expects 80/395.
- NEXT_QA_ACTION: pin the result commit, run focused SnipeCard and full Jest from a clean checkout, require no `act`/overlapping-act warning, and report 80/395. Continue `MOBILE-QA-002`, `004`, and `008` independently.
- 20/20 reconciliation: 20 findings reviewed; two material asynchronous-settlement outcomes completed; shortfall 18 carried forward without padding.

---

## MOBILE-155 — immutable test-count evidence correction

- Base: `0b0c12b`; result: containing commit.
- Evidence correction: immutable MOBILE-154-F1 contains 80 suites / 395 tests. The primary dirty worktree's 397 count includes two tests from the separate uncommitted TokenRow/logo slice and is not attributable to MOBILE-154.
- Verification: QA independently passed the clean pinned 80/395 suite; `git show e0a74cf:src/__tests__/TokenRow.test.tsx` has eight tests while the concurrent worktree file has ten.
- NEXT_QA_ACTION: close `MOBILE-QA-009` after confirming the corrected immutable count; continue device-owned `MOBILE-QA-002` and dependency-owned `MOBILE-QA-004`.
- 20/20 reconciliation: 20 findings reviewed; one material release-evidence correction completed; shortfall 19 is carried forward without padding.

---

## MOBILE-154-F1 — complete semantic ordering follow-up

- Base: `7080d95`; result: containing commit.
- Changed behavior/files: the four remaining Monitor/CopyTrade reset-before-mutate assertions use narrowly scoped whitespace-tolerant regex ordering. Product behavior is unchanged and mutual-exclusion requirements remain enforced.
- Acceptance: focused accessibility Jest 68/68; TypeScript; zero-warning focused ESLint; immutable full Jest 80 suites / 395 tests.
- NEXT_QA_ACTION: pin the result commit and rerun `primary-a11y.test.ts` plus full Jest from a clean checkout; close `MOBILE-QA-007` only if both gates pass. Continue `MOBILE-QA-002` separately.
- 20/20 reconciliation: 20 findings reviewed; four independently testable assertion outcomes completed; shortfall 16 remains device/runtime evidence, upstream dependency warning, physical-device scenarios, WEB-QC fixtures, and concurrent Whales/logo acceptance.

---

## MOBILE-154 — semantic accessibility release gate

- Base: `ff9ac32`; result: containing commit.
- Changed behavior/files: `src/__tests__/primary-a11y.test.ts` now validates Monitor and CopyTrade sanitizer calls with whitespace-tolerant semantic patterns instead of exact indentation. Product code is unchanged.
- Acceptance: focused accessibility Jest 68/68; TypeScript; zero-warning focused ESLint; immutable full Jest 80 suites / 395 tests.
- Security/accessibility: both surfaces must still route mutation errors through `publicErrorMessage`; raw provider and adapter messages remain forbidden.
- NEXT_QA_ACTION: pin the result commit, rerun the focused and full suites, then continue `MOBILE-QA-002` immutable Android marker evidence. `MOBILE-QA-004` remains an isolated dependency lane.
- 20/20 reconciliation: 20 findings reviewed; 2 material release-gate outcomes completed; shortfall 18. Carry forward runtime-marker/device evidence, upstream dependency warning, physical-device scenarios, WEB-QC fixtures, and concurrent Whales/logo acceptance.

---

## MOBILE-153 — immutable runtime provenance

- Base: `f73c3a0`; result: containing commit.
- Behavior/files: `npm run dev:verified` resolves Git HEAD, rejects tracked dirty state, starts Expo with a child-only `MOBILE_BUILD_COMMIT`; `app.config.js` embeds nullable public provenance; `app/_layout.tsx` emits a bounded development mount marker. Ordinary sessions identify as `unverified`.
- Acceptance/evidence: focused Jest 7/7; Expo config returned the supplied fixture hash; dirty-worktree launcher exited 1 before Metro; TypeScript and warning-free lint passed.
- Privacy/security: public commit only; no endpoint, environment dump, credential, wallet, provider diagnostic, signing, submission, or transaction information.
- NEXT_QA_ACTION: from a clean immutable result commit, run `npm run dev:verified -- --localhost --port 8092`, launch API 37, and require `[MOBILE_BUILD] commit=<exact HEAD>` before certifying Whales/routing/quote evidence.
- 20/20 reconciliation: 20 findings reviewed; 7 material outcomes completed; shortfall 13. Carry forward physical accessibility/quote scenarios, WEB-QC fixtures, upstream Metro warning ownership, and concurrent Whales/logo acceptance.

---

## MOBILE-152 — Android emulator backend routing

- Base: `d9d5622`; result: containing commit.
- Behavior/files: `src/api/client.ts` selects `10.0.2.2:3000` only for unconfigured Android development; `src/__tests__/client.test.ts` verifies Android and non-Android defaults. Explicit environment configuration and production HTTPS policy are unchanged.
- Acceptance/evidence: focused client Jest 35/35; TypeScript; warning-free focused ESLint; host `/api/trending` HTTP 200; emulator host ping; API 37 cold launch; React Native mount; Whales accessibility hierarchy; no configuration/connection error and no fatal/ANR/unresolved-module log.
- Security: no production mock data, secret, credential, WEB write, signing, submission, or transaction capability.
- NEXT_QA_ACTION: pin the result commit; verify explicit configured-origin precedence, Android no-config host routing, non-Android loopback, and production HTTP rejection. Recheck Whales with the host backend running.
- 20/20 reconciliation: 20 findings reviewed; six material platform/runtime outcomes completed; shortfall 14. Carry forward physical TalkBack/large text/quote checks, WEB-QC-gated fixtures, upstream Metro warning ownership, and the overlapping concurrent Whales/logo slice.

---

## MOBILE-151 — Android development startup safety

- Base: `3f3825d`; result: containing follow-up regression commit.
- Behavior: Android debug builds no longer synchronously enable shake-to-open sensing during React Host startup. Keyboard and ADB developer controls remain enabled. Release behavior and transaction controls are unchanged.
- Files: `plugins/withAndroidDevMenuSafety.js`, `src/__tests__/android-dev-menu-safety.test.ts`, and MOBILE evidence documents.
- Acceptance/evidence: focused Jest 6/6; TypeScript; warning-free focused ESLint; Expo prebuild; JDK 17 x86_64 assembly; ADB install; cold launch `TotalTime: 2413`; React Native `main` mount; rendered Whales accessibility hierarchy; no ANR/fatal/unresolved-module log.
- Known risks: the local backend endpoint is not configured, so the rendered recovery surface is expected. Physical-device TalkBack and quote-flow interaction remain QA-owned.
- NEXT_QA_ACTION: pin the result commit, rerun the plugin tests, regenerate Android once, and verify cold/warm startup plus keyboard/ADB developer-menu access.
- 20/20 reconciliation: 20 findings reconciled; 6 outcomes completed; shortfall 14. Carry-forward `MOBILE-151-07` through `MOBILE-151-20` requires physical-device ownership, WEB-QC approval, or the active concurrent Whales/token-logo slice. No padding or WEB edits were used.

---

- Story: `MOBILE-150` — quote expiry TOCTOU and readiness atomicity
- Base: `715d10f`
- Result: containing commit; QA must pin immutable `HEAD`
- Scope: MOBILE only. WEB remained read-only. Concurrent Whale/token-logo work and MOBILE→WEB drafts were preserved and excluded.

## Acceptance and outcomes (22/20)

1. Exact 15,000 ms quote age remains valid.
2. Age 15,001 ms is expired.
3. Future clock skew does not create negative/inferred age.
4. Initial render clock uses real current time.
5. Preparation mutation rechecks expiry at invocation.
6. Confirmation mutation rechecks expiry at invocation.
7. Expired confirmation is native-disabled.
8. Expired confirmation is visually disabled.
9. Expired confirmation is announced disabled.
10–18. Buy, sell, amount, two unit controls, and four slippage controls freeze during readiness refresh.
19. Quote retrieval/refresh is blocked during readiness refresh.
20. Preparation is blocked during readiness refresh.
21. Confirmation is blocked during readiness refresh.
22. Readiness retry is blocked/busy while any other evidence-chain phase is pending.

Findings reconciled: 22. Outcomes completed: 22. Remaining to required 20: 0. Execution remains locked.

## Changed files

- `app/trade/[address].tsx`
- `src/lib/swap-readiness.ts`
- `src/__tests__/swap-readiness.test.ts`
- `src/__tests__/primary-a11y.test.ts`
- MOBILE checklist/worklog/final audit and this handoff

## Verification

- TypeScript, source ESLint, focused swap/readiness/accessibility tests, full Jest, Expo public config, staged diff check.

## NEXT_QA_ACTION

- Pin the containing commit and independently verify all 22 outcomes, especially expiry during preparation/confirmation and readiness retry overlap.
- `MOBILE-QA-002`: repeat on responsive Android with TalkBack and enlarged text.
- `MOBILE-QA-003`: clean immutable full-suite certification still awaits isolation/commit of concurrent whale/logo work.

---

## MOBILE runtime evidence — 2026-08-28T05:21:40.455Z

- Scope: canonical MOBILE root verified; base/result `7f8b6c460dfbe5817ab81cef59f2baf6e9b245c4`; clean worktree before evidence collection. WEB remained read-only.
- BA/PO reconciliation: 20 current findings reviewed. No dependency-ready product-code blocker remains. Nineteen physical-device, controlled network/provider, lifecycle/performance, or upstream Noble findings remain externally owned; `MOBILE-DEV-EMFILE-528` remains the host/runtime blocker.
- Completed outcome: current immutable source/toolchain health independently reconfirmed. TypeScript PASS; full source ESLint PASS; Doctor 21/21 PASS; full Jest PASS (88 suites/476 tests); public Expo config PASS; Expo dependency compatibility PASS.
- Runtime evidence carried from the immediately preceding exact-HEAD attempt: `/whales` returned HTTP 200, while `/discover` and `/auth` returned HTTP 500 with Metro `EMFILE` opening the user temp `metro-cache`. The owned Metro process was stopped cleanly. No MOBILE source change is justified by this host-level failure.
- Exact shortfall: 19 to the 20-outcome target; no padding. ADB is unavailable in this shell, so no Android/device result is inferred.
- Changed files: MOBILE evidence documents only. No environment file, credential, cache, generated output, provider data, wallet action, signing, submission, trade, or WEB mutation.
- NEXT_QA_ACTION: after host file-handle remediation, start this exact commit on a free port and validate Discover, Whales, Auth/Privy, all tabs/filters/actions, EN/VI, loading/empty/offline/retry/partial recovery, then physical accessibility/layout/performance.
- NEXT_WEB_ACTION: none; current failure occurs inside Metro before page delivery and does not request an API/schema change.

## 2026-08-28 — MOBILE static-export recovery

- Scope: MOBILE only. Trigger base `4199333`; result baseline included concurrent `8c0096b`. WEB was not edited.
- BA/PO findings: 20 current items reconciled. Selected/completed: `MOBILE-DEV-533`, `MOBILE-AUTH-534`, `MOBILE-WEB-535`. Exact shortfall: 17 (`MOBILE-QA-269..280`, `MOBILE-QA-283..287`) with physical-device/controlled-fixture/upstream owners.
- Behavior: the exact static export is route-correct on loopback; malformed Privy App IDs fail closed before SDK mount; Whales/chart responsiveness no longer changes the server/first-client dimension snapshot.
- Browser evidence: exact export at port 8097 rendered Whales, Discover, Trenches, More, and Auth. Whales controls and Retry operated; Discover navigation rendered; Auth showed the setup-required alert instead of a blank screen.
- Validation: focused 86/86 PASS; full Jest 89 suites / 479 tests PASS; TypeScript PASS; ESLint PASS; export-server 2/2 PASS; Expo compatibility PASS; Doctor 21/21 PASS; web export PASS with 26 routes. Upstream Noble/multiformats fallback warnings remain non-fatal and guarded.
- Risks: no authorized live Privy login was attempted; no transaction/signing/trading capability was enabled; device and controlled-provider acceptance evidence remains outstanding.
- NEXT_QA_ACTION: independently traverse the exact export, then run the 17 physical-device and controlled-fixture conditions.
- NEXT_WEB_ACTION: none; current contracts are sufficient.
