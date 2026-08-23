# Device Validation Matrix

Do not mark a row passed without a physical-device run. Attach only redacted evidence; never capture recovery phrases, private keys, authentication secrets, raw signed transactions, or session cookies.

## Build identity

| Field | Value |
| --- | --- |
| Commit | pending |
| EAS build ID | pending |
| App version | 0.1.0 |
| Backend origin/environment | pending |
| Tester/date/timezone | pending |

## Android wallet matrix

| Device / Android / wallet version | Connect | Challenge expiry | Cancel | Biometric failure | Account switch | Background/restore | Process death | Revoke | Offline interruption | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Required physical device | pending | pending | pending | pending | pending | pending | pending | pending | pending | BLOCKED |

## Accessibility and resilience

| Platform/device | Screen reader order/state | Maximum text size | Reduced motion | Keyboard/focus | Safe areas/overflow | Offline/reconnect | Cold start | Long-list/chart memory | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Android representative low/mid tier | pending | pending | pending | pending | pending | pending | pending | pending | BLOCKED |
| iOS representative supported device | pending | pending | pending | pending | pending | pending | pending | pending | BLOCKED |

## Evidence rules

- Record observed behavior, expected behavior, timestamp, route/control, and reproduction steps.
- Link every failure to a defect and automated regression test where code-owned.
- A bundle/export or simulator result cannot close a physical screen-reader, biometric, wallet, background, connectivity, thermal, or memory requirement.
- Any unexpected signing or submission prompt is a critical failure: disconnect, preserve redacted evidence, and engage the execution kill boundary.
