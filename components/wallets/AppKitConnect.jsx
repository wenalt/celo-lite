// components/wallets/AppKitConnect.jsx
"use client";

import { useEffect, useState } from "react";
import { useAccount, useDisconnect, useConnect } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { sdk } from "@farcaster/miniapp-sdk";

export default function AppKitConnect({ className }) {
  const [isMiniApp, setIsMiniApp] = useState(false);

  // Détecter si on tourne dans une Mini App Farcaster
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const inside = await sdk.isInMiniApp();
        if (!cancelled) setIsMiniApp(!!inside);
      } catch {
        if (!cancelled) setIsMiniApp(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // wagmi (config différent selon _app.js, mais hooks identiques)
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();

  // AppKit (utilisé uniquement sur le web classique)
  const { open } = useAppKit();

  const short = (a) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "");
  const btnClass = className || "wallet-cta";

  // Si on est déjà connecté (web OU mini app) → même rendu
  if (isConnected) {
    return (
      <div
        className={className}
        style={{ display: "flex", gap: 8, alignItems: "center" }}
      >
        <span className="addr">{short(address)}</span>
        <button className="btn" onClick={() => disconnect()}>
          Disconnect
        </button>
      </div>
    );
  }

  // MINI APP : utiliser le connector Farcaster (wagmi), pas AppKit
  if (isMiniApp) {
    const hasConnector = connectors && connectors.length > 0;

    return (
      <button
        className={btnClass}
        onClick={() => hasConnector && connect({ connector: connectors[0] })}
        disabled={!hasConnector}
      >
        Connect Wallet
      </button>
    );
  }

  // WEB CLASSIQUE : on garde AppKit comme avant
  return (
    <button className={btnClass} onClick={() => open()}>
      Connect Wallet
    </button>
  );
}
