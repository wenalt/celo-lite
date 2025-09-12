// /pages/_app.js
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiConfig } from "wagmi";
import { initAppKit } from "../lib/appkit";

// On initialise AppKit *avant* de rendre l'app (SSR + CSR)
const wagmiConfig = initAppKit();

export default function MyApp({ Component, pageProps }) {
  // Un QueryClient par onglet
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </WagmiConfig>
  );
}
