// utils/usePreferredWallet.js
import { useAccount, useConnect } from "wagmi";
import { useCallback, useEffect } from "react";

const KEY = "celo-lite:last-wallet";

export function usePreferredWallet() {
  const { connectors, connectAsync } = useConnect();
  const { status, connector } = useAccount();

  // Sauvegarde dès qu'on est connecté
  useEffect(() => {
    if (typeof window === "undefined") return;
    const id =
      connector?.uid || connector?.id || connector?.name || null;
    if (status === "connected" && id) {
      try { localStorage.setItem(KEY, String(id)); } catch {}
    }
  }, [status, connector]);

  // Essaie de se connecter avec le wallet mémorisé
  const connectPreferred = useCallback(async () => {
    if (typeof window === "undefined") throw new Error("no-window");
    const saved = localStorage.getItem(KEY);
    const preferred = connectors.find(
      (c) => c.uid === saved || c.id === saved || c.name === saved
    );
    if (!preferred) throw new Error("no-preferred");
    await connectAsync({ connector: preferred });
  }, [connectors, connectAsync]);

  const getPreferredId = () => {
    try { return typeof window !== "undefined" ? localStorage.getItem(KEY) : null; } catch { return null; }
  };

  return { connectPreferred, getPreferredId };
}
