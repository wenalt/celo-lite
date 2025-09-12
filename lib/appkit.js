// /lib/appkit.js
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { celo } from "viem/chains";

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || "138901e6be32b5e78b59aa262e517fd0";

const metadata = {
  name: "Celo Lite",
  description: "Mini-hub for the Celo Prosperity ecosystem.",
  url: "https://celo-lite.vercel.app",
  icons: ["https://celo-lite.vercel.app/icon.png"],
};

let _inited = false;
let _wagmiConfig = null;

/**
 * Initialise AppKit + Wagmi une seule fois (SSR-safe).
 * Retourne la config Wagmi à utiliser dans <WagmiConfig>.
 */
export function initAppKit() {
  if (_inited) return _wagmiConfig;

  const wagmiAdapter = new WagmiAdapter({
    projectId,
    networks: [celo],
    // IMPORTANT pour Next.js pages/SSR : permet d’appeler createAppKit côté serveur
    ssr: true,
    // (optionnel) tu peux fixer un RPC custom :
    // transports: { [celo.id]: http("https://forno.celo.org") }
  });

  // Conserver la config Wagmi pour <WagmiConfig>
  _wagmiConfig = wagmiAdapter.wagmiConfig;

  createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    metadata,
    // exemples d’options si tu veux plus tard
    // themeMode: "light",
    // features: { email: false, socials: false }
  });

  _inited = true;
  return _wagmiConfig;
}

export function getWagmiConfig() {
  return _wagmiConfig;
}
