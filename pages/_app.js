// pages/_app.js
import { useState } from "react";
import Head from "next/head";

import { WagmiConfig, createConfig, http } from "wagmi";
import { celo } from "viem/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { createAppKit } from "@reown/appkit";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { W3mFrame } from "@reown/appkit/react";
// ❌ SUPPRIMÉ car non exporté par ta version :
// import "@reown/appkit-react/styles.css";

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;

// wagmi (Celo uniquement)
const wagmiConfig = createConfig({
  chains: [celo],
  transports: { [celo.id]: http("https://forno.celo.org") },
  ssr: true,
});

// Initialisation AppKit côté client (une seule fois)
if (typeof window !== "undefined" && !window.__APPKIT_CREATED__) {
  const metadata = {
    name: "Celo Lite",
    description: "Ecosystem · Staking · Governance",
    url: "https://celo-lite.vercel.app",
    icons: ["/icon.png"],
  };

  const adapter = new WagmiAdapter({ wagmiConfig });

  createAppKit({
    adapters: [adapter],
    projectId,
    metadata,
    features: { socials: ["farcaster"] }, // ✅ Farcaster Wallet activé
  });

  window.__APPKIT_CREATED__ = true;
}

export default function App({ Component, pageProps }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <QueryClientProvider client={queryClient}>
        <WagmiConfig config={wagmiConfig}>
          <Component {...pageProps} />
        </WagmiConfig>
        {/* requis pour Farcaster Wallet (Web3Modal Frame) */}
        <W3mFrame />
      </QueryClientProvider>
    </>
  );
}
