// pages/_app.js
import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";

import { WagmiConfig, createConfig, http } from "wagmi";
import { celo } from "viem/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { createAppKit } from "@reown/appkit";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
// ⚠️ NE PAS importer de CSS AppKit ici (chemins variables selon versions)

// Charge W3mFrame uniquement côté client (évite le crash SSR /500)
const W3mFrameNoSSR = dynamic(
  () => import("@reown/appkit/react").then((m) => m.W3mFrame),
  { ssr: false }
);

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;

// wagmi (Celo uniquement) — SSR friendly
const wagmiConfig = createConfig({
  chains: [celo],
  transports: { [celo.id]: http("https://forno.celo.org") },
  ssr: true,
});

export default function App({ Component, pageProps }) {
  const [queryClient] = useState(() => new QueryClient());
  const appkitInitRef = useRef(false);

  // Initialise AppKit seulement côté client, une seule fois
  useEffect(() => {
    if (appkitInitRef.current) return;
    if (typeof window === "undefined") return;

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
      features: { socials: ["farcaster"] }, // Farcaster Wallet activé
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

        {/* Requis pour Farcaster Wallet, mais seulement côté client */}
        <W3mFrameNoSSR />
      </QueryClientProvider>
    </>
  );
}
