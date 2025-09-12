// pages/_app.js
import { useState } from "react";
import Head from "next/head";
import { createConfig, http, WagmiConfig } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { celo } from "viem/chains";
import { createAppKit } from "@reown/appkit";

// --- Wagmi (SSR-safe)
const wagmiConfig = createConfig({
  chains: [celo],
  transports: { [celo.id]: http("https://forno.celo.org") },
  ssr: true,
});

const projectId =
  process.env.NEXT_PUBLIC_WC_PROJECT_ID ||
  "138901e6be32b5e78b59aa262e517fd0";

// --- AppKit doit être appelé une seule fois avant tout hook useAppKit
if (typeof globalThis !== "undefined" && !globalThis.__APPKIT_READY__) {
  try {
    createAppKit({
      projectId,
      wagmiConfig,
      chains: [celo],
      metadata: {
        name: "Celo Lite",
        description: "Ecosystem · Staking · Governance",
        url: "https://celo-lite.vercel.app",
        icons: ["https://celo-lite.vercel.app/icon.png"],
      },
      themeMode: "auto",
    });
    globalThis.__APPKIT_READY__ = true;
  } catch (e) {
    // En SSR pur certaines APIs peuvent manquer : on ignore, et le client init reprendra
    console.debug("AppKit init (SSR) note:", e?.message);
  }
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
      </QueryClientProvider>
    </>
  );
}
