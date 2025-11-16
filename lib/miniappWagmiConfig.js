// lib/miniappWagmiConfig.js
import { createConfig, http } from "wagmi";
import { celo } from "wagmi/chains";
import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";

// Config Wagmi utilisée dans le contexte Mini App Farcaster
// - Utilise le wallet injecté par le client Farcaster
// - Pas de WalletConnect modal, pas de sélection de wallet
export const miniAppWagmiConfig = createConfig({
  chains: [celo],
  transports: {
    [celo.id]: http(), // RPC public par défaut (tu pourras en mettre un custom plus tard)
  },
  connectors: [
    miniAppConnector(),
  ],
});
