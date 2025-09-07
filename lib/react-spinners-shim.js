// lib/react-spinners-shim.js
// Minimal no-op components to satisfy named imports from @selfxyz/qrcode.
// We don't need actual spinners; this avoids CJS/ESM interop issues.

import React from "react";

export function BounceLoader() { return null; }
export function ClipLoader()   { return null; }
export function PulseLoader()  { return null; }
export function ScaleLoader()  { return null; }

// keep a default for safety
const defaultExport = { BounceLoader, ClipLoader, PulseLoader, ScaleLoader };
export default defaultExport;
