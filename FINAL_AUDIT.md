# Terminal DEX Mobile Final Audit

Audit date: 2026-08-24

Audit maintained through: MOBILE-146

Backend authority: `C:\Tuan\devApps\TERMINAL_DEX_Intelligent` (source of truth; isolated Slice 43–49 contracts added with explicit write approval)

## Outcome

The implemented Expo application passes the automated regression gate and covers the approved mobile information architecture with real, runtime-validated backend evidence. No mock production market data, mobile-held backend secrets, transaction execution, or hidden activation path was found.

Completion is intentionally not claimed for requirements that need an absent backend safety/provider contract or physical-device evidence. Those boundaries remain visible in the product and in the blocker matrix below.

## Evidence matrix

| Area                                    | Status                                       | Evidence                                                                                                                                                                                                                                                                                                                                 |
| --------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Foundation, routing, visual system      | Verified                                     | Expo Router whale-first five-tab shell and all approved auxiliary destinations; 25 static routes including the hidden Monitor workflow; professional navy-based dark UI with restrained semantic mint/violet/cyan accents, rounded active navigation and simplified evidence panels, without Moby branding or protected assets.                                                                                                                                                                         |
| Whale-first objective                   | Implemented; runtime evidence prerequisites  | Mobile validates named identity only from current eligible-token holdings worth at least $10,000, keeps trade size separate, and presents held-token artwork on the left, relationship/action evidence centrally, and traded-token artwork on the right. The backend emits validated held-token artwork with holding evidence; unsafe or missing artwork falls back by exact mint. Missing allowlist configuration is explicitly distinguished from a quiet qualified feed without disclosing configured mints. |
| Backend contracts and data truthfulness | Verified                                     | Central HTTPS-origin client with development-only loopback recovery and production fail-closed HTTPS enforcement, exact Solana identity checks, Zod response contracts, explicit degraded/unavailable/provenance states, no synthetic production fallback, and an opt-in mobile Trending projection that retains rendered evidence without transferring desktop-only diagnostics. |
| Discovery, Whales, Trenches, Portfolio  | Verified                                     | Real discovery/search/filter flows with bounded four-page history, unique row identities, fail-closed cursor continuity, contract-aware continuation (numeric Trending offsets, opaque New Pairs cursors, and no continuation for cursorless special modes), capability-aware timeframe/filter visibility with no inert controls during special modes or server search, retained-row recovery with explicit failed-cursor retry, and guarded busy-safe recovery; provider-backed bounded whale/smart-money events with transparent net-flow aggregation, evidence boundaries, exact-token handoff, accessible busy-safe retry recovery, mode-aware polling/refresh/header controls, and no empty-address navigation when wallet rankings contain no qualified rows; durable bounded watchlist snapshots/window with row provenance, freshness, owner alert/delivery state, and explicit save failure; launch lanes with bounded filters, guarded provider recovery and quote handoff; provider-backed holdings with guarded analytics recovery and watch-only/ownership/PnL boundaries. |
| Token intelligence                      | Verified through confirmed intent            | Real detail, OHLCV, holders, clusters, transactions, behavior heuristics, provider-derived early buyers, current and historical security evidence, smart money, narrative, and pairs, with accessible busy-safe panel/header/inline recovery and no inert action. Quote review adds guarded token-identity and execution-blocking provider-readiness recovery, then supports owner-bound unsigned build, inspection, resolved-account quote verification, Helius simulation, and replay-safe explicit intent confirmation; signing/submission remains locked. |
| Monitor and alerts                      | Verified                                     | Indexed signature activity, owner rules, delivery ledger, and evaluation history have query-specific accessible busy-safe recovery with no inert retry action; provider-backed table with persistent windows/filters/presets/two-level sort/density, cursor paging and exact-address cross-page deduplication before filtering/sorting, horizontal mobile overflow, provenance/freshness, and explicit Monitoring-only status; owner rule CRUD, explicit 50-row/4-page threshold-evaluation history with unique ordered rows and fail-closed paired-cursor continuity, and delivery evidence kept as distinct evidence classes; bounded current Track window, immutable cursor-paginated retained feed history, and lazily loaded bounded X/Telegram trends have busy-safe feed/social/history/delivery recovery and no external actions. |
| CopyTrade                               | Verified supported config; execution blocked | Rankings; verified-owner preview-first durable sizing/cap/TP-SL/quote/market/timing configuration; validated and persisted priority-fee/Anti-MEV/holder/trailing/two-level-ladder controls; paused lifecycle, readiness, positions, and audit, with busy-safe health/ranking/strategy/position/execution recovery. Execution enforcement and activation/signing/submission remain absent. |
| AI and auxiliary intelligence           | Verified                                     | Advisory-only AI with busy-safe advisory/paper/history/governance recovery, public simulation performance/research plus operational, mutation, lease, and cycle-fencing health, execution-disabled governance, owner-scoped durable GMGN provider discovery history with exact Solana mint/provenance/freshness/quality/confidence verification, bounded four-page Signals history with unique descending rows and fail-closed cursor continuity, accessible busy-safe Signals/Heatmap/Claims/Smart Money/wallet-holdings/partial-PnL/Snipe-candidate/Multicharts-chart recovery, wallet tracker, Snipe List, Multicharts, analytics, and GET-only feed operations with query-specific busy-safe market/inventory/channel/diagnostic recovery evidence and refresh deltas. |
| Localization, privacy, accessibility    | Automated verification passed                | Typed English/Vietnamese copy, reduced motion, telemetry default-off, privacy reset, roles/labels/busy/error/empty/retry semantics, centralized public-error sanitization, wallet-adapter boundary redaction, private provider/audit failures, and a static all-route control/error-privacy audit.                                                                                                                                                                  |
| Network and platform hardening          | Automated verification passed                | React Query online/offline policy, bounded retry behavior, ATS/cleartext/backup configuration, deep-link allowlisting, redaction, native-safe wallet-signature encoding, Expo Doctor, and web/Android/iOS exports. Slice 93 rebuilt and installed the development client on the API 37 emulator, repaired its required splash dependency, and verified Whales/Discover rendering, tab navigation, truthful backend-offline recovery, and clean fatal-error log inspection. |
| Tests and build regression              | Verified                                     | TypeScript, warning-free source-owned ESLint, 76 Jest suites / 356 tests, and fresh 25-route web/Android/iOS exports pass through Slice 141. Expo-generated router declarations are excluded from lint while remaining included in TypeScript. The Android debug assemble/install/runtime check also passes. MOBILE-162 restores an exact repository-local Expo Doctor lane and passes all 21 checks. |

