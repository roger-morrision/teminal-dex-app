# Terminal DEX Mobile Requirements Checklist

Status legend: `[x]` verified, `[ ]` incomplete, `[~]` intentionally visible but backend-connected behavior incomplete.

## Foundation and security

- [x] Expo 57 / React Native / Expo Router strict-TypeScript foundation.
- [x] Dark, dense, high-contrast visual system inspired by supplied references without protected branding or assets.
- [x] Public backend origin is environment-configured; secrets, native credentials, logs, build output, and local env files are ignored.
- [x] Real responses are runtime-validated; failures never silently become synthetic market data.
- [~] Android secure wallet connection uses official Mobile Wallet Adapter, encrypted authorization/session storage, backend ownership challenge, 24h expiry, cookie/cache revocation, and biometric re-authentication; native wallet support remains unavailable on iOS/web and requires a development build.
- [~] Real Jupiter ExactIn quote review validates exact amounts, route, mint identities, impact, slippage, context slot, and 15-second expiry; build/simulation/decoded confirmation/submission/replay protection remain deliberately locked.
- [~] Explicit app scheme/intent filter and development/preview/production EAS profiles are configured; URL payload allowlisting, certificate/network policy, telemetry redaction, and privacy controls remain incomplete.

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
- [ ] AI Intelligence and paper-trading/governance surfaces.
- [ ] Remaining More destinations and settings/accessibility/localization.

## Verification

- [x] Unit tests for response validation and financial formatting.
- [~] Component interaction coverage includes accessible token navigation/watchlist controls, Trenches quote handoff, and alert financial-input gating; complete screen-state coverage remains incomplete.
- [~] Android, iOS, and web production bundles pass; accessibility tests cover key controls, while device runtime, offline/recovery, performance, and full security regression remain incomplete.
- [ ] Final full requirement and regression audit.
