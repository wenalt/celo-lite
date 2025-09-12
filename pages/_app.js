// pages/_app.js
import Head from "next/head";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

import { createAppKit } from "@reown/appkit";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

// ⚠️ IMPORTANT: AppKit attend des "networks" au format CAIP, pas des "chains" wagmi
const CELO_NETWORK = {
  id: "eip155:42220",       // CAIP-2 ID
  chainId: 42220,
  name: "Celo Mainnet",
  currency: "CELO",
  explorerUrl: "https://celoscan.io",
  rpcUrl: "https://forno.celo.org"
};

const projectId =
  process.env.NEXT_PUBLIC_WC_PROJECT_ID ||
  "138901e6be32b5e78b59aa262e517fd0";

const metadata = {
  name: "Celo Lite",
  description: "Ecosystem · Staking · Governance",
  url:
    typeof window !== "undefined"
      ? window.location.origin
      : "https://celo-lite.vercel.app",
  icons: ["/icon.png"],
};

// ——— Instancie l’adapter Wagmi en lui passant des *networks* (pas chains)
const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [CELO_NETWORK],
  metadata,
  ssr: true, // pour éviter les erreurs au prerender SSR
});

const wagmiConfig = wagmiAdapter.wagmiConfig;

// Sécurise l'initialisation d'AppKit côté client
let appkitCreated = false;
function initAppKitOnce() {
  if (appkitCreated) return;
  createAppKit({
    projectId,
    adapters: [wagmiAdapter],
    themeMode: "light",
    features: { email: false },
  });
  appkitCreated = true;
}

export default function App({ Component, pageProps }) {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    if (typeof window !== "undefined") initAppKitOnce();
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <Component {...pageProps} />
        </QueryClientProvider>
      </WagmiProvider>
    </>
  );
}