## Remaining blockers

| Requirement                                      | Blocking evidence                                                                                                                                                                                                                             | Required closure evidence                                                                                                                                                                                                          |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Native wallet availability and device validation | Mobile Wallet Adapter is Android-only and requires a development build; iOS/web cannot supply that native contract.                                                                                                                           | Android development-build tests with a supported wallet, including challenge expiry, biometric re-authentication, revocation, cancellation, and background/restore behavior.                                                       |
| Swap signing and managed submission              | Owner-bound build/inspection with exact message hash, resolved-account mint/amount/slippage verification, bounded configured-Helius simulation evidence, replay-safe explicit intent confirmation, and a backend Ed25519 verification primitive now exist. The legacy raw broadcast action returns 410. Execution remains false; no wallet signature, broadcast, intent consumption, or managed submission contract is exposed to mobile. | Separately approved end-to-end execution design plus adversarial device/backend integration evidence for signature scope, blockhash/expiry handling, pre-broadcast revalidation, one-time intent consumption, managed submission, replay rejection, finality, failure recovery, and kill switch. |
| CopyTrade activation and execution               | Readiness remains environment/provider/signature gated and depends on the same incomplete transaction authority boundary.                                                                                                                     | Full transaction safety gate, explicit verified-owner activation contract, kill switch, idempotency/replay guarantees, and device confirmation tests.                                                                              |
| Ownership-based whale runtime evidence            | The contract and qualification logic are implemented, but an empty eligible-token allowlist or missing holder/price snapshots intentionally produces no named whale rows.                                                                     | Configure `IN_APP_WHALE_ELIGIBLE_TOKEN_MINTS` with reviewed Solana mints and maintain fresh indexed holder plus market-price evidence; validate representative named rows against provider data.                                      |
| Physical-device accessibility and resilience     | Automated semantics and simulated connectivity pass, but no physical-device session was available in this environment.                                                                                                                        | TalkBack and VoiceOver traversal, large dynamic type, reduced motion, offline/reconnect, background/restore, and representative low/mid-tier performance evidence.                                                                 |

## Regression conclusion

No in-scope automated regression was found. Generated export directories were removed after validation. The known upstream Noble hashes Metro subpath fallback warning remains non-fatal and does not prevent any platform export.

## Slice 70 nine-phase enhancement review

| Phase | Review outcome and ranked next enhancement |
| --- | --- |
| 1. Data/backend | Current validated bounded whale feed is usable; durable token-specific history pagination and whale-alert mutation/evaluation/delivery require new authoritative backend contracts. |
| 2. IA/navigation | Whale-first shell and exact token/wallet drill-down are complete; selected Whale Watch view and non-secret controls now persist with privacy-reset support. |
| 3. Primary flows | Whales gained bounded market pulse; Discover, Trenches and Portfolio already join exact-mint evidence without inference. |
| 4. Detail flows | Token whale chronology and selected wallet dossier are complete; authoritative longer-history chronology remains backend-blocked. |
| 5. Reference usability | Dense pulse/flow hierarchy is adapted without copied branding, assets, identities, proprietary copy, rewards, or predictive claims. |
| 6. Recovery states | Live/historical, missing amount, empty, filtered-empty, error, retry and offline boundaries exist; pagination awaits a cursor contract. |
| 7. Quality/security | Typed localization, bounded schemas, privacy reset, scalable Whale Watch text, narrow-width recovery, and automated accessibility gates pass; physical large-text/screen-reader evidence remains. |
| 8. Platforms | Web/Android/iOS export baseline and Android emulator deployment exist; physical Android/iOS development-build certification remains external. |
| 9. Tests/release | Deterministic pulse coverage is added; the current run must pass TypeScript, lint, full Jest and Android export before commit. |
## Discover compact-row evidence audit — 2026-08-25

