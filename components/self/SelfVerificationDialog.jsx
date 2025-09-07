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

  const uid = useMemo(
    () => (userAddress ?? ZeroAddress),
    [userAddress]
  );

  useEffect(() => {
    if (!open) return;

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
        minimumAge: 18,   // doit matcher le backend
        nationality: true,
        gender: true,
      },
    }).build();

    setSelfApp(app);
    setDeeplink(getUniversalLink(app));
  }, [open, uid]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 grid place-items-center p-4 z-50">
      <div className="bg-neutral-900 rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-2">Self.xyz Verification</h2>
        <p className="text-sm opacity-80 mb-4">
          Scanne le QR avec Self (desktop) ou ouvre l’app (mobile).
        </p>

        {selfApp ? (
          <div className="space-y-3">
            {/* QR pour desktop */}
            <div className="hidden md:block">
              <SelfQRcodeWrapper
                selfApp={selfApp}
                onSuccess={() => {
                  // TODO: re-fetch score/état si tu en as un
                  onClose();
                }}
                onError={() => console.error("Self verification failed")}
              />
            </div>

            {/* Deeplink pour mobile */}
            <button
              className="md:hidden w-full rounded-xl py-2 bg-white/10"
              onClick={() => window.open(deeplink, "_blank")}
            >
              Ouvrir l’app Self
            </button>
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
