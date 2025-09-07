'use client'
import { useEffect, useMemo, useState } from "react";
import { SelfQRcodeWrapper, SelfAppBuilder } from "@selfxyz/qrcode"; // ⬅ import nommé
import { getUniversalLink } from "@selfxyz/core";
import { ZeroAddress } from "ethers";

export default function SelfVerificationDialog({ open, onClose, userAddress }) {
  const [selfApp, setSelfApp] = useState(null);
  const [deeplink, setDeeplink] = useState("");
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState(null);

  const uid = useMemo(() => (userAddress ?? ZeroAddress), [userAddress]);

  useEffect(() => {
    if (!open) return;

    (async () => {
      try {
        setErr(null);
        setReady(false);

        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const endpoint = `${origin}/api/self/verify`;

        const app = new SelfAppBuilder({
          version: 2, // ⬅ important
          appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || "Celo Lite",
          scope: process.env.NEXT_PUBLIC_SELF_SCOPE || "celo-lite",
          endpoint,
          userId: uid,
          endpointType: process.env.NEXT_PUBLIC_SELF_USE_MOCK === "true" ? "staging_https" : "prod_https", // ⬅ important
          userIdType: "hex",
          userDefinedData: "prosperity-passport",
          disclosures: {
            minimumAge: 18,   // doit matcher le backend
            nationality: true,
            gender: true,
          },
        }).build();

        const link = getUniversalLink(app);
        setSelfApp(app);
        setDeeplink(link || "");
        setReady(!!link);
      } catch (e) {
        console.error(e);
        setErr(e?.message || "Failed to initialize Self");
      }
    })();
  }, [open, uid]);

  function openSelfApp() {
    if (!deeplink) return;

    try {
      // 1) ancre invisible + click programmatique (le plus fiable)
      const a = document.createElement("a");
      a.href = deeplink;
      a.rel = "noopener";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      a.remove();

      // 2) fallback popup
      setTimeout(() => { try { window.open(deeplink, "_blank", "noopener"); } catch {} }, 120);

      // 3) dernier filet : navigation forcée
      setTimeout(() => { try { window.location.href = deeplink; } catch {} }, 260);
    } catch (e) {
      console.error("deeplink open error", e);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 grid place-items-center p-4 z-50">
      <div className="bg-neutral-900 rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-2">Self.xyz Verification</h2>
        <p className="text-sm opacity-80 mb-3">
          Scanne le QR sur desktop, ou ouvre l’app Self sur mobile.
        </p>

        {/* état/debug minimal */}
        <p className="text-xs opacity-60 mb-2">
          Status: {ready ? "Ready" : "Not ready"}{err ? ` — ${err}` : ""}
        </p>

        {selfApp ? (
          <div className="space-y-3">
            {/* QR (utile même sur mobile/tablette) */}
            <div className="grid place-items-center">
              <SelfQRcodeWrapper
                selfApp={selfApp}
                onSuccess={() => { onClose(); /* TODO: re-fetch état “Verified” */ }}
                onError={(e) => console.error("Self verification failed", e)}
                size={260}
              />
            </div>

            {/* Bouton deeplink (mobile-first) */}
            <button
              className="w-full rounded-xl py-2 bg-white/10 disabled:opacity-60"
              onClick={openSelfApp}
              disabled={!ready || !deeplink}
            >
              Ouvrir l’app Self
            </button>

            {/* Lien brut pour copier/coller si le navigateur bloque */}
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
