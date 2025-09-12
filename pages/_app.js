// pages/_app.js
import { useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";

import { WagmiConfig, createConfig, http } from "wagmi";
import { celo } from "viem/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// AppKit core + adapter
import { createAppKit } from "@reown/appkit";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import "@reown/appkit/styles.css";

// ⬇️ The frame required for socials (Farcaster)
const W3mFrame = dynamic(
  () => import("@reown/appkit-react").then((m) => m.W3mFrame),
  { ssr: false }
);

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;

// Your Wagmi config (same as before)
const wagmiConfig = createConfig({
  chains: [celo],
  transports: { [celo.id]: http("https://forno.celo.org") },
  ssr: true,
});

// AppKit init (run once in browser)
if (typeof window !== "undefined" && !window.__APPKIT_CREATED__) {
  const metadata = {
    name: "Celo Lite",
    description: "Ecosystem · Staking · Governance",
    url: "https://celo-lite.vercel.app",
    icons: ["/icon.png"],
  };

  const adapters = [new WagmiAdapter({ wagmiConfig })];

  createAppKit({
    adapters,
    projectId,
    metadata,
    // ⬇️ Enable Farcaster social login; remove if you don’t want it to show
    features: { socials: ["farcaster"], email: false },
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

        {/* Required for Farcaster social/OAuth */}
        <W3mFrame />
      </QueryClientProvider>
    </>
  );
}
