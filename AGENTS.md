# Terminal DEX App agent boundary

- This repository is the Expo/mobile client named **Terminal DEX App**.
- Canonical workspace: `C:\Tuan\devApps\teminal-dex-app` (the directory spelling is intentional).
- Before writing, verify both the current directory and Git top-level resolve to that exact workspace.
- Never write to `C:\Tuan\devApps\TERMINAL_DEX_Intelligent`; consume its APIs and handoffs as read-only external contracts.
- Put backend requests in structured MOBILE-to-WEB handoffs rather than changing WEB code.
- Preserve unrelated and concurrent changes. Stage only files owned by the current MOBILE slice.
- Never add production mock market data, secrets, environment files, databases, logs, caches, or generated build output.
- Keep transaction signing, submission, trading, and CopyTrade activation disabled unless an explicitly approved end-to-end safety contract is implemented and verified.
- Scheduled writers must use only the MOBILE repository writer lock and release it after committing or aborting.
