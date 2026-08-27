# MOBILE DEV → QA handoff

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
