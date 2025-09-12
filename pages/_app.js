// pages/_app.js
import Head from "next/head";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit";
import { defaultWagmiConfig } from "@reown/appkit-adapter-wagmi";
import { WagmiProvider } from "wagmi";
import { celo } from "viem/chains";

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || "138901e6be32b5e78b59aa262e517fd0";
const metadata = {
  name: "Celo Lite",
  description: "Ecosystem · Staking · Governance",
  url: typeof window !== "undefined" ? window.location.origin : "https://celo-lite.vercel.app",
  icons: ["/icon.png"],
};
const chains = [celo];
const wagmiConfig = defaultWagmiConfig({ projectId, chains, metadata });

let appkitReady = false;

export default function App({ Component, pageProps }) {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    if (typeof window === "undefined" || appkitReady) return;
    createAppKit({
      projectId,
      wagmiConfig,
      chains,
      themeMode: "light",       // tu gères toujours ton thème côté UI
      features: { email: false }
    });
    appkitReady = true;
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
