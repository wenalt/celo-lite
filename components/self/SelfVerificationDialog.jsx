'use client'
import { useEffect, useMemo, useState } from "react";
import { SelfQRcodeWrapper, SelfAppBuilder } from "@selfxyz/qrcode";
import { getUniversalLink } from "@selfxyz/core";
import { ZeroAddress } from "ethers";

function isMobileUA() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export default function SelfVerificationDialog({ open, onClose, userAddress }) {
  const [selfApp, setSelfApp] = useState(null);
  const [deeplink, setDeeplink] = useState("");
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState(null);

  const uid = useMemo(() => (userAddress ?? ZeroAddress), [userAddress]);

  useEffect(() => {
    if (!open) return;

    try {
      setErr(null);
      setReady(false);

      // 👉 Aligne-toi sur la doc: endpoint public depuis ENV si présent,
      // sinon fallback auto à l’URL du déploiement (Vercel).
      const origin =
        (typeof window !== "undefined" && window.location.origin) || "";
      const endpoint =
        process.env.NEXT_PUBLIC_SELF_ENDPOINT ||
        `${origin}/api/self/verify`;

      const app = new SelfAppBuilder({
        version: 2, // requis par la V2
        appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || "Celo Lite",
        scope: process.env.NEXT_PUBLIC_SELF_SCOPE || "celo-lite",
        endpoint, // offchain: endpoint HTTPS de ton API
        endpointType:
          process.env.NEXT_PUBLIC_SELF_USE_MOCK === "true"
            ? "staging_https"
            : "prod_https",
        userId: uid,
        userIdType: "hex",
        userDefinedData: "prosperity-passport",
        disclosures: {
          // ⚠ doivent matcher le backend
          minimumAge: 18,
          nationality: true,
          gender: true,
          // ofac / excludedCountries si tu en actives côté backend
        },
      }).build();

      const link = getUniversalLink(app); // lien universel (iOS/Android)
      setSelfApp(app);
      setDeeplink(link || "");
      setReady(!!link);
    } catch (e) {
      console.error(e);
      setErr(e?.message || "Failed to initialize Self");
    }
  }, [open, uid]);

  function openSelfApp() {
    if (!deeplink) return;
    // 1) clic programmatique sur <a> (fiable)
    const a = document.createElement("a");
    a.href = deeplink;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();

    // 2) fallback popup
    setTimeout(() => {
      try { window.open(deeplink, "_blank", "noopener"); } catch {}
    }, 120);

    // 3) dernier filet : navigation forcée
    setTimeout(() => {
      try { window.location.href = deeplink; } catch {}
    }, 260);
  }

  if (!open) return null;

  const mobile = isMobileUA();

  return (
    <div
  style={{
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.5)",
    display: "grid",
    placeItems: "center",
    padding: 16,
    zIndex: 9999,
  }}
>
  <div
    style={{
      background: "var(--card, #121212)",
      color: "inherit",
      borderRadius: 16,
      padding: 24,
      width: "100%",
      maxWidth: 420,
    }}
  >
        <h2 className="text-xl font-semibold mb-2">Self.xyz Verification</h2>
        <p className="text-sm opacity-80 mb-3">
          Scanne le QR (desktop) ou ouvre l’app Self (mobile).
        </p>

        {/* état/debug minimal */}
        <p className="text-xs opacity-60 mb-2">
          Status: {ready ? "Ready" : "Not ready"}{err ? ` — ${err}` : ""}
        </p>

        {selfApp ? (
          <div className="space-y-3">
            {/* QR en mode deeplink (encode le lien universel) */}
            <div className="grid place-items-center">
              <SelfQRcodeWrapper
                selfApp={selfApp}
                type="deeplink"        // ← clé pour mobile-first
                size={260}
                onSuccess={() => {
                  onClose(); // TODO: rafraîchir l’état "Verified"
                }}
                onError={(e) => console.error("Self verification failed", e)}
              />
            </div>

            {/* Bouton deeplink (mobile) + dispo partout en secours */}
            <button
              className="w-full rounded-xl py-2 bg-white/10 disabled:opacity-60"
              onClick={openSelfApp}
              disabled={!ready || !deeplink}
            >
              Ouvrir l’app Self
            </button>

            {/* Lien brut (copier/coller si navigateur bloque) */}
            {deeplink ? (
              <p className="text-xs break-all opacity-70">
                <a href={deeplink} target="_blank" rel="noreferrer">
                  {mobile ? "Si rien ne se passe, appuie ici" : "Lien universel"}
                </a>
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