- Verified: token artwork remains primary, with exact-mint identity fallback when provider symbol/name is blank.
- Verified: holder evidence rejects null, invalid, stale, and explicitly unsafe values; lower-bound values are visibly qualified.
- Verified: zero/`new` placeholder ages are not presented as authoritative age evidence.
- Verified: row-two percentage follows the selected 1h/6h/24h window; unavailable selected-window evidence remains unavailable.
- Verified on Android API 37: compact rows remain readable without overlap at 1080×2400, retain ten visible market records, and expose token identity/logo semantics through the accessibility tree.
- Externally blocked: authoritative token symbol/name, holder count, and creation time remain absent from some current backend mobile-projection records.

## Slice 143 fresh nine-phase enhancement review

| Phase | Current evidence and next enhancement |
| --- | --- |
| 1. Data/backend | Fail-closed token/whale evidence is implemented. Provider identity/holder/age enrichment plus durable whale history and alerts remain authoritative-contract blockers. |
| 2. IA/navigation | Whale-first navigation and exact-identity handoffs are implemented; no dependency-ready navigation defect was found. |
| 3. Primary flows | Whales, Discover, Trenches, Portfolio, Monitor and More have real API, recovery and paging foundations; physical interaction certification remains external. |
| 4. Detail flows | Token, wallet, chart, transaction, holder, security, narrative, alert and quote-detail evidence is implemented through confirmed intent; execution remains deliberately locked. |
| 5. Reference usability | Transaction-first compact hierarchy remains adapted without protected Moby branding, assets, identities or copy. |
| 6. Resilience | Loading, empty, stale, offline, retry and partial-page recovery are implemented; missing upstream evidence remains visibly unavailable. |
| 7. Quality/security | Automated accessibility, localization, privacy and error-redaction gates pass; physical screen-reader and large-text certification remains external. |
| 8. Platforms | Android emulator and three-platform export evidence exist; physical Android/iOS wallet and resilience evidence remains external. |
| 9. Tests/release | Implemented this run: `lint` now invokes the declared local ESLint 9 executable directly over source roots, eliminating Expo CLI/global `npx` dependency from the release gate. Next: command-level package-script resolution regression. |

## Slice 144 release-command evidence

- Verified that every quality script begins with its declared local tool executable: TypeScript for typecheck, ESLint for lint, and Jest for test/CI.
- The regression rejects an `npx` first command and locks lint to the source-owned `app` and `src` roots.
- Cross-team handoff status: the expected backend `docs/automation-handoffs/mobile-latest.md` artifact was absent, so no unverified backend change was consumed.

## MOBILE-145 WEB contract acceptance

- The WEB indexer-health handoff is now represented by a strict MOBILE schema and GET-only client reader.
- Healthy evidence requires HTTP/upstream status consistency; unavailable evidence has explicit bounded reasons; every accepted shape requires `automationSafe: false`.
- This evidence remains observational and cannot enable signing, submission, CopyTrade activation, or any transaction path.

## MOBILE-146 Feed Data health presentation

- Feed Data now consumes the strict indexer-health contract only while its tab is active, participates in refresh/loading, and retains independent busy-safe recovery.
- Healthy, degraded, unconfigured, unavailable, and invalid-contract evidence have distinct localized public presentation. Missing tip, freshness, lag, source, commitment, or quality evidence remains unavailable rather than zero.
- The card has summary semantics, bounded quality rows, English/Vietnamese copy, and an explicit observational-only boundary. It exposes no control that can enable automation, signing, submission, or trading.
- 20/20 contract: 20 distinct acceptance gaps closed in this slice; device runtime certification remains externally blocked and is not counted as complete.

## MOBILE-147 private mutation recovery

- Monitor alert activation/pause and deletion plus CopyTrade pause and deletion now use the bounded public-error classifier; backend origins, provider diagnostics, and exception messages are never rendered verbatim.
- Sibling operations are mutually excluded, stale sibling failures are cleared before a new action, and every affected press target exposes matching disabled/busy semantics. CopyTrade cannot open a destructive confirmation while another strategy mutation is pending.
- Source-level regression coverage locks all 20 independently testable privacy, recovery, concurrency, and accessibility outcomes. Physical Android interaction certification remains externally blocked.

## MOBILE-148 atomic creation forms

- Alert and paused-strategy creation now freeze every control capable of changing the reviewed payload while submission is pending. This prevents a request/visible-review race and duplicate or contradictory user interaction.
- Text inputs use native `editable=false`; radios, checkboxes, choices, and the strategy close action use native disabled state; all expose matching accessibility state.
- Thirty-six distinct controls are covered across the two forms. Repository-local agent guidance now fixes the MOBILE/WEB boundary and selective-staging rules; Android runtime certification remains external.

## MOBILE-149 quote evidence-chain atomicity

- Quote retrieval, verified preparation, and explicit confirmation now share one busy boundary. Nine quote-defining controls cannot change during any phase, and quote/prepare/confirm actions cannot overlap.
- Native disabled/editable state, visual treatment, and assistive disabled/busy semantics agree, preventing the reviewed payload from diverging from the evidence being prepared or confirmed.
- Thirty-three phase/control boundaries are source-verified. Execution remains deliberately locked and physical Android certification remains external.

## MOBILE-150 quote expiry TOCTOU closure

