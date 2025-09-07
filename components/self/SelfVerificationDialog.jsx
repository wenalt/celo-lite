'use client'
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
// 👉 Import compatible avec les 2 formes d'export du paquet
import * as SelfQRNS from "@selfxyz/qrcode";
import { getUniversalLink } from "@selfxyz/core";
import { ZeroAddress } from "ethers";

// Résout le wrapper quelle que soit la forme d'export (default vs nommé)
const QRWrapper =
  // @ts-ignore
  (SelfQRNS && (SelfQRNS.SelfQRcodeWrapper || SelfQRNS.default))
    ? (SelfQRNS.SelfQRcodeWrapper || SelfQRNS.default)
    : null;

// Idem pour le builder (normalement export nommé)
const SelfAppBuilder = SelfQRNS.SelfAppBuilder;

export default function SelfVerificationDialog({ open, onClose, userAddress }) {
  const [selfApp, setSelfApp] = useState(null);
  const [deeplink, setDeeplink] = useState("");
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState(null);

  // portal: on rend le modal directement dans <body>
  const [mounted, setMounted] = useState(false);
  const [portalEl, setPortalEl] = useState(null);

  useEffect(() => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    setPortalEl(el);
    setMounted(true);
    return () => {
      document.body.removeChild(el);
    };
  }, []);

  const uid = useMemo(() => (userAddress ?? ZeroAddress), [userAddress]);

  useEffect(() => {
    if (!open) return;

    try {
      setErr(null);
      setReady(false);

      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const endpoint =
        process.env.NEXT_PUBLIC_SELF_ENDPOINT ||
        `${origin}/api/self/verify`;

      if (!SelfAppBuilder) {
        throw new Error("SelfAppBuilder introuvable depuis @selfxyz/qrcode");
      }

      const app = new SelfAppBuilder({
        version: 2,
        appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || "Celo Lite",
        scope: process.env.NEXT_PUBLIC_SELF_SCOPE || "celo-lite",
        endpoint,
        endpointType:
          process.env.NEXT_PUBLIC_SELF_USE_MOCK === "true"
            ? "staging_https"
            : "prod_https",
        userId: uid,
        userIdType: "hex",
        userDefinedData: "prosperity-passport",
        disclosures: {
          minimumAge: 18,
          nationality: true,
          gender: true,
        },
      }).build();

      const link = getUniversalLink(app);
      console.log("[Self] universal link:", link);
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

    try {
      // 1) ancre invisible + click programmatique
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

  if (!open || !mounted || !portalEl) return null;

  return createPortal(
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
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          background: "var(--card, #121212)",
          color: "inherit",
          borderRadius: 16,
          padding: 24,
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 10px 30px rgba(0,0,0,.4)",
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 8px" }}>
          Self.xyz Verification
        </h2>
        <p style={{ margin: "0 0 8px", opacity: 0.75, fontSize: 14 }}>
          Scanne le QR (desktop) ou ouvre l’app Self (mobile).
        </p>

        <p style={{ margin: "0 0 8px", opacity: 0.6, fontSize: 12 }}>
          Status: {ready ? "Ready" : "Not ready"}{err ? ` — ${err}` : ""}
        </p>

        {selfApp ? (
          <div style={{ display: "grid", gap: 12, placeItems: "center" }}>
            {/* Si le wrapper n'est pas résolu, on affiche un message clair */}
            {QRWrapper ? (
              <QRWrapper
                selfApp={selfApp}
                type="deeplink"
                size={260}
                onSuccess={() => { onClose(); /* TODO: re-fetch "Verified" */ }}
                onError={(e) => console.error("Self verification failed", e)}
              />
            ) : (
              <div
                style={{
                  padding: 12,
                  background: "rgba(255,255,255,.06)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              >
                Impossible de charger <code>SelfQRcodeWrapper</code> depuis <code>@selfxyz/qrcode</code>.
              </div>
            )}

            <button
              onClick={openSelfApp}
              disabled={!ready || !deeplink}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 12,
                background: "rgba(255,255,255,.08)",
                color: "inherit",
                border: 0,
                cursor: ready && deeplink ? "pointer" : "not-allowed",
                opacity: ready && deeplink ? 1 : 0.6,
              }}
            >
              Ouvrir l’app Self
            </button>

            {deeplink ? (
              <p style={{ fontSize: 12, opacity: 0.7, wordBreak: "break-all", margin: 0 }}>
                <a href={deeplink} target="_blank" rel="noreferrer">
                  Lien universel (fallback)
                </a>
              </p>
            ) : null}
          </div>
        ) : (
          <div>Chargement…</div>
        )}

        <div style={{ marginTop: 12, textAlign: "right" }}>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              color: "inherit",
              border: 0,
              opacity: 0.8,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>,
    portalEl
  );
}
