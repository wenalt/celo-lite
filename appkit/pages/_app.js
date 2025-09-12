// pages/_app.js
import React from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { walletConnect } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const celo = {
  id: 42220,
  name: "Celo",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://forno.celo.org"] },
    public: { http: ["https://forno.celo.org"] },
  },
  blockExplorers: { default: { name: "CeloScan", url: "https://celoscan.io" } },
};

const wcProjectId =
  process.env.NEXT_PUBLIC_WC_PROJECT_ID ||
  "138901e6be32b5e78b59aa262e517fd0";

const wagmiConfig = createConfig({
  chains: [celo],
  transports: { [celo.id]: http("https://forno.celo.org") },
  connectors: [
    walletConnect({
      projectId: wcProjectId,
      showQrModal: true,
      metadata: {
        name: "Celo Lite",
        description: "Ecosystem · Staking · Governance",
        url: "https://celo-lite.vercel.app",
        icons: ["https://celo-lite.vercel.app/icon.png"],
      },
    }),
  ],
});

const queryClient = new QueryClient();

export default function App({ Component, pageProps }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