- Exact quote TTL is now checked in both asynchronous mutation functions, not only during render. A quote expiring during network work cannot proceed to preparation or explicit confirmation.
- Confirmation exposes matching native, visual, and assistive disabled state after expiry. Readiness refresh joins the atomic lock so evidence cannot change underneath the quote chain.
- Twenty-two distinct boundaries are verified by pure TTL and source-level safety tests. Execution remains locked; Android runtime certification remains external.

## MOBILE-151 Android startup evidence

- Verified generated native configuration disables only debug shake sensing and survives repeated prebuild transformation.
- Verified API 37 development APK build/install, 2.4-second cold startup, React Native `main` mount, live process/focused activity, and rendered Whales accessibility hierarchy without ANR, fatal exception, or unresolved module.
- Physical-device TalkBack, quote-flow interaction, and production release certification remain separate QA evidence; no transaction authority changed.

## MOBILE-152 Android local-backend routing

- Android development fallback now uses `10.0.2.2:3000`, while non-Android development retains `127.0.0.1:3000`; explicit configuration and HTTPS production policy are unchanged.
- API 37 runtime evidence confirms Whales renders without backend configuration/connection errors against the reachable host service. No mock data, credential, WEB mutation, signing, or transaction authority was introduced.

## MOBILE-153 immutable device evidence

- Verified development startup is fail-closed on tracked dirty state and embeds exact Git HEAD into Expo config before Metro starts.
- App mount emits only the public commit hash or `unverified`; no secrets, endpoints, wallet identity, or transaction evidence is included. QA can now correlate Android logs with an immutable MOBILE commit.

## MOBILE-154 semantic accessibility gate

- Monitor and CopyTrade privacy assertions no longer depend on source indentation while continuing to require centralized mutation-error sanitization.
- Focused accessibility verification passes 68 checks and the immutable committed regression gate passes 80 suites / 395 tests. The two additional primary-worktree tests belong to the separate uncommitted TokenRow slice. Runtime marker and physical-device certification remain separate blockers.
- QA follow-up now verifies reset-before-mutate ordering for Monitor toggle/remove and CopyTrade pause/remove without source-indentation coupling.

## MOBILE-156 asynchronous test settlement

- SnipeCard research/removal and visual-threshold tests wait for initial token evidence to settle before teardown. Focused and full primary-worktree regressions pass without React `act` warnings.
- No production component, API contract, transaction control, or WEB behavior changed. Immutable QA must continue excluding the concurrent TokenRow/logo slice.

## MOBILE-157 Noble/Metro compatibility disposition

- The existing non-fatal `./crypto.js` strict-exports fallback is conditionally accepted only for the audited nested Noble 1.9.7/1.8.0 pair while both installed fallback files exist and Android/iOS/web bundles complete.
- Five automated guards force explicit review on version drift, missing fallback files, changed export behavior, or a root cryptography override. The warning remains visible; no unsafe resolver bypass was added.

## MOBILE-158 local Expo diagnostic lane

- `diagnostics:expo` resolves through the repository-declared Expo executable and never uses implicit global or `npx` tooling. Its command contract is tested.
- The current diagnostic correctly exits nonzero for four SDK patch mismatches. This is actionable readiness evidence, not a release pass; upgrades require an isolated dependency install and full platform revalidation.

## MOBILE-159 SDK 57 patch alignment

- Expo 57.0.16, Constants 57.0.14, Dev Client 57.0.15, and Router 57.0.16 now satisfy the repository-local compatibility diagnostic.
- Static checks, full regressions, public configuration, and Android Hermes export pass. The Noble fallback remains conditionally accepted; exact-device evidence and the reported dependency audit findings remain release follow-ups.

## MOBILE-160 rendered query settlement

- All three SnipeCard query paths await observable rendered settlement rather than request counts: initial research/removal, threshold editing, and failed-query recovery.
- Focused and full CI regressions pass without the prior order-dependent React `act` warning. Product behavior, API contracts, and execution controls are unchanged.

## MOBILE-161 dependency-audit runtime boundary

- Production lockfile audit reports 11 moderate findings and no high/critical findings. The concrete advisory is `uuid` 7.0.3 (`GHSA-w5hq-g745-h8pq`) behind `xcode` 3.0.1 and Expo configuration tooling.
- Six automated checks prevent those packages becoming direct or runtime dependencies and make version/path drift visible. The upstream advisory remains open; automatic/forced remediation and npm's incompatible Expo downgrade were not applied.

## MOBILE-162 repository-local Expo Doctor

- Exact local `expo-doctor` 1.20.3 is invoked through a tested package command with no global or `npx` dependency. The current project passes 21/21 checks.
- Dynamic Expo configuration now consumes Expo's supplied static config before adding bounded build provenance, resolving the Doctor finding without duplicating or discarding platform configuration.
## MOBILE-163 filter integrity and assistive-control semantics

