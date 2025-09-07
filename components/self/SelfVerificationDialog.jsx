'use client'
import { useEffect, useMemo, useState } from "react";
import { getUniversalLink } from "@selfxyz/core";
import { ZeroAddress } from "ethers";

export default function SelfVerificationDialog({ open, onClose, userAddress }) {
  const [SelfQR, setSelfQR] = useState(null);          // composant QR (lazy)
  const [SelfBuilder, setSelfBuilder] = useState(null); // builder (lazy)
  const [selfApp, setSelfApp] = useState(null);
  const [deeplink, setDeeplink] = useState("");
  const [err, setErr] = useState(null);

  const uid = useMemo(() => (userAddress ?? ZeroAddress), [userAddress]);

  useEffect(() => {
    if (!open) return;
    let mounted = true;

    (async () => {
      try {
        setErr(null);
        // 🔹 import dynamique de la lib Self
        const mod = await import("@selfxyz/qrcode");
        if (!mounted) return;
        setSelfQR(() => mod.SelfQRcodeWrapper);
        setSelfBuilder(() => mod.SelfAppBuilder);

        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const endpoint =
          process.env.NEXT_PUBLIC_SELF_ENDPOINT || `${origin}/api/self/verify`;

        const app = new mod.SelfAppBuilder({
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
          disclosures: { minimumAge: 18, nationality: true, gender: true },
        }).build();

        setSelfApp(app);
        setDeeplink(getUniversalLink(app) || "");
      } catch (e) {
        console.error("[Self] init error", e);
        if (mounted) setErr(e?.message || "Failed to init Self");
      }
    })();

    return () => { mounted = false; };
  }, [open, uid]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.5)",
        display: "grid", placeItems: "center", padding: 16, zIndex: 9999
      }}
      role="dialog" aria-modal="true"
    >
      <div
        style={{
          background: "var(--card, #121212)", color: "inherit",
          borderRadius: 16, padding: 24, width: "100%", maxWidth: 420,
          boxShadow: "0 10px 30px rgba(0,0,0,.4)"
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 8px" }}>
          Self.xyz Verification
        </h2>
        <p style={{ margin: "0 0 8px", opacity: .75, fontSize: 14 }}>
          Scanne le QR (desktop) ou ouvre l’app Self (mobile).
        </p>

        <p style={{ margin: "0 0 8px", opacity: .6, fontSize: 12 }}>
          Status: {deeplink ? "Ready" : "Not ready"}{err ? ` — ${err}` : ""}
        </p>

        {SelfQR && selfApp ? (
          <div style={{ display: "grid", gap: 12, placeItems: "center" }}>
            <SelfQR
              selfApp={selfApp}
              type="deeplink"
              size={260}
              onSuccess={() => onClose()}
              onError={(e) => console.error("Self verification failed", e)}
            />
            <button
              onClick={() => window.open(deeplink, "_blank", "noopener")}
              disabled={!deeplink}
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 12,
                background: "rgba(255,255,255,.08)", color: "inherit",
                border: 0, cursor: deeplink ? "pointer" : "not-allowed",
                opacity: deeplink ? 1 : .6
              }}
            >
              Ouvrir l’app Self
            </button>
            {deeplink && (
              <p style={{ fontSize: 12, opacity: .7, wordBreak: "break-all", margin: 0 }}>
                <a href={deeplink} target="_blank" rel="noreferrer">
                  Lien universel (fallback)
                </a>
              </p>
            )}
          </div>
        ) : (
          <div>Chargement…</div>
        )}

        <div style={{ marginTop: 12, textAlign: "right" }}>
          <button
            onClick={onClose}
            style={{ background: "transparent", color: "inherit", border: 0, opacity: .8, cursor: "pointer", fontSize: 14 }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
