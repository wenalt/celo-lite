// pages/_app.js
import { useState } from "react";
import Head from "next/head";
import { WagmiConfig, createConfig, http } from "wagmi";
import { celo } from "viem/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const wagmiConfig = createConfig({
  chains: [celo],
  transports: {
    [celo.id]: http("https://forno.celo.org"),
  },
  ssr: true,
});

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