- **Implemented and verified:** 20 current findings (`MOBILE-A11Y-201..218`, `MOBILE-DATA-205..208`, `MOBILE-DATA-219..220`) were reconciled and closed across Discover, Monitor, and Trenches without touching concurrent Whales/TokenRow work.
- **Data correctness:** Discovery thresholds now retain one decimal separator, at most two fractional digits, and at most twelve whole digits. Trenches keeps the same numeric boundary and caps bonding-progress filters at 100. Native length bounds agree with state bounds.
- **Accessibility/recovery:** mode tabs, period/window/preset/direction/DEX groups, multi-sort checkboxes, density switch, filter expansion, reset naming, and pagination disabled/busy state expose their real behavior.
- **Verification:** TypeScript PASS; focused ESLint PASS; focused Jest PASS (3 suites, 12 tests); full Jest PASS (82 suites, 411 tests). Manual API 37 evidence from the preceding install run remains valid for the pre-commit runtime; immutable-commit QA recheck is assigned below.
- **Security:** no API, wallet, signing, submission, trading, credential, environment, or WEB behavior changed. Production mock data remains absent.
- **Partially verified / external:** physical-device screen-reader traversal and an immutable-commit Android reinstall remain QA device tasks. Native Gradle rebuild remains externally blocked by the host loopback IOException; existing compatible APK + current Metro bundle rendered without fatal/module-resolution errors. This restricted shell ran 17/21 Doctor checks (child `npm` unavailable) and Expo compatibility was blocked from the external user cache by `EPERM`; MOBILE-162 retains normal-environment 21/21 evidence.
- **NEXT_QA_ACTION:** verify all 20 stable IDs on the committed checkout, including TalkBack group traversal, malformed filter entry, pagination retry state, and Discover/Monitor/Trenches navigation on API 37.
- **NEXT_WEB_ACTION:** none.
## MOBILE-164 input integrity and async-control safety

- **Implemented:** 20/20 current stable findings (`MOBILE-DATA-221..240`) across Portfolio, Wallet Intelligence, Research Workspace, Whales, Monitor alerts, and CopyTrade.
- **Verified:** TypeScript PASS; focused and full source ESLint PASS; focused Jest PASS (5 suites/24 tests); full Jest PASS (82 suites/414 tests); public Expo config PASS for Android/iOS/web.
- **Security/privacy:** native/state input bounds reduce oversized/malformed local and API-bound values; wallet disconnect/revoke/watch and tracked-wallet persistence now fail closed while busy. Transaction signing/submission and CopyTrade activation remain disabled.
- **Partially verified:** restricted-shell Doctor passes 17/21 and cannot run four dependency-tree checks because child `npm` is unavailable; MOBILE-162 retains normal-environment 21/21 evidence. Physical-device keyboard/paste behavior and screen-reader radio traversal require QA device confirmation. No WEB change is required.
- **NEXT_QA_ACTION:** pin the result commit and independently test every stable ID, including long paste, malformed decimals, double taps, wallet-busy boundaries, TalkBack group navigation, and persistence failure recovery.
- **NEXT_WEB_ACTION:** none.
## MOBILE-165 touch-target and motor-accessibility pass

- **Implemented:** 20/20 measured undersized control families (`MOBILE-TOUCH-241..260`) across Discover, Monitor, and Trenches now meet a 44px logical target floor.
- **Verified:** TypeScript and full source ESLint PASS; focused accessibility/interaction Jest PASS (5 suites/81 tests); full Jest PASS (83 suites/417 tests); public Expo config PASS.
- **Safety:** visual/touch geometry only; no API, data, wallet, transaction, storage, credential, or WEB behavior changed.
- **Partially verified:** restricted-shell Doctor is 17/21 because child `npm` is unavailable; MOBILE-162 retains normal-environment 21/21 evidence. Physical-device Switch Access/TalkBack reachability and small-screen visual review remain QA device tasks.
- **NEXT_QA_ACTION:** validate all 20 target families on the immutable result at 1.0× and 1.3× font scale, including edge taps, horizontal rails, screen-reader focus, and small-screen wrapping.
- **NEXT_WEB_ACTION:** none.
## MOBILE-166 Trenches provider DEX normalization

- **Implemented:** 8 dependency-ready material outcomes (`MOBILE-DATA-261..268`) close `MOBILE-QA-021` at the provider-data boundary.
- **Verified:** TypeScript/full ESLint PASS; focused Jest 3 suites/9 tests PASS; full Jest 83 suites/419 tests PASS; public Expo configuration PASS.
- **Shortfall:** 12 to 20. `MOBILE-QA-269..280` are explicitly blocked by physical Android/iOS/accessibility/performance devices, unavailable child npm, upstream Noble ownership, or controllable provider cursor/data fixtures. No safe ready item remains in this reconciled queue.
- **Partially verified:** restricted-shell Doctor 17/21; immutable API 37 rerun of the corrected filter panel is assigned to QA.
- **NEXT_QA_ACTION:** pin the result; open Trenches filters with undefined, blank, duplicate-case, and `All` DEX provider rows; verify no warning/undefined option, one stable option per DEX, touch targets retained, and stale selection recovers.
- **NEXT_WEB_ACTION:** none; MOBILE treats absent optional DEX evidence as unavailable without manufacturing it.

## MOBILE-167 Monitor provider DEX normalization

