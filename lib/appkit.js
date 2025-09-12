// lib/appkit.js
import { http } from "viem";
import { celo } from "viem/chains";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { createAppKit } from "@reown/appkit";

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID; // tu l'as déjà

// Wagmi + transports CELO
export const wagmiAdapter = new WagmiAdapter({
  transports: {
    [celo.id]: http("https://forno.celo.org")
  },
  ssr: true,
  chains: [celo]
});

// Expose la config wagmi (si plus tard tu veux les hooks wagmi)
export const wagmiConfig = wagmiAdapter.wagmiConfig;

// Instancie AppKit (ancien web3modal) — pas encore utilisé tant que tu n’appelles pas open()
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  defaultChain: celo,
  metadata: {
    name: "Celo Lite",
    description: "Mini-hub Celo: governance, Mondo staking, Layer3, CeloPG, Self.xyz",
    url: "https://celo-lite.vercel.app",
    icons: ["https://celo-lite.vercel.app/icon.png"]
  },
  // options d’apparence — tu pourras affiner plus tard
  themeMode: "light",
  features: {
    analytics: false
  }
});
