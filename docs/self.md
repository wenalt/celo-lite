# Self Protocol Integration (Celo Lite)

This module adds **Self.xyz** verification (ZK attestations) to Celo Lite with a desktop QR and a mobile deeplink, plus a backend endpoint to verify proofs.

---

## Overview

- **UI**: `SelfVerificationDialog` renders a QR code (desktop) and a universal link (mobile).
- **Backend**: `POST /api/self/verify` validates ZK proofs using `SelfBackendVerifier`.
- **Config**: via env vars (`NEXT_PUBLIC_SELF_*`, `SELF_USE_MOCK`).
- **Build compat**: shim for `react-spinners` to avoid CJS/ESM named-export errors in `@selfxyz/qrcode`.

---

## Files

- UI component: `components/self/SelfVerificationDialog.jsx`
- Page wiring (open/close modal): `pages/index.js`
- API route: `pages/api/self/verify.js`
- Spinners shim: `lib/react-spinners-shim.js`
- Next alias: `next.config.js`

---

## Environment variables

Add these in **`.env.local`** (dev) and in **Vercel → Project → Settings → Environment Variables** (Production & Preview):

```ini
# Self.xyz — UI
NEXT_PUBLIC_SELF_APP_NAME=Celo Lite
NEXT_PUBLIC_SELF_SCOPE=celo-lite
NEXT_PUBLIC_SELF_USE_MOCK=true     # dev only; set false in real prod

# (optional) Explicit endpoint; otherwise window.location.origin is used
# NEXT_PUBLIC_SELF_ENDPOINT=https://celo-lite.vercel.app/api/self/verify

# Self.xyz — backend
SELF_USE_MOCK=true                 # dev only; set false in real prod
In production, you can omit NEXT_PUBLIC_SELF_ENDPOINT and the UI will build it from window.location.origin.
The API also reconstructs its own endpoint from request headers.

Backend: /api/self/verify (POST only)

Method: POST (a GET will return 405 Method Not Allowed — expected)

Body:

{
  "attestationId": "...",
  "proof": { ... },
  "publicSignals": { ... },
  "userContextData": { ... }
}


Response (success):

{
  "ok": true,
  "credentialSubject": { /* disclosed attributes (e.g., nationality, gender) */ }
}


Handler lives in pages/api/self/verify.js and uses:

import { SelfBackendVerifier, AllIds, DefaultConfigStore } from "@selfxyz/core";


with a minimal verification config:

const verification_config = {
  excludedCountries: [],
  ofac: false,
  minimumAge: 18,
};

UI modal

Opened via the “Self.xyz Verification” button in pages/index.js (or by visiting /?self=1).

On open, the dialog builds a Self App via:

const app = new SelfAppBuilder({...}).build()
const link = getUniversalLink(app)


Desktop: shows <SelfQRcodeWrapper selfApp={app} /> for scanning.

Mobile: shows “Open Self app” (deeplink), with fallbacks (window.open, then navigation).

Close logic is handled via onSuccess + the dialog’s Fermer button.

react-spinners shim (build compatibility)

Some versions of @selfxyz/qrcode import named loaders from react-spinners (CommonJS). To avoid named-export errors in Next.js, we alias the package to a shim.

lib/react-spinners-shim.js

import pkg from 'react-spinners';

export const BounceLoader = pkg.BounceLoader;
export const ClipLoader   = pkg.ClipLoader;
export const PulseLoader  = pkg.PulseLoader;
export const ScaleLoader  = pkg.ScaleLoader;

export default pkg;


next.config.js

const path = require('path');

const nextConfig = {
  experimental: { urlImports: ['https://cdn.jsdelivr.net'] },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'react-spinners': path.resolve(__dirname, 'lib/react-spinners-shim.js'),
    };
    return config;
  },
};

module.exports = nextConfig;

Local dev quick test
npm run dev
# open http://localhost:3000
# click "Self.xyz Verification" OR visit http://localhost:3000/?self=1


Desktop: scan the QR with the Self extension/app.

Mobile: tap Ouvrir l’app Self (deeplink). On iOS, Safari generally handles app links best.

Production checklist

Set NEXT_PUBLIC_SELF_USE_MOCK=false and SELF_USE_MOCK=false for real verification.

Ensure NEXT_PUBLIC_SELF_SCOPE matches the scope configured with Self.

Ensure your Vercel domain is correct if you hardcode NEXT_PUBLIC_SELF_ENDPOINT.

Avoid logging proof contents in production.

Troubleshooting

GET /api/self/verify returns 405 → expected (only POST is allowed).

“BounceLoader is not exported from react-spinners” → verify shim & alias (see above).

Modal shows “Not ready” → check that env vars are present, and that SelfAppBuilder(...).build() runs without errors (browser console).

Mobile deeplink does nothing → confirm Self app is installed; try Safari on iOS; some browsers block app links or popups.