- **Implemented:** 8 dependency-ready material outcomes (`MOBILE-DATA-281..288`) harden the Monitor table against malformed optional DEX evidence.
- **Verified:** TypeScript/full ESLint PASS; focused Jest 1 suite/6 tests PASS; full Jest 83 suites/421 tests PASS; public Expo configuration PASS.
- **Shortfall:** 12 to 20. Existing `MOBILE-QA-269..280` remain blocked by physical devices, unavailable child npm, upstream Noble ownership, or controllable provider fixtures; they were not relabeled or padded.
- **Partially verified:** restricted-shell Doctor cannot spawn child `node` (`ENOENT`); immutable API 37 runtime confirmation is assigned to QA.
- **NEXT_QA_ACTION:** pin the result; inject undefined, blank, reserved, and duplicate-case Monitor DEX values; verify the filter, stale-selection recovery, provenance fallback, and row navigation.
- **NEXT_WEB_ACTION:** none; MOBILE treats absent optional DEX evidence as unavailable.

## MOBILE-168 cross-surface provenance normalization

- **Implemented:** 8 material outcomes (`MOBILE-DATA-301..308`) prevent whitespace-only provider DEX/source values from rendering as valid evidence across eight user surfaces.
- **Verified:** TypeScript/full ESLint PASS; focused Jest 4 suites/9 tests PASS; full Jest 83 suites/422 tests PASS; public Expo configuration PASS.
- **Shortfall:** 12 to 20. Existing `MOBILE-QA-269..280` retain their physical-device, toolchain, upstream, and provider-fixture blockers without relabeling or padding.
- **Safety:** display normalization only; no WEB/API/provider mutation, wallet action, signing, submission, or trading behavior changed.
- **NEXT_QA_ACTION:** pin the result and inject whitespace-only DEX/source evidence into all eight named surfaces, verifying localized fallback text and unchanged navigation.
- **NEXT_WEB_ACTION:** none.

## MOBILE-169 20/20 evidence-label integrity

- **Implemented:** 20/20 material outcomes (`MOBILE-DATA-321..325`, `MOBILE-A11Y-326`, `MOBILE-DATA-327..340`) across eight product areas; remaining to 20: 0.
- **Verified:** TypeScript/full ESLint PASS; focused Jest 7 suites/15 tests PASS; full Jest 83 suites/422 tests PASS; public Expo configuration PASS.
- **Truthfulness/accessibility:** valid provider labels are trimmed; blank or missing quality, source, provider, method, DEX, and token labels use localized truthful fallbacks, including Whale screen-reader relationship copy.
- **Safety:** no WEB/API/provider mutation, wallet action, signing, submission, or trading behavior changed.
- **NEXT_QA_ACTION:** pin the result; inject whitespace-only values for all 20 stable IDs, verify localized fallbacks and unchanged navigation, then run exact API 37 and release gates.
- **NEXT_WEB_ACTION:** none.

## MOBILE-170 20/20 live-feed evidence integrity

- **Implemented:** 20/20 material outcomes (`MOBILE-DATA-341..360`); exact shortfall 0 across CopyTrade, Market Intelligence, Monitor, Trenches, Whales, and Track.
- **Verified:** TypeScript/full ESLint PASS; focused Jest 7 suites/24 tests PASS; full Jest 83 suites/423 tests PASS; public Expo configuration PASS.
- **Truthfulness:** blank quality/source/provider/RPC/channel/status labels no longer render as present evidence; provider arrays remove blanks and duplicates before display.
- **Safety:** display normalization only; no WEB/API/provider mutation, wallet action, signing, submission, or trading behavior changed.
- **NEXT_QA_ACTION:** pin the result, inject whitespace and duplicate provider labels for all 20 IDs, then verify visual/accessibility output and exact API 37 navigation.
- **NEXT_WEB_ACTION:** none.

## MOBILE-171 20/20 auxiliary motor-accessibility and regression stability

- **Implemented:** 20/20 outcomes (`MOBILE-QA-281`, `MOBILE-TOUCH-361..379`); exact shortfall 0.
- **Behavior:** ten auxiliary routes now provide 44px minimum back, period, mode, toggle, pause, remove, numeric-input, filter, and retry targets; Monitor regression teardown is deterministic across grouped focused runs.
- **Verified:** TypeScript/full source ESLint PASS; focused Jest PASS (2 suites/16 tests); full Jest PASS (83 suites/433 tests); public Expo config PASS.
- **Safety:** UI geometry and test lifecycle only; no API, provider, wallet, transaction, credential, or WEB behavior changed.
- **NEXT_QA_ACTION:** pin the result and edge-tap all 19 families at 1.0×/1.3× font scale, then repeat the grouped Monitor regression and standard release gates.
- **NEXT_WEB_ACTION:** none.

## MOBILE-172 20/20 secondary controls and loaded regression stability

- **Implemented:** 20/20 (`MOBILE-QA-281`, `MOBILE-TOUCH-380..398`); exact shortfall 0.
- **Behavior:** the loaded grouped regression receives a 15s case budget while preserving act-safe cleanup; 19 tab, period, chip, timeframe, alert-management, trade-side, and slippage families expose a 44px target or equivalent compact-switch hit slop.
- **Verified:** TypeScript/full source ESLint PASS; exact grouped regression PASS three consecutive times; full Jest PASS (83 suites/442 tests); public Expo config PASS.
- **Safety:** UI geometry and test scheduling only; APIs, providers, wallets, transactions, credentials, and WEB remain unchanged.
- **NEXT_QA_ACTION:** pin the result, rerun the exact grouped command under archive load, then edge-tap all 19 families at normal/enlarged text.
- **NEXT_WEB_ACTION:** none.

## MOBILE-173 compact-control completion and quote-input boundary

