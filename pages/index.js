import Head from "next/head";
import Script from "next/script";
import { useEffect, useState } from "react";

const BTN = "btn";
const CARD = "card";

export default function Home() {
  const [address, setAddress] = useState(null);
  const [wcProvider, setWcProvider] = useState(null);

  // WalletConnect readiness (2 scripts to load OR poller detects global)
  const [wcLoaded, setWcLoaded] = useState(0);
  const wcReady = wcLoaded >= 2;

  const projectId = "138901e6be32b5e78b59aa262e517fd0";
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
    else root.removeAttribute("data-theme"); // auto
    localStorage.setItem("celo-lite-theme", theme);
  }, [theme]);

  // extra safety: poll for the UMD global in case onLoad doesn't fire in a webview
  useEffect(() => {
    const ok = () =>
      !!(window.WalletConnectEthereumProvider?.EthereumProvider);
    if (ok()) {
      setWcLoaded(2);
      return;
    }
    const id = setInterval(() => {
      if (ok()) {
        setWcLoaded(2);
        clearInterval(id);
      }
    }, 500);
    return () => clearInterval(id);
  }, []);

  function cycleTheme() {
    setTheme((t) => (t === "auto" ? "light" : t === "light" ? "dark" : "auto"));
  }

  async function ensureProvider() {
    if (!wcReady) {
      alert("WalletConnect is initializing. Try again in a second.");
      return null;
    }
    if (wcProvider) return wcProvider;
    const WCE = window.WalletConnectEthereumProvider;
    if (!WCE?.EthereumProvider) {
      alert("WalletConnect not loaded yet. Try again in a second.");
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
          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: celoHex }],
          });
        } catch {
          try {
            await provider.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: celoHex,
                  chainName: "Celo Mainnet",
                  rpcUrls: ["https://forno.celo.org"],
                  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
                  blockExplorerUrls: ["https://celoscan.io/"],
                },
              ],
            });
          } catch {}
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function disconnect() {
    try {
      await wcProvider?.disconnect();
    } catch {}
    setAddress(null);
  }

  const short = (a) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "");
  const themeLabel =
    theme === "auto" ? "Auto" : theme === "light" ? "Light" : "Dark";
  const themeIcon = theme === "auto" ? "A" : theme === "light" ? "☀️" : "🌙";

  return (
    <>
      <Head>
        <title>Celo Lite — Ecosystem · Staking · Governance</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Celo Lite" />
        <meta
          property="og:description"
          content="Ecosystem · Staking · Governance"
        />
        <meta property="og:image" content="/og.png" />

        {/* Inter font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      {/* WalletConnect UMD via jsDelivr (more reliable than remote ESM) */}
      <Script
        src="https://cdn.jsdelivr.net/npm/@walletconnect/ethereum-provider@2.21.5/dist/index.umd.js"
        strategy="afterInteractive"
        onLoad={() => setWcLoaded((n) => n + 1)}
        onError={() => console.warn("wc provider failed to load")}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/@walletconnect/modal@2.7.0/dist/cdn/index.js"
        strategy="afterInteractive"
        onLoad={() => setWcLoaded((n) => n + 1)}
        onError={() => console.warn("wc modal failed to load")}
      />

      <main className="page">
        <div className="wrap">
          <header className="head">
            <div className="brand">
              <img src="/icon.png" alt="Celo Lite" width="40" height="40" />
              <div>
                <h1>Celo Lite</h1>
                <p className="tagline">Ecosystem · Staking · Governance</p>
              </div>
            </div>

            <div className="right">
              <button
                className="theme"
                onClick={cycleTheme}
                title={`Theme: ${themeLabel}`}
              >
                <span className="emoji">{themeIcon}</span>
                <span className="label">{themeLabel}</span>
              </button>

              <a
                className="fc"
                href="https://warpcast.com/wenaltszn.eth"
                target="_blank"
                rel="noreferrer"
                title="Farcaster profile"
              >
                <img src="/farcaster.png" alt="Farcaster" width="22" height="22" />
                <span>@wenaltszn.eth</span>
              </a>

              <div className="wc">
                {address ? (
                  <>
                    <span className="addr">{short(address)}</span>
                    <button className={BTN} onClick={disconnect}>
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    className={BTN}
                    onClick={connect}
                    disabled={!wcReady}
                  >
                    {wcReady ? "Connect Wallet" : "Initializing…"}
                  </button>
                )}
              </div>
            </div>
          </header>

          <section className={CARD}>
            <h2>Governance</h2>
            <p>
              Get voting power by staking on a validator, then participate in
              proposals.
            </p>
            <div className="btns">
              <a
                className={BTN}
                href="https://mondo.celo.org/"
                target="_blank"
                rel="noreferrer"
              >
                Open Mondo
              </a>
              <a
                className={BTN}
                href="https://mondo.celo.org/governance"
                target="_blank"
                rel="noreferrer"
              >
                Browse Governance
              </a>
            </div>
            <p className="hint">
              opens in the embedded browser — you’ll use <b>your</b> EVM wallet.
            </p>
          </section>

          <section className={CARD}>
            <h2>Prosperity Passport</h2>
            <p>Track your onchain footprint across Celo and unlock recognition.</p>
            <div className="btns">
              <a
                className={BTN}
                href="https://pass.celopg.eco/"
                target="_blank"
                rel="noreferrer"
              >
                Open CeloPG
              </a>
            </div>
          </section>

          <section className={CARD}>
            <h2>Layer3 quests (current season)</h2>
            <p>Ongoing quests on Celo to learn, build reputation and stay consistent.</p>
            <div className="btns">
              <a
                className={BTN}
                href="https://app.layer3.xyz/search?chainIds=42220&types=current_season"
                target="_blank"
                rel="noreferrer"
              >
                Open Layer3
              </a>
            </div>
          </section>

          <footer className="foot">
            <div className="social">
              <a
                className="icon-link"
                href="https://x.com/Celo"
                target="_blank"
                rel="noreferrer"
                title="@Celo on X"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M17.5 3h3.1l-6.8 7.8L22 21h-6.3l-4.9-6.4L5.1 21H2l7.4-8.6L2 3h6.4l4.4 5.8L17.5 3zm-1.1 16h1.7L7.7 5h-1.7L16.4 19z"/>
                </svg>
                <span>@Celo</span>
              </a>
              <a
                className="icon-link"
                href="https://t.me/+3uD9NKPbStYwY2Nk"
                target="_blank"
                rel="noreferrer"
                title="Support CeloPG"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#2AABEE" aria-hidden>
                  <path d="M9.6 16.8l.3-4.3 7.8-7.2c.3-.3-.1-.5-.4-.4L6.9 11.7 2.6 10.3c-.9-.3-.9-.9.2-1.3L20.7 3c.8-.3 1.5.2 1.2 1.5l-2.9 13.6c-.2.9-.8 1.2-1.6.8l-4.4-3.3-2.2 1.2c-.2.1-.4 0-.4-.2z"/>
                </svg>
                <span className="label">Support CeloPG</span>
              </a>
            </div>
            <p className="madeby">
              Questions or suggestions? ping me on farcaster or join the Prosperity Passport support Telegram channel
            </p>
          </footer>
        </div>
      </main>

      <style jsx global>{`
        :root{
          --bg:#F6DF3A;
          --text:#0b0b0b;
          --muted:#4b5563;
          --ring:rgba(0,0,0,.08);
          --card:#ffffff;
          --btn-bg:#0b0b0b;
          --btn-fg:#ffffff;
        }
        @media (prefers-color-scheme: dark){
          :root{
            --bg:#0b0b0b; --text:#f4f4f5; --muted:#a1a1aa; --ring:rgba(255,255,255,.12);
            --card:#121212; --btn-bg:#f4f4f5; --btn-fg:#0b0b0b;
          }
        }
        [data-theme="light"]{ --bg:#F6DF3A; --text:#0b0b0b; --muted:#4b5563; --ring:rgba(0,0,0,.08); --card:#fff; --btn-bg:#0b0b0b; --btn-fg:#fff; }
        [data-theme="dark"]{ --bg:#0b0b0b; --text:#f4f4f5; --muted:#a1a1aa; --ring:rgba(255,255,255,.12); --card:#121212; --btn-bg:#f4f4f5; --btn-fg:#0b0b0b; }

        *{ box-sizing:border-box }
        html,body{ margin:0; font-family:Inter,ui-sans-serif,-apple-system,Segoe UI,Roboto,Helvetica,Arial; color:var(--text); background:var(--bg); }
        .page{ min-height:100vh; display:flex; align-items:center; }
        .wrap{ width:100%; max-width:820px; margin:0 auto; padding:32px 20px; }

        .head{ display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:18px; }
        .brand{ display:flex; align-items:center; gap:12px; }
        h1{ font-size:28px; font-weight:700; line-height:1.1; margin:0 }
        .tagline{ margin:2px 0 0; color:var(--muted) }
        .right{ display:flex; align-items:center; gap:12px; }

        .theme{ display:inline-flex; align-items:center; gap:8px; padding:6px 10px; border-radius:10px; background:var(--card); border:1px solid var(--ring); color:inherit; cursor:pointer; }
        .theme .emoji{ font-size:14px; } .theme .label{ font-size:13px; color:var(--muted) }
        @media (max-width:520px){ .theme .label{ display:none } }

        .fc{ display:flex; align-items:center; gap:8px; text-decoration:none; color:inherit; padding:6px 10px; border-radius:10px; background:var(--card); border:1px solid var(--ring); }
        .wc{ display:flex; align-items:center; gap:8px; }
        .addr{ font-variant-numeric:tabular-nums; background:var(--card); border:1px solid var(--ring); padding:6px 10px; border-radius:10px; }

        .card{ background:var(--card); border:1px solid var(--ring); border-radius:16px; padding:18px; margin-top:14px; text-align:center; }
        .card h2{ margin:0 0 8px; font-size:20px; }
        .card p{ margin:0 0 10px; color:var(--muted) }
        .btns{ display:flex; flex-wrap:wrap; gap:10px; margin:8px 0 6px; justify-content:center; }

        .btn{ appearance:none; border:0; background:var(--btn-bg); color:var(--btn-fg); padding:10px 14px; border-radius:12px; font-weight:600; cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; justify-content:center; }
        .btn[disabled]{ opacity:.6; cursor:not-allowed }
        .btn:hover:not([disabled]){ opacity:.92 }

        .foot{ margin-top:18px; display:flex; flex-direction:column; gap:10px; }
        .social{ display:flex; align-items:center; gap:12px; flex-wrap:wrap; justify-content:center; }
        .icon-link{ display:inline-flex; align-items:center; gap:8px; padding:6px 10px; border-radius:10px; background:var(--card); border:1px solid var(--ring); color:inherit; text-decoration:none; }
        .icon-link .label{ display:none; color:inherit; } .icon-link:hover .label{ display:inline; }
        .madeby{ color:var(--muted); margin:0; text-align:center; }
      `}</style>
    </>
  );
}
