// pages/_app.js
import Head from "next/head";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

import { createAppKit } from "@reown/appkit";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { celo } from "viem/chains";

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

// Build Wagmi adapter (works with SSR)
const wagmiAdapter = new WagmiAdapter({
  projectId,
  chains: [celo],
  metadata,
  ssr: true,
});

const wagmiConfig = wagmiAdapter.wagmiConfig;

let appkitCreated = false;
function initAppKitOnce() {
  if (appkitCreated) return;
  createAppKit({
    projectId,
    adapters: [wagmiAdapter], // ✅ new API: pass adapters
    themeMode: "light",
    features: { email: false },
  });
  appkitCreated = true;
}

export default function App({ Component, pageProps }) {
  const [queryClient] = useState(() => new QueryClient());

  // Create AppKit on the client
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
