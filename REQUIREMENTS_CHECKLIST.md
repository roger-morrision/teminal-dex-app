# Terminal DEX Mobile Requirements Checklist

Status legend: `[x]` verified, `[ ]` incomplete, `[~]` intentionally visible but backend-connected behavior incomplete.

## Foundation and security

- [x] Expo 57 / React Native / Expo Router strict-TypeScript foundation.
- [x] Dark, dense, high-contrast visual system inspired by supplied references without protected branding or assets.
- [x] Public backend origin is environment-configured; secrets, native credentials, logs, build output, and local env files are ignored.
- [x] Real responses are runtime-validated; failures never silently become synthetic market data.
- [~] Android secure wallet connection uses official Mobile Wallet Adapter, encrypted authorization/session storage, backend ownership challenge, 24h expiry, cookie/cache revocation, and biometric re-authentication; native wallet support remains unavailable on iOS/web and requires a development build.
- [~] Real Jupiter ExactIn quote review validates exact amounts, route, mint identities, impact, slippage, context slot, and 15-second expiry; build/simulation/decoded confirmation/submission/replay protection remain deliberately locked.
- [x] Explicit app scheme/intent filter and development/preview/production EAS profiles; exact Solana deep-link allowlisting; bounded matching snapshots; HTTPS-only production origins; iOS ATS and Android cleartext/backup denial; diagnostic redaction; and device-local privacy reset are implemented and verified.
- [x] Expo Network drives React Query online state with explicit offline/cached-evidence and recovery disclosure; reads pause and refetch on reconnect, transient retries are bounded, 4xx/abort failures do not retry, and mutations neither retry nor queue for reconnection.
- [x] Untrusted API collections have explicit fail-closed page/render budgets; OHLCV accepts at most 1,000 validated candles and renders at most 240 shape-preserving points with truthful counts; dense token rows avoid unchanged rerenders.

## Approved mobile information architecture

- [x] Five-tab shell: Discover, Trenches, Monitor, Portfolio, More.
- [x] More catalog preserves AI, Track, CopyTrade, Top Traders, Smart Money, Wallet Tracker, Signals, Heatmap, Snipe List, Analytics, Multicharts, Feed Data, and Claim Monitor destinations.
- [x] Discover Trending/Gainers/Losers/Volume/New Pairs/Hot Searches/Surge/NextBC/Pump Live/Watchlist, timeframes, server search, refresh, filters, pagination, states, provenance, and token-detail handoff.
- [x] Non-secret watchlist and Discovery filter persistence with idempotent add/remove and explicit reset.
- [~] Token detail fetches normalized backend contracts for chart, holders, observed transactions, risk/security evidence, smart money, narrative, and pairs with truthful limitations; swap execution and deeper holder/transaction drilldowns remain incomplete.
- [x] Trenches uses real New/Almost Bonded/Migrated launch lanes with progress, market evidence, detail navigation, refresh, and non-executing quote-review handoff.
- [~] Monitor uses real indexed Solana observations; owner-scoped price/change/volume alert CRUD and durable delivery diagnostics are complete. Track remains unavailable because the backend exposes no connected live tracker provider.
- [x] Portfolio and analytics use provider-backed holdings, explicit watch-only versus verified ownership, allocation/risk evidence, and truthful realized/unavailable PnL provenance.
- [~] CopyTrade provides provenance-aware Top Traders rankings, verified-wallet durable strategy review/create, pause/delete, readiness, positions, and execution audit. Mobile always creates paused strategies and deliberately omits activation, confirmation, signing, closing, and submission pending the full transaction safety gate.
- [x] AI Intelligence provides fail-closed advisory recommendations, public read-only paper performance/positions/research, and verified-wallet 31-phase governance evidence with simulation-only, kill-switch, and execution-disabled contracts enforced at runtime.
- [x] Signals provides filterable 24h/7d signature-backed events with cursor pagination, ingestion/freshness evidence, exact-mint detail handoff, and no export or transaction authority; valid degraded backend evidence remains visible.
- [x] Heatmap provides trustworthy provider market rows ordered by volume, gain/loss intensity, liquidity, trust warnings, excluded-row counts, freshness, and exact-mint detail handoff.
- [x] Claim Monitor provides read-only Solana RPC health, confirmed/detected/unpaid claim evidence, first-observed status, signature provenance, and explicit no-claim/no-wallet-action boundaries.
- [x] Smart Money uses non-deprecated provider/indexed Top Traders evidence, filters only Smart Money/Whale classifications, presents historical PnL/win-rate/drawdown/reliability limitations, and joins public holdings plus indexed realized PnL without copy or follow actions.
- [x] Wallet Tracker persists at most 50 sanitized, deduplicated public addresses and labels on-device, validates exact Solana keys, shows real backend holdings/prices and indexed PnL limitations, and participates in privacy reset without implying ownership.
- [x] Snipe List persists at most 20 exact token mints, sanitized notes, and bounded visual price thresholds on-device; token identity/price refresh is backend-backed, while the UI explicitly denies background-alert and execution claims and directs durable rules to Monitor.
- [x] Multicharts persists up to four unique exact token mints and one shared timeframe, renders only real validated token/OHLCV responses with independent refresh/error/provenance states, and inserts no default or synthetic markets.
- [x] Analytics summarizes only exact-mint real market records across breadth, liquidity, volume, momentum, fresh pairs, and historical trader evidence, with explicit exclusions, provenance, staleness, missing-field, and non-predictive boundaries.
- [x] Feed Data observes validated provider inventory, delivery/persistence freshness, runtime quality, evidence availability, remediation guidance, and durable ingestion jobs through GET-only backend contracts; active probes, provider mutation, replay, credentials, and raw record inspection are absent.
- [~] Settings provides persistent interpolation-safe English/Vietnamese strings, translated primary tabs, token detail, quote review, CopyTrade, AI Intelligence, Market Intelligence, and full Settings safety copy, reduced-motion preference, telemetry consent default-off, and privacy reset. Remaining auxiliary tools and device screen-reader/dynamic-type verification remain incomplete.

## Verification

- [x] Unit tests for response validation and financial formatting.
- [~] Component interaction coverage includes accessible token navigation/watchlist controls, Trenches quote handoff, alert financial-input gating, localized CopyTrade eligibility and AI advisory qualification, hostile input/privacy boundaries, localized exact-mint Signal handoff, distinct tracked-wallet inspect/remove controls, distinct Snipe detail/remove/threshold controls, truthful configured/receiving/persistence Feed Data labels, localization persistence/interpolation/fallback, and a static primary-plus-token-detail/quote/CopyTrade/AI/Market-Intelligence Pressable/TextInput semantics gate; complete auxiliary screen-state coverage remains incomplete.
- [~] Android, iOS, and web production bundles pass; Expo native-config introspection proves ATS/cleartext/backup policy, automated accessibility tests cover every primary-tab/Settings Pressable and TextInput, simulated offline/reconnect/query-policy tests pass, and adversarial collection/render/security checks pass. Real-device screen-reader/dynamic-type/connectivity/performance verification remains incomplete.
- [ ] Final full requirement and regression audit.
