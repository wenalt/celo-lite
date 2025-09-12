// pages/index.js
import Head from "next/head";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { sdk } from "@farcaster/miniapp-sdk";

// ─────────────────────────────────────────────────────────────
// ✅ Reown AppKit + wagmi/viem (EIP-6963 & Farcaster Wallet)
// ─────────────────────────────────────────────────────────────
import { createAppKit } from "@reown/appkit";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { WagmiConfig, useAccount, useBalance, useChainId, useDisconnect } from "wagmi";
import { http } from "viem";

// Self dialog (client-only)
const SelfVerificationDialog = dynamic(
  () => import("../components/self/SelfVerificationDialog"),
  { ssr: false }
);

const BTN = "btn";
const CARD = "card";

// CELO chain config for viem/wagmi
const CELO_CHAIN_ID = 42220;
const celoChain = {
  id: CELO_CHAIN_ID,
  name: "Celo",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://forno.celo.org"] },
    public: { http: ["https://forno.celo.org"] },
  },
  blockExplorers: {
    default: { name: "Celoscan", url: "https://celoscan.io" },
  },
};

// WalletConnect / AppKit projectId
const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID || "138901e6be32b5e78b59aa262e517fd0";

// Wagmi adapter (transports + networks)
const wagmiAdapter = new WagmiAdapter({
