// pages/_app.js
import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";

import { WagmiConfig, createConfig, http } from "wagmi";
import { celo } from "viem/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { createAppKit } from "@reown/appkit";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
// ⚠️ Ne pas importer de CSS AppKit ici (les chemins varient selon versions)

// Charge W3mFrame uniquement côté client (évite le crash SSR)
const W3mFrameNoSSR = dynamic(
  () => import("@reown/appkit/react").then((m) => m.W3mFrame),
  { ssr: false }
);

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;

// wagmi: Celo mainnet (SSR-friendly)
const wagmiConfig = createConfig({
  chains: [celo],
  transports: { [celo.id]: http("https://forno.celo.org") },
  ssr: true,
});

// Réseau CAIP explicite pour AppKit (clé du fix)
const CELO_CAIP = {
  id: "eip155:42220",
  chainId: 42220,
  name: "Celo",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: ["https://forno.celo.org", "https://rpc.ankr.com/celo"],
  explorerUrls: ["https://celoscan.io/"],
  testnet: false,
};

export default function App({ Component, pageProps }) {
  const [queryClient] = useState(() => new QueryClient());
  const appkitInitRef = useRef(false);

  useEffect(() => {
    if (appkitInitRef.current) return;
    if (typeof window === "undefined") return;

    const metadata = {
      name: "Celo Lite",
      description: "Ecosystem · Staking · Governance",
      url: "https://celo-lite.vercel.app",
      icons: ["/icon.png"],
    };

    // 👉 Fournit networks au WagmiAdapter (sinon undefined → .map crash)
    const adapter = new WagmiAdapter({
      wagmiConfig,
      networks: [CELO_CAIP],
    });

    createAppKit({
      adapters: [adapter],
      projectId,
      metadata,
      networks: [CELO_CAIP], // utile pour l’UI d’AppKit
      features: { socials: ["farcaster"] }, // Farcaster Wallet
    });

    appkitInitRef.current = true;
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <QueryClientProvider client={queryClient}>
        <WagmiConfig config={wagmiConfig}>
          <Component {...pageProps} />
        </WagmiConfig>

        {/* Requis pour Farcaster Wallet, uniquement côté client */}
        <W3mFrameNoSSR />
      </QueryClientProvider>
    </>
  );
}
