// pages/_app.js
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiConfig } from "wagmi";

import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

// ✅ Réseaux AppKit (inclut Celo)
import { celo } from "@reown/appkit/networks";

// ✅ Vercel Analytics
import { Analytics } from "@vercel/analytics/react";

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;

// Métadonnées pour WalletConnect/AppKit
const metadata = {
  name: "Celo Lite",
  description: "Ecosystem · Staking · Governance",
  url: "https://celo-lite.vercel.app",
  icons: ["https://celo-lite.vercel.app/icon.png"],
};

// ✅ Liste des réseaux supportés par l’app (CRUCIAL)
export const networks = [celo];

// Adapter Wagmi pour AppKit (ssr: true pour Next.js pages/SSR)
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks, // <-- indispensable
  ssr: true,
});

// Instancie AppKit une seule fois au chargement du module
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks, // <-- indispensable
  metadata,
  // ✅ IMPORTANT : on désactive les logins sociaux (dont Farcaster)
  features: {
    email: false,
    socials: [], // <- plus de "Sign in with Farcaster"
    // analytics: true, // optionnel
  },
});

const queryClient = new QueryClient();

export default function App({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiAdapter.wagmiConfig}>
        <Component {...pageProps} />
        {/* Analytics: pageviews automatiques */}
        <Analytics />
      </WagmiConfig>
    </QueryClientProvider>
  );
}
