# Terminal DEX Mobile Requirements Checklist

Status legend: `[x]` verified, `[ ]` incomplete, `[~]` intentionally visible but backend-connected behavior incomplete.

## Foundation and security

- [x] Expo 57 / React Native / Expo Router strict-TypeScript foundation.
- [x] Dark, dense, high-contrast visual system inspired by supplied references without protected branding or assets.
- [x] Public backend origin is environment-configured; secrets, native credentials, logs, build output, and local env files are ignored.
- [x] Real responses are runtime-validated; failures never silently become synthetic market data.
- [~] Android secure wallet connection uses official Mobile Wallet Adapter, encrypted authorization/session storage, backend ownership challenge, 24h expiry, cookie/cache revocation, and biometric re-authentication; native wallet support remains unavailable on iOS/web and requires a development build.
- [ ] Transaction quote/build/simulation/confirmation/submission flow with replay and double-submit protection.
- [~] Explicit app scheme/intent filter and development/preview/production EAS profiles are configured; URL payload allowlisting, certificate/network policy, telemetry redaction, and privacy controls remain incomplete.

## Approved mobile information architecture

- [x] Five-tab shell: Discover, Trenches, Monitor, Portfolio, More.
- [x] More catalog preserves AI, Track, CopyTrade, Top Traders, Smart Money, Wallet Tracker, Signals, Heatmap, Snipe List, Analytics, Multicharts, Feed Data, and Claim Monitor destinations.
- [x] Discover Trending/Gainers/Losers/Volume/New Pairs/Hot Searches/Surge/NextBC/Pump Live/Watchlist, timeframes, server search, refresh, filters, pagination, states, provenance, and token-detail handoff.
- [x] Non-secret watchlist and Discovery filter persistence with idempotent add/remove and explicit reset.
- [~] Token detail fetches normalized backend contracts for chart, holders, observed transactions, risk/security evidence, smart money, narrative, and pairs with truthful limitations; swap execution and deeper holder/transaction drilldowns remain incomplete.
- [ ] Trenches launch/migration columns and trade handoff.
- [ ] Monitor, Track, alerts, delivery evidence and diagnostics.
- [x] Portfolio and analytics use provider-backed holdings, explicit watch-only versus verified ownership, allocation/risk evidence, and truthful realized/unavailable PnL provenance.
- [ ] CopyTrade, rankings, config, review and execution truth.
- [ ] AI Intelligence and paper-trading/governance surfaces.
- [ ] Remaining More destinations and settings/accessibility/localization.

## Verification

- [x] Unit tests for response validation and financial formatting.
- [~] Component interaction coverage started for accessible token navigation/watchlist controls; complete screen-state coverage remains incomplete.
- [~] Android, iOS, and web production bundles pass; accessibility tests cover key controls, while device runtime, offline/recovery, performance, and full security regression remain incomplete.
- [ ] Final full requirement and regression audit.
