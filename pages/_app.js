// /pages/_app.js
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiConfig } from "wagmi";
import { initAppKitClient } from "../lib/appkit";

export default function MyApp({ Component, pageProps }) {
  const [queryClient] = useState(() => new QueryClient());
  const [wagmiConfig, setWagmiConfig] = useState(null);

  // Initialise AppKit + Wagmi côté client
  useEffect(() => {
    const cfg = initAppKitClient();
    if (cfg) setWagmiConfig(cfg);
  }, []);

  // Tant que Wagmi/AppKit ne sont pas prêts côté client, on affiche un petit splash
  if (!wagmiConfig) {
    return (
      <QueryClientProvider client={queryClient}>
        <div
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            fontFamily:
              "Inter, ui-sans-serif, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
          }}
        >
          <div style={{ opacity: 0.7 }}>Loading Celo Lite…</div>
        </div>
      </QueryClientProvider>
    );
  }

  return (
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </WagmiConfig>
  );
}
