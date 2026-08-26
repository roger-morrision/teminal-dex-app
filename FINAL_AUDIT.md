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
| Tests and build regression              | Verified                                     | TypeScript, warning-free source-owned ESLint, 76 Jest suites / 356 tests, and fresh 25-route web/Android/iOS exports pass through Slice 141. Expo-generated router declarations are excluded from lint while remaining included in TypeScript. The Android debug assemble/install/runtime check also passes. The Expo Doctor 21/21 result from Slice 60 remains the latest Doctor evidence because its standalone executable is absent in this checkout. |

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
