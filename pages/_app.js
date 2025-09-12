// pages/_app.js
import { useState } from "react";
import Head from "next/head";

import { WagmiConfig, createConfig, http } from "wagmi";
import { celo } from "viem/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { createAppKit } from "@reown/appkit";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { W3mFrame } from "@reown/appkit/react";
import "@reown/appkit-react/styles.css"; // ✅ chemin CSS correct

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
    // Active Farcaster Wallet & co
    features: { socials: ["farcaster"] },
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
