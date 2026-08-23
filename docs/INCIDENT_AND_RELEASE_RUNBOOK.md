# Incident and Release Runbook

## Release gate

1. Require a clean commit and record its hash.
2. Run TypeScript, ESLint, Jest, Expo Doctor, and fresh web/Android/iOS exports.
3. Confirm `mobileExecutionPolicy.executionEnabled` is `false` unless a separately reviewed release intentionally changes the authority model.
4. Inspect the final bundle/config for secrets, non-HTTPS production origins, unexpected permissions, and forbidden execution routes.
5. Verify data-source degradation, offline, empty, error, stale, and reconnect states.
6. Attach device evidence when the release changes wallet, accessibility, navigation, storage, networking, or performance-sensitive code.
7. Promote through internal and canary channels; record owner, start time, rollback threshold, and monitoring links.

## Data/provider incident

- Fail closed: label evidence stale/unavailable and suppress any derived execution authority.
- Identify affected provider, channel, consumer, last successful observation, dropped/ignored counts, and cooldown/rate-limit state.
- Do not invent replacement data or silently enable mocks.
- Recover with bounded retries/failover, verify provenance and freshness, then reconcile gaps before declaring healthy.

## Wallet/session incident

- Disable owner-only mutations and clear cached authorization/session evidence.
- Revoke server cookie/session where available; never log wallet credentials, challenges, signatures, or transaction bytes.
- Require a new ownership challenge and biometric re-authentication before restoring private evidence.

## Transaction incident

- Keep or engage the kill switch; stop new intent creation and submission.
- Preserve immutable hashes, status transitions, provider responses, timestamps, and redacted diagnostics.
- Reconcile by signature and intent ID; never automatically replay an ambiguous mutation.
- Escalate expiry, duplicate, partial submission, confirmation, finality, or reorg anomalies to the named incident owner.
- Resume only after root-cause evidence, regression coverage, reconciliation, and explicit authorization.

## Rollback

- Roll back application code/config to the last verified artifact without deleting audit evidence.
- Revoke or rotate affected credentials through the owning secret manager.
- Confirm schema compatibility, cached-client behavior, provider health, and read-only recovery before reopening mutations.
