// pages/_app.js
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiConfig } from "wagmi";

import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { celo } from "@reown/appkit/networks";

import { Analytics } from "@vercel/analytics/react";

// Mini App SDK + config wagmi spéciale mini app
import { sdk } from "@farcaster/miniapp-sdk";
import { miniAppWagmiConfig } from "../lib/miniappWagmiConfig";

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;

// Métadonnées pour WalletConnect/AppKit
const metadata = {
  name: "Celo Lite",
  description: "Ecosystem · Staking · Governance",
  url: "https://celo-lite.vercel.app",
  icons: ["https://celo-lite.vercel.app/icon.png"],
};

// Réseau pour AppKit (web classique)
export const networks = [celo];

// Adapter Wagmi pour AppKit (web)
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
  ssr: true,
});

// Instancie AppKit une seule fois (web)
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  metadata,
  features: {
    email: false,
    socials: [], // pas de login Farcaster dans la modale
  },
});

const queryClient = new QueryClient();

export default function App({ Component, pageProps }) {
  const [isMiniApp, setIsMiniApp] = useState(false);

  // Détecte si on tourne dans une Mini App Farcaster (client-side uniquement)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const inside = await sdk.isInMiniApp();
        if (!cancelled && inside) {
          setIsMiniApp(true);
        }
      } catch {
        // ignore si hors environnement mini app
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Choix du config Wagmi selon le contexte
  const wagmiConfigToUse = isMiniApp
    ? miniAppWagmiConfig      // Mini App → wallet Farcaster
    : wagmiAdapter.wagmiConfig; // Web → AppKit / WalletConnect

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiConfigToUse}>
        <Component {...pageProps} />
        <Analytics />
      </WagmiConfig>
    </QueryClientProvider>
  );
}