- **Implemented:** 15 safe outcomes (`MOBILE-TOUCH-401..414`, `MOBILE-DATA-415`); exact shortfall 5 (`MOBILE-QA-269..273`) after exhausting this measured ready queue.
- **Behavior:** remaining named compact controls use 44px-equivalent geometry/hit slop; quote input is bounded to normalized 12+6 digit decimal form before request state.
- **Verified:** TypeScript/full source ESLint PASS; focused Jest PASS (2 suites/35 tests); full Jest PASS (83 suites/450 tests); public Expo config PASS.
- **Blocked:** physical TalkBack, VoiceOver, Switch Access, 320dp/enlarged-text, and controlled offline/reconnect evidence; owner QA/device/network provider.
- **Safety:** read-only quote input and UI geometry only; no signing, submission, trading, API/provider, credential, or WEB mutation.
- **NEXT_QA_ACTION:** pin the result, verify the 15 outcomes, then execute `MOBILE-QA-269..273` when device/network fixtures are available.
- **NEXT_WEB_ACTION:** none.

## MOBILE-174 deterministic recovery and strict whale threshold

- **Implemented:** `MOBILE-QA-282` and `MOBILE-DATA-416`; exact shortfall 18 because the remaining reconciled findings require physical devices, controlled network/storage/lifecycle conditions, provider fixtures, restricted toolchain ownership, or an upstream package fix.
- **Behavior:** the loaded AsyncSurface recovery regression performs deterministic discovery and cleanup; whale identity excludes holdings equal to $10,000 and qualifies only eligible famous-token holdings above $10,000.
- **Verified:** exact grouped regression PASS three consecutive times; whale focused suite PASS; TypeScript/full source ESLint PASS; full Jest PASS (83 suites/450 tests); web production export PASS (25 routes).
- **Safety:** read-only classification and test lifecycle only; no WEB/API/provider mutation, wallet action, signing, submission, or trade behavior changed.
- **NEXT_QA_ACTION:** independently classify both outcomes and run the blocked physical-device/network scenarios when available.
- **NEXT_WEB_ACTION:** no schema change; provide controlled fixtures for Monitor and missing whale-holding evidence scenarios.

## MOBILE-175 Discover token-row localization integrity

- **Implemented:** all eight safe outcomes (`MOBILE-I18N-417..424`); exact shortfall 12 (`MOBILE-QA-269..280`) with unchanged external owners.
- **Behavior:** Discover token-row actions, holder/age truthfulness, volume shorthand, and social accessibility evidence now follow the persistent EN/VI language selection.
- **Verified:** TypeScript/full source ESLint PASS; TokenRow focused PASS (1 suite/11 tests); full Jest PASS (83 suites/451 tests); public Expo configuration PASS.
- **Safety:** presentation/localization only; API/provider evidence, wallet state, signing, submission, and WEB remain unchanged.
- **NEXT_QA_ACTION:** independently verify all eight strings in both languages visually and with assistive technology.
- **NEXT_WEB_ACTION:** none.

## MOBILE-176 localized token and DEX artwork semantics

- **Implemented:** all five safe outcomes (`MOBILE-I18N-425..429`); exact shortfall 15 with device/network/toolchain/upstream/provider owners.
- **Behavior:** token artwork success/fallback and known/unknown DEX badge labels are localized on Discover; Token Detail also localizes its token artwork semantics.
- **Verified:** TypeScript/full source ESLint PASS; focused Jest PASS (2 suites/19 tests); full Jest PASS (83 suites/451 tests); public Expo config PASS.
- **Safety:** accessibility presentation only; provider URLs, images, API data, navigation, wallets, and transactions are unchanged.
- **NEXT_QA_ACTION:** exercise image load/error and known/unknown DEX states in EN/VI across both surfaces.
- **NEXT_WEB_ACTION:** none.

## MOBILE-177 localized Discover market metrics

- **Implemented:** all four safe outcomes (`MOBILE-I18N-430`, `MOBILE-A11Y-431..433`); exact shortfall 16 with external owners.
- **Behavior:** visible market-cap shorthand follows EN/VI; the metric group announces price, market cap, selected change period, and unavailable change without inventing data.
- **Verified:** TypeScript/full source ESLint PASS; TokenRow focused PASS (1 suite/12 tests); full Jest PASS (83 suites/452 tests); public Expo config PASS.
- **Safety:** display/accessibility only; provider values, calculations, APIs, wallets, navigation, and transactions are unchanged.
- **NEXT_QA_ACTION:** verify all three periods and positive/negative/missing values visually and with assistive technology in EN/VI.
- **NEXT_WEB_ACTION:** none.

## MOBILE-178 truthful localized Whale chronology

- **Implemented:** all five safe outcomes (`MOBILE-I18N-434`, `MOBILE-DATA-435..438`); exact shortfall 15 with external owners.
- **Behavior:** Whale flow observations format seconds/milliseconds with EN/VI locale and invalid-time fallback; market chips localize market cap and partial unavailable values.
- **Verified:** TypeScript/full source ESLint PASS; focused Jest PASS (3 suites/17 tests); full Jest PASS (83 suites/453 tests); public Expo config PASS.
- **Safety:** formatting/presentation only; event ordering, provider values, aggregation, APIs, wallets, and transactions are unchanged.
- **NEXT_QA_ACTION:** verify localized chronology and partial/full/unavailable market evidence using controlled fixtures.
- **NEXT_WEB_ACTION:** none.

