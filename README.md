# Terminal DEX Mobile

Expo/React Native client for the Terminal DEX backend.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Set `EXPO_PUBLIC_API_URL` to the HTTPS origin of the Terminal DEX backend (Android emulator development may use `http://10.0.2.2:3000`).
3. Run `npm install` and `npm start`.

Only public, non-secret configuration may use the `EXPO_PUBLIC_` prefix. Wallet keys, API secrets, and signing material must never be stored in this repository or bundled into the app.
