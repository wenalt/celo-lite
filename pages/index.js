// pages/index.js
import Head from "next/head";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { sdk } from "@farcaster/miniapp-sdk";

const SelfVerificationDialog = dynamic(
  () => import("../components/self/SelfVerificationDialog"),
  { ssr: false }
);

const BTN = "btn";
const CARD = "card";

async function getEthereumProviderClass() {
  if (typeof window === "undefined") return null;
  const mod = await import("@walletconnect/ethereum-provider");
  return mod.EthereumProvider;
}

const CELO_CHAIN_ID = 42220;
const CELO_HEX = `0x${CELO_CHAIN_ID.toString(16)}`;

function formatCELO(weiHex) {
  if (!weiHex) return "0";
  try {
    const wei = BigInt(weiHex);
    const whole = wei / 1000000000000000000n;
    const frac = (wei % 1000000000000000000n).toString().padStart(18, "0").slice(0, 4);
    return `${whole}.${frac}`;
  } catch {
    return "0";
  }
}

export default function Home() {
  const [address, setAddress] = useState(null);
  const [wcProvider, setWcProvider] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState(null);

  const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || "138901e6be32b5e78b59aa262e517fd0";

  const [theme, setTheme] = useState("auto");
  const [openSelf, setOpenSelf] = useState(false);

  useEffect(() => { (async () => { try { await sdk.actions.ready(); } catch {} })(); }, []);

  useEffect(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem("celo-lite-theme");
    if (saved === "light" || saved === "dark" || saved === "auto") setTheme(saved);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get("self") === "1") setOpenSelf(true);
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (theme === "light") root.setAttribute("data-theme", "light");
    else if (theme === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    localStorage.setItem("celo-lite-theme", theme);
  }, [theme]);

  function cycleTheme() {
    setTheme((t) => (t === "auto" ? "light" : t === "light" ? "dark" : "auto"));
  }

  async function refreshStatus(p = wcProvider, addr = address) {
    if (!p || !addr) return;
    try {
      const [cid, bal] = await Promise.all([
        p.request({ method: "eth_chainId" }),
        p.request({ method: "eth_getBalance", params: [addr, "latest"] }),
      ]);
      setChainId(cid);
      setBalance(bal);
    } catch (e) {
      console.error(e);
    }
  }

  async function ensureProvider() {
    if (wcProvider) return wcProvider;

    let EthereumProvider;
    try {
      EthereumProvider = await getEthereumProviderClass();
      if (!EthereumProvider) throw new Error("EthereumProvider class missing");
    } catch (e) {
      alert("WalletConnect failed to load. Hard refresh (Ctrl/Cmd+Shift+R) and retry.");
      return null;
    }

    const provider = await EthereumProvider.init({
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

    provider.on("accountsChanged", (accs) => {
      const a = accs?.[0] || null;
      setAddress(a);
      if (a) refreshStatus(provider, a);
      else setBalance(null);
    });

    provider.on("chainChanged", (cid) => {
      setChainId(cid);
      if (address) refreshStatus(provider, address);
    });

    provider.on("disconnect", () => {
      setAddress(null);
      setChainId(null);
      setBalance(null);
    });

    setWcProvider(provider);
    return provider;
  }

  async function connect() {
    const provider = await ensureProvider();
    if (!provider) return;
    try {
      await provider.connect();
      const addr = provider.accounts?.[0] || null;
      setAddress(addr);

      const currentCid = provider.chainId || (await provider.request({ method: "eth_chainId" }));
      setChainId(currentCid);

      if (currentCid !== CELO_HEX) {
        try {
          await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: CELO_HEX }] });
          setChainId(CELO_HEX);
        } catch {
          try {
            await provider.request({
              method: "wallet_addEthereumChain",
              params: [{
                chainId: CELO_HEX,
                chainName: "Celo Mainnet",
                rpcUrls: ["https://forno.celo.org", "https://rpc.ankr.com/celo"],
                nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
                blockExplorerUrls: ["https://celoscan.io/"],
              }],
            });
            setChainId(CELO_HEX);
          } catch {}
        }
      }
      await refreshStatus(provider, addr);
    } catch (e) {
      console.error(e);
    }
  }

  async function disconnect() {
    try { await wcProvider?.disconnect(); } catch {}
    setAddress(null); setChainId(null); setBalance(null);
  }

  const short = (a) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "");
  const themeLabel = theme === "auto" ? "Auto" : theme === "light" ? "Light" : "Dark";
  const themeIcon = theme === "auto" ? "A" : theme === "light" ? "☀️" : "🌙";

  return (
    <>
      <Head>
        <title>Celo Lite — Ecosystem · Staking · Governance</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Celo Lite" />
        <meta property="og:description" content="Ecosystem · Staking · Governance" />
        <meta property="og:image" content="/og.png" />
        <link rel="icon" href="/icon.png" />

        {/* Mini App + Frame embeds */}
        <meta
          name="fc:miniapp"
          content={JSON.stringify({
            version: "1",
            imageUrl: "https://celo-lite.vercel.app/og.png",
            button: {
              title: "Open Celo Lite",
              action: {
                type: "launch_miniapp",
                url: "https://celo-lite.vercel.app",
                name: "Celo Lite",
                splashImageUrl: "https://celo-lite.vercel.app/icon.png",
                splashBackgroundColor: "#F6DF3A",
              },
            },
          })}
        />
        <meta
          name="fc:frame"
          content={JSON.stringify({
            version: "1",
            imageUrl: "https://celo-lite.vercel.app/og.png",
            button: {
              title: "Open Celo Lite",
              action: {
                type: "launch_frame",
                url: "https://celo-lite.vercel.app",
                name: "Celo Lite",
                splashImageUrl: "https://celo-lite.vercel.app/icon.png",
                splashBackgroundColor: "#F6DF3A",
              },
            },
          })}
        />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
      </Head>

      <main className="page">
        <div className="wrap">
          {/* ======= HEADER (new) ======= */}
          <header className="topbar">
            {/* Left: brand */}
            <div className="brand">
              <img className="brand-logo" src="/icon.png" alt="Celo Lite" width="36" height="36" />
              <div className="brand-text">
                <h1>Celo Lite</h1>
                <p className="tagline">Ecosystem · Staking · Governance</p>
              </div>
            </div>

            {/* Center: perfectly centered CeloPG */}
            <a className="centerBadge" href="https://www.celopg.eco/" target="_blank" rel="noreferrer" title="CeloPG">
              <img src="/celopg.png" alt="CeloPG" />
            </a>

            {/* Right: actions pinned far right */}
            <div className="actions">
              {address ? (
                <div className="wallet-inline">
                  <span className="addr">{short(address)}</span>
                  <button className={BTN} onClick={disconnect}>Disconnect</button>
                </div>
              ) : (
                <button className="wallet-cta" onClick={connect} title="Connect wallet">
                  Connect Wallet
                </button>
              )}

              <a className="pill" href="https://warpcast.com/wenaltszn.eth" target="_blank" rel="noreferrer" title="Farcaster profile">
                <img className="icon" src="/farcaster.png" alt="" />
                <span>@wenaltszn.eth</span>
              </a>

              <a className="pill" href="https://github.com/wenalt" target="_blank" rel="noreferrer" title="GitHub">
                <img className="icon" src="/github.svg" alt="" />
                <span>GitHub</span>
              </a>

              <button className="pill" onClick={cycleTheme} title={`Theme: ${themeLabel}`}>
                <span className="emoji">{themeIcon}</span>
                <span>{themeLabel}</span>
              </button>
            </div>
          </header>

          {/* Wallet */}
          <section className={CARD}>
            <h2>Wallet</h2>
            {address ? (
              <>
                <p><b>{short(address)}</b></p>
                <p className={chainId === CELO_HEX ? "ok" : "warn"}>
                  chain: {chainId || "-"} {chainId === CELO_HEX ? "(celo)" : "(switch to Celo to stake/vote)"}
                </p>
                <p>balance: {balance ? `${formatCELO(balance)} CELO` : "…"}</p>
              </>
            ) : (
              <p>Connect to show status.</p>
            )}
          </section>

          {/* Governance */}
          <section className={CARD}>
            <h2>Governance</h2>
            <p>Get voting power by staking on a validator, then participate in proposals.</p>
            <div className="btns">
              <a className={BTN} href="https://mondo.celo.org/" target="_blank" rel="noreferrer">Open Mondo</a>
              <a className={BTN} href="https://mondo.celo.org/governance" target="_blank" rel="noreferrer">Browse Governance</a>
            </div>
            <p className="hint">opens in the embedded browser — you’ll use <b>your</b> EVM wallet.</p>
          </section>

          {/* Prosperity Passport */}
          <section className={CARD}>
            <h2>Prosperity Passport</h2>
            <p>Track your onchain footprint across Celo and unlock recognition.</p>
            <div className="btns">
              <a className={BTN} href="https://pass.celopg.eco/" target="_blank" rel="noreferrer">Open CeloPG</a>
              <button className={BTN} onClick={() => setOpenSelf(true)}>Self.xyz Verification</button>
            </div>
          </section>

          {openSelf && (
            <SelfVerificationDialog
              open={openSelf}
              onClose={() => setOpenSelf(false)}
              userAddress={address}
            />
          )}

          {/* Ecosystem */}
          <section className={CARD}>
            <h2>Ecosystem</h2>
            <p>Explore impact apps on Celo: real-world stable value & climate action.</p>
            <div className="btns">
              <a className={BTN} href="https://www.glodollar.org/" target="_blank" rel="noreferrer" title="USD Glo Dollar">
                USD Glo Dollar
              </a>
              <a className={BTN} href="https://www.regenatlas.xyz/assets/91efab48-decc-46ac-bc7b-c2ec7c272548" target="_blank" rel="noreferrer" title="Retire Eco Credits on Regen Atlas">
                Retire Eco Credits (Regen Atlas)
              </a>
            </div>
          </section>

          {/* Routines */}
          <section className={CARD}>
            <h2>Routines</h2>
            <p>Keep a healthy onchain cadence: learn, earn, and keep reputation active.</p>
            <div className="btns">
              <a className={BTN} href="https://app.layer3.xyz/search?chainIds=42220&types=current_season" target="_blank" rel="noreferrer">Open Layer3</a>
              <a className={BTN} href="https://gooddapp.org/#/claim" target="_blank" rel="noreferrer">Claim $G</a>
            </div>
          </section>

          {/* Builders Programs */}
          <section className={CARD}>
            <h2>Builders Programs</h2>
            <p>Programs that fund and accelerate public-good builders on Celo.</p>
            <div className="btns">
              <a className={BTN} href="https://www.celopg.eco/programs/goodbuilders-round-2" target="_blank" rel="noreferrer">Goodbuilders Round 2</a>
              <a className={BTN} href="https://www.celopg.eco/programs/proof-of-ship-s1" target="_blank" rel="noreferrer">Proof Of Ship</a>
              <a className={BTN} href="https://www.celopg.eco/programs/proof-of-impact-s1" target="_blank" rel="noreferrer">Proof Of Impact</a>
              <a className={BTN} href="https://www.celopg.eco/programs/supportstreams1" target="_blank" rel="noreferrer">Support Streams</a>
            </div>
          </section>

          {/* Footer links (order: X, Support CeloPG, Guild, Self, Discord) */}
          <footer className="foot">
            <div className="social">
              <a className="icon-link" href="https://x.com/Celo" target="_blank" rel="noreferrer" title="@Celo on X">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M17.5 3h3.1l-6.8 7.8L22 21h-6.3l-4.9-6.4L5.1 21H2l7.4-8.6L2 3h6.4l4.4 5.8L17.5 3zm-1.1 16h1.7L7.7 5h-1.7L16.4 19z"/>
                </svg>
                <span>@Celo</span>
              </a>

              <a className="icon-link" href="https://t.me/+3uD9NKPbStYwY2Nk" target="_blank" rel="noreferrer" title="Support CeloPG">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#2AABEE" aria-hidden>
                  <path d="M9.6 16.8l.3-4.3 7.8-7.2c.3-.3-.1-.5-.4-.4L6.9 11.7 2.6 10.3c-.9-.3-.9-.9.2-1.3L20.7 3c.8-.3 1.5.2 1.2 1.5l-2.9 13.6c-.2.9-.8 1.2-1.6.8l-4.4-3.3-2.2 1.2c-.2.1-.4 0-.4-.2z"/>
                </svg>
                <span className="label">Support CeloPG</span>
              </a>

              <a className="icon-link" href="https://guild.xyz/celo-communities" target="_blank" rel="noreferrer" title="Celo's Communities Guild">
                <img src="/guild.jpg" alt="Guild" width="22" height="22" style={{ borderRadius: 6, display: "block" }} />
                <span className="label">Celo's Communities Guild</span>
              </a>

              <a className="icon-link" href="https://t.me/selfxyz" target="_blank" rel="noreferrer" title="Self's support Telegram">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#2AABEE" aria-hidden>
                  <path d="M9.6 16.8l.3-4.3 7.8-7.2c.3-.3-.1-.5-.4-.4L6.9 11.7 2.6 10.3c-.9-.3-.9-.9.2-1.3L20.7 3c.8-.3 1.5.2 1.2 1.5l-2.9 13.6c-.2.9-.8 1.2-1.6.8l-4.4-3.3-2.2 1.2c-.2.1-.4 0-.4-.2z"/>
                </svg>
                <span className="label">Self's support Telegram</span>
              </a>

              <a className="icon-link" href="https://discord.gg/celo" target="_blank" rel="noreferrer" title="Celo Discord">
                <svg width="22" height="22" viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" aria-hidden>
                  <path fill="#5865F2" d="M20.317 4.369A19.9 19.9 0 0 0 16.558 3c-.2.41-.42.94-.66 1.375a18.9 18.9 0 0 0-5.796 0C9.86 3.94 9.64 3.41 9.44 3A19.02 19.02 0 0 0 5.68 4.369C3.258 7.91 2.46 11.34 2.662 14.719A19.67 19.67 0 0 0 8 17c.35-.63.67-1.225 1.1-1.78a7.6 7.6 0 0 1-1.74-.85c.145-.104.287-.213.424-.327 3.343 1.558 6.96 1.558 10.303 0 .138.114.28.223.424.327-.57.33-1.14.62-1.74.85.43.555.75 1.15 1.1 1.78a19.67 19.67 0 0 0 5.338-2.281c.224-3.65-.584-7.08-3.008-10.531ZM9.5 13.5c-.83 0-1.5-.9-1.5-2s.67-2 1.5-2 1.5.9 1.5 2-.67 2-1.5 2Zm5 0c-.83 0-1.5-.9-1.5-2s.67-2 1.5-2 1.5.9 1.5 2-.67 2-1.5 2Z"/>
                </svg>
                <span className="label">Discord</span>
              </a>
            </div>

            <p className="madeby">Questions or suggestions? ping me on farcaster or join the Prosperity Passport support Telegram channel</p>
          </footer>
        </div>
      </main>

      <style jsx global>{`
        :root{
          --bg:#F6DF3A; --text:#0b0b0b; --muted:#4b5563; --ring:rgba(0,0,0,.08);
          --card:#ffffff; --btn-bg:#0b0b0b; --btn-fg:#ffffff;
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
        .wrap{ width:100%; max-width:900px; margin:0 auto; padding:22px 16px; }

        /* ===== Header ===== */
        .topbar{
          display:grid;
          grid-template-columns: auto 1fr auto; /* brand | center | actions */
          align-items:center;
          gap:16px;
          margin-bottom:10px;
        }
        .brand{ display:flex; align-items:center; gap:10px; }
        .brand-logo{ border-radius:8px; display:block; }
        .brand-text{ line-height:1.1; }
        h1{ font-size:26px; font-weight:800; margin:0; }
        .tagline{ margin:2px 0 0; color:var(--muted); font-size:13px; font-weight:500; }

        /* Centered badge */
        .centerBadge{
          justify-self:center;
          display:flex; align-items:center; justify-content:center;
          width:44px; height:44px; border-radius:12px;
          background:var(--card); border:1px solid var(--ring);
        }
        .centerBadge img{ width:26px; height:26px; display:block; }

        /* Actions pinned right */
        .actions{ justify-self:end; display:flex; align-items:center; gap:10px; }
        .pill{
          display:inline-flex; align-items:center; gap:8px;
          height:36px; min-width:136px; padding:0 12px;
          border-radius:10px; font-size:13px;
          background:var(--card); border:1px solid var(--ring); color:inherit;
        }
        .pill .icon{ width:16px; height:16px; display:block; }
        .pill .emoji{ font-size:14px; }

        /* Special, bigger white CTA */
        .wallet-cta{
          display:inline-flex; align-items:center; justify-content:center;
          height:40px; min-width:172px; padding:0 16px;
          border-radius:12px; font-weight:800; letter-spacing:.1px;
          background:#fff; color:#0b0b0b; border:1px solid var(--ring);
        }

        .wallet-inline{ display:flex; align-items:center; gap:8px; }
        .addr{ font-variant-numeric:tabular-nums; background:var(--card); border:1px solid var(--ring); padding:6px 10px; border-radius:10px; }

        /* Cards */
        .card{ background:var(--card); border:1px solid var(--ring); border-radius:16px; padding:18px; margin-top:12px; text-align:center; }
        .card h2{ margin:0 0 8px; font-size:20px; }
        .card p{ margin:0 0 10px; color:var(--muted) }
        .btns{ display:flex; flex-wrap:wrap; gap:10px; margin:8px 0 6px; justify-content:center; }

        .btn{
          appearance:none; border:0; background:var(--btn-bg); color:var(--btn-fg);
          padding:10px 14px; border-radius:12px; font-weight:600; cursor:pointer;
          text-decoration:none; display:inline-flex; align-items:center; justify-content:center;
        }
        .btn[disabled]{ opacity:.6; cursor:not-allowed }
        .btn:hover:not([disabled]){ opacity:.92 }

        .hint{ margin-top:10px; color:var(--muted) }
        .ok{ color: var(--muted) }
        .warn{ color:#b91c1c; font-weight:600 }

        /* Footer */
        .foot{ margin-top:16px; display:flex; flex-direction:column; gap:10px; }
        .social{ display:flex; align-items:center; gap:12px; flex-wrap:wrap; justify-content:center; }
        .icon-link{ display:inline-flex; align-items:center; gap:8px; padding:6px 10px; border-radius:10px; background:var(--card); border:1px solid var(--ring); color:inherit; text-decoration:none; }
        .icon-link svg{ display:block; } /* fix discord squish */
        .icon-link .label{ display:none; color:inherit; } .icon-link:hover .label{ display:inline; }
        .madeby{ color:var(--muted); margin:0; text-align:center; }

        /* Mobile layout */
        @media (max-width:640px){
          .topbar{
            grid-template-columns: 1fr 1fr;
            grid-template-areas:
              "brand actions"
              "badge badge";
            row-gap:8px;
          }
          .brand{ grid-area: brand; }
          .actions{ grid-area: actions; justify-self:end; gap:8px; }
          .centerBadge{ grid-area: badge; justify-self:center; margin-top:2px; }
          h1{ font-size:22px; }
          .tagline{ font-size:12px; }
          .pill{ min-width:auto; padding:0 10px; }
          .wallet-cta{ min-width:auto; padding:0 12px; }
        }
      `}</style>
    </>
  );
}