## MOBILE-179 localized live-Whale relative age

- **Implemented:** all six safe outcomes (`MOBILE-I18N-439..442`, `MOBILE-DATA-443..444`); exact shortfall 14 with external owners.
- **Behavior:** live Whale age supports provider seconds/milliseconds, localized seconds/minutes/hours/days, and fail-closed malformed/future evidence.
- **Verified:** TypeScript/full source ESLint PASS; focused Jest PASS (2 suites/17 tests); full Jest PASS (83 suites/454 tests); public Expo config PASS.
- **Safety:** presentation only; event ordering, polling, provider records, APIs, wallets, and transactions are unchanged.
- **NEXT_QA_ACTION:** traverse all age boundaries and malformed/future cases in EN/VI.
- **NEXT_WEB_ACTION:** none.

## MOBILE-180 shared defensive relative ages

- **Implemented:** all 15 safe outcomes (`MOBILE-DATA-445..459`); exact shortfall 5 (`MOBILE-QA-269..273`) with physical-device/network-fixture owners.
- **Behavior:** Discover, Trenches, Operations, and Monitor normalize provider seconds/milliseconds, reject malformed/future timestamps, localize relative units, and expose day rollover where the catalog supports it.
- **Verified:** TypeScript/full source ESLint PASS; focused Jest PASS (4 suites/32 tests); full Jest PASS (83 suites/455 tests); public Expo config PASS via the bundled Node runtime.
- **Safety:** presentation/data-validation only; provider records, sorting, APIs, wallets, and transactions are unchanged.
- **NEXT_QA_ACTION:** independently traverse the timestamp matrix on all four surfaces in EN/VI, then execute the five blocked device/network cases.
- **NEXT_WEB_ACTION:** none.

## MOBILE-181 localized AI and Track chronology

- **Implemented:** all seven safe outcomes (`MOBILE-I18N-460..464`, `MOBILE-DATA-465..466`); exact shortfall 13 with device/network/toolchain/upstream owners.
- **Behavior:** AI discovery history, delivery evidence, social trends, durable history, and Track events use EN/VI locale; the shared parser safely accepts numeric seconds/milliseconds and ISO strings and rejects malformed strings.
- **Verified:** TypeScript/full source ESLint PASS; focused Jest PASS (2 suites/9 tests); full Jest PASS (83 suites/455 tests).
- **Safety:** presentation/parser only; provider events, ordering, APIs, wallets, and transactions are unchanged.
- **NEXT_QA_ACTION:** independently exercise the complete timestamp matrix on AI and Track in EN/VI.
- **NEXT_WEB_ACTION:** none.

## MOBILE-182 localized Token Detail chronology

- **Implemented:** all three safe outcomes (`MOBILE-I18N-467..469`); exact shortfall 17 with device/provider/network/toolchain owners.
- **Behavior:** early-buyer, security-history, and token-Whale timestamps use EN/VI locale and fail closed through the shared provider-time formatter.
- **Verified:** TypeScript/full source ESLint PASS; focused Jest PASS (3 suites/17 tests); full Jest PASS (83 suites/455 tests).
- **Safety:** presentation only; provider records, ordering, APIs, wallets, and transactions are unchanged.
- **NEXT_QA_ACTION:** independently traverse the three evidence sections using numeric, ISO, and malformed provider time in EN/VI.
- **NEXT_WEB_ACTION:** none.

## MOBILE-183 localized cross-surface quantities

- **Implemented:** all 13 safe outcomes (`MOBILE-I18N-470..482`); exact shortfall 7 with device/network/WEB-operations owners.
- **Behavior:** Portfolio, Wallet Intelligence, Market Intelligence, Token Detail, and Operations quantities follow EN/VI separators and fail closed for non-finite values.
- **Verified:** TypeScript/full source ESLint PASS; focused Jest PASS (4 suites/16 tests); full Jest PASS (83 suites/456 tests).
- **Safety:** formatting only; provider values, APIs, ordering, wallets, and transactions are unchanged.
- **NEXT_QA_ACTION:** verify migrated quantities in both languages and malformed fallback.
- **NEXT_WEB_ACTION:** rebuild/restart port 3000 from WEB `acf2907` after the authorized operator supplies the existing Compose secret.

## MOBILE-184 localized Token and Wallet percentages

- **Implemented:** all 16 safe outcomes (`MOBILE-I18N-483..498`); exact shortfall 4 with physical-device/WEB-operations owners.
- **Behavior:** Token Detail and Wallet Intelligence percentages and bounded decimals follow EN/VI and fail closed for non-finite values.
- **Verified:** TypeScript/full source ESLint PASS; focused available Jest PASS (3 suites/19 tests); full Jest PASS (83 suites/457 tests); absent requested wallet suite names were not counted.
- **Safety:** formatting only; calculations, provider values, APIs, wallets, and transactions are unchanged.
- **NEXT_QA_ACTION:** verify migrated values visually and with assistive technology in both languages.
- **NEXT_WEB_ACTION:** rebuild/restart stale port 3000 from WEB `acf2907` using the existing authorized Compose secret.
