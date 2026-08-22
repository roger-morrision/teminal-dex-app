# Terminal DEX Mobile Requirements Checklist

Status legend: `[x]` verified, `[ ]` incomplete, `[~]` intentionally visible but backend-connected behavior incomplete.

## Foundation and security

- [x] Expo 57 / React Native / Expo Router strict-TypeScript foundation.
- [x] Dark, dense, high-contrast visual system inspired by supplied references without protected branding or assets.
- [x] Public backend origin is environment-configured; secrets, native credentials, logs, build output, and local env files are ignored.
- [x] Real responses are runtime-validated; failures never silently become synthetic market data.
- [ ] Secure wallet connection, encrypted session storage, ownership challenge, expiry, revocation, and biometric re-authentication.
- [ ] Transaction quote/build/simulation/confirmation/submission flow with replay and double-submit protection.
- [ ] Deep-link allowlist, certificate/network policy, telemetry redaction, privacy controls, and production EAS configuration.

## Approved mobile information architecture

- [x] Five-tab shell: Discover, Trenches, Monitor, Portfolio, More.
- [x] More catalog preserves AI, Track, CopyTrade, Top Traders, Smart Money, Wallet Tracker, Signals, Heatmap, Snipe List, Analytics, Multicharts, Feed Data, and Claim Monitor destinations.
- [x] Discover Trending/Gainers/Losers/Volume/New Pairs/Hot Searches/Surge/NextBC/Pump Live/Watchlist, timeframes, server search, refresh, filters, pagination, states, provenance, and token-detail handoff.
- [x] Non-secret watchlist and Discovery filter persistence with idempotent add/remove and explicit reset.
- [~] Token detail fetches its live normalized backend contract and exposes market/security automation evidence; chart, swaps, holders, transactions, smart money, narrative, and pairs remain incomplete.
- [ ] Trenches launch/migration columns and trade handoff.
- [ ] Monitor, Track, alerts, delivery evidence and diagnostics.
- [ ] Portfolio and analytics with owner-scoped backend data.
- [ ] CopyTrade, rankings, config, review and execution truth.
- [ ] AI Intelligence and paper-trading/governance surfaces.
- [ ] Remaining More destinations and settings/accessibility/localization.

## Verification

- [x] Unit tests for response validation and financial formatting.
- [~] Component interaction coverage started for accessible token navigation/watchlist controls; complete screen-state coverage remains incomplete.
- [ ] Android/iOS/web smoke tests, accessibility audit, offline/recovery, performance and security regression suite.
- [ ] Final full requirement and regression audit.
