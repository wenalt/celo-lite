// pages/index.js
import Head from "next/head";
import { useEffect, useState } from "react";

const BTN = "btn";
const CARD = "card";

// Load the UMD provider from /public once, on demand
function loadLocalWCProvider() {
  return new Promise((resolve) => {
    if (window.WalletConnectEthereumProvider?.EthereumProvider) return resolve(true);
    const s = document.createElement("script");
    s.src = "/vendor/wc-eth.js?v=2025-09-07";
    s.async = false;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });
}

export default function Home() {
  const [address, setAddress] = useState(null);
  const [wcProvider, setWcProvider] = useState(null);

  const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || "138901e6be32b5e78b59aa262e517fd0";
  const CELO_CHAIN_ID = 42220;

  const [theme, setTheme] = useState("auto");
  useEffect(() => {
    const saved = localStorage.getItem("celo-lite-theme");
    if (saved === "light" || saved === "dark" || saved === "auto") setTheme(saved);
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") root.setAttribute("data-theme", "light");
    else if (theme === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    localStorage.setItem("celo-lite-theme", theme);
  }, [theme]);

  function cycleTheme() {
    setTheme((t) => (t === "auto" ? "light" : t === "light" ? "dark" : "auto"));
  }

  async function ensureProvider() {
    const ok = await loadLocalWCProvider();
    if (!ok) {
      alert("WalletConnect failed to load. Hard refresh (Ctrl/Cmd+Shift+R) and retry.");
      return null;
    }
    if (wcProvider) return wcProvider;

    const WCE = window.WalletConnectEthereumProvider;
    if (!WCE?.EthereumProvider) {
      alert("WalletConnect global missing after load.");
      return null;
    }

    const provider = await WCE.EthereumProvider.init({
      projectId,
      showQrModal: true,
      chains: [CELO_CHAIN_ID],
      methods: [
        "eth_sendTransaction",
        "personal_sign",
        "eth_signTypedData",
        "wallet_switchEthereumChain",
        "wallet_addEthereumChain",
      ],
      events: ["accountsChanged", "chainChanged", "disconnect"],
      metadata: {
        name: "Celo Lite",
        description: "Ecosystem · Staking · Governance",
        url: typeof location !== "undefined" ? location.origin : "https://celo-lite.vercel.app",
        icons: ["/icon.png"],
      },
    });

    provider.on("accountsChanged", (accs) => setAddress(accs?.[0] || null));
    provider.on("disconnect", () => setAddress(null));
    setWcProvider(provider);
    return provider;
  }

  async function connect() {
    const provider = await ensureProvider();
    if (!provider) return;
    try {
      await provider.connect();
      setAddress(provider.accounts?.[0] || null);

      const celoHex = `0x${CELO_CHAIN_ID.toString(16)}`;
      if (provider.chainId !== celoHex) {
        try {
          await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: celoHex }] });
        } catch {
          try {
            await provider.request({
              method: "wallet_addEthereumChain",
              params: [{
                chainId: celoHex,
                chainName: "Celo Mainnet",
                rpcUrls: ["https://forno.celo.org"],
                nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
                blockExplorerUrls: ["https://celoscan.io/"],
              }],
            });
          } catch {}
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function disconnect() {
    try { await wcProvider?.disconnect(); } catch {}
    setAddress(null);
  }

