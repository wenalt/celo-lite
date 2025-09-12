// /lib/appkit.js
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { celo } from "viem/chains";

const projectId =
  process.env.NEXT_PUBLIC_WC_PROJECT_ID ||
  "138901e6be32b5e78b59aa262e517fd0";

const metadata = {
  name: "Celo Lite",
  description: "Mini-hub for the Celo Prosperity ecosystem.",
  url: "https://celo-lite.vercel.app",
  icons: ["https://celo-lite.vercel.app/icon.png"],
};

let _inited = false;
let _wagmiConfig = null;

/**
 * Initialise AppKit côté client (CSR) uniquement.
 * Retourne la config Wagmi quand prête.
 */
export function initAppKitClient() {
  if (typeof window === "undefined") return null; // pas d'init en SSR
  if (_inited) return _wagmiConfig;

  // NOTE: ssr:false => évite les import dynamiques côté serveur
  const wagmiAdapter = new WagmiAdapter({
    projectId,
    networks: [celo],
    ssr: false,
    // transports: { [celo.id]: http("https://forno.celo.org") }, // optionnel
  });

  _wagmiConfig = wagmiAdapter.wagmiConfig;

  createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    metadata,
    // themeMode: "light", // si tu veux forcer clair
  });

  _inited = true;
  return _wagmiConfig;
}
