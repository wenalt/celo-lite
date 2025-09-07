'use client'
import { useEffect, useMemo, useState } from "react";
import { SelfQRcodeWrapper, SelfAppBuilder } from "@selfxyz/qrcode";
import { getUniversalLink } from "@selfxyz/core";
import { ZeroAddress } from "ethers";

export default function SelfVerificationDialog({
  open, onClose, userAddress,
}) {
  const [selfApp, setSelfApp] = useState(null);
  const [deeplink, setDeeplink] = useState("");
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState(null);

  const uid = useMemo(
    () => (userAddress ?? ZeroAddress),
    [userAddress]
  );

  useEffect(() => {
    if (!open) return;

    (async () => {
      try {
        setErr(null);
        setReady(false);

        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const endpoint = `${origin}/api/self/verify`;

        const app = new SelfAppBuilder({
          version: 2,
          appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || "Celo Lite",
          scope: process.env.NEXT_PUBLIC_SELF_SCOPE || "celo-lite",
          endpoint,
          userId: uid,
          endpointType: process.env.NEXT_PUBLIC_SELF_USE_MOCK === "true" ? "staging_https" : "prod_https",
          userIdType: "hex",
          userDefinedData: "prosperity-passport",
          disclosures: {
            minimumAge: 18, // DOIT matcher le backend
            nationality: true,
            gender: true,
          },
        }).build();

        const link = getUniversalLink(app);
        setSelfApp(app);
        setDeeplink(link);
        setReady(true);
      } catch (e) {
        console.error(e);
        setErr(e?.message || "Failed to initialize Self");
      }
    })();
  }, [open, uid]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 grid place-items-center p-4 z-50">
      <div className="bg-neutral-900 rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-2">Self.xyz Verification</h2>
        <p className="text-sm opacity-80 mb-4">
          Scanne le QR avec Self (desktop) ou ouvre l’app (mobile).
        </p>

        {/* état/debug minimal */}
        <p className="text-xs opacity-60 mb-2">
          Status: {ready ? "Ready" : "Not ready"}{err ? ` — ${err}` : ""}
        </p>

        {selfApp ? (
          <div className="space-y-3">
            {/* QR pour desktop (md et +) */}
            <div className="hidden md:block">
              <SelfQRcodeWrapper
                selfApp={selfApp}
                onSuccess={() => {
                  onClose(); // TODO: re-fetch ton score ici si besoin
                }}
                onError={() => console.error("Self verification failed")}
              />
            </div>

            {/* Deeplink pour mobile (toujours visible) */}
            <button
              className="w-full rounded-xl py-2 bg-white/10 disabled:opacity-60"
              onClick={() => {
                if (!deeplink) return;
                // Préfère location.href pour éviter les bloqueurs de popup (iOS/Safari)
                window.location.href = deeplink;
              }}
              disabled={!deeplink}
            >
              Ouvrir l’app Self
            </button>

            {/* Lien fallback affiché sous le bouton (utile si navigateur bloque) */}
            {deeplink ? (
              <p className="text-xs break-all opacity-70">
                <a href={deeplink}>Si rien ne se passe, appuie ici</a>
              </p>
            ) : null}
          </div>
        ) : (
          <div>Chargement…</div>
        )}

        <div className="mt-4 text-right">
          <button className="text-sm opacity-80" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}
