// pages/_app.js
import { useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";

import { WagmiConfig, createConfig, http } from "wagmi";
import { celo } from "viem/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// AppKit core + adapter (OK)
import { createAppKit } from "@reown/appkit";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
// 👉 imports React + styles depuis le sous-chemin
import { W3mFrame } from "@reown/appkit/react";
import "@reown/appkit/react/styles.css";

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;

// Wagmi de base
const wagmiConfig = createConfig({
  chains: [celo],
  transports: { [celo.id]: http("https://forno.celo.org") },
  ssr: true,
});

// Init AppKit une seule fois côté client
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
    features: {
      // Active le bouton social Farcaster (optionnel)
      socials: ["farcaster"],
      email: false,
    },
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

        {/* Requis pour le login Farcaster (sinon: “W3mFrame: iframe is not set”) */}
        <W3mFrame />
      </QueryClientProvider>
    </>
  );
}
