// pages/index.js
import Head from "next/head";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { sdk } from "@farcaster/miniapp-sdk";
import { useAccount, useChainId, useBalance } from "wagmi";

const SelfVerificationDialog = dynamic(
  () => import("../components/self/SelfVerificationDialog"),
  { ssr: false }
);

// Bouton de connexion AppKit (client-only)
const AppKitConnect = dynamic(
  () => import("../components/wallets/AppKitConnect"),
  { ssr: false }
);

const BTN = "btn";
const CARD = "card";

const CELO_CHAIN_ID = 42220;               // L1
const CELO_L2_START_LABEL = "25 Mar 2025"; // affichage info L2

export default function Home() {
  // --- Wagmi state ---
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: bal, isLoading: balLoading } = useBalance({
    address,
    chainId: CELO_CHAIN_ID,
    watch: true,
    enabled: Boolean(address),
  });

  // --- UI state ---
  const [theme, setTheme] = useState("auto");
  const [openSelf, setOpenSelf] = useState(false);

  // --- Compteur de transactions L1/L2 ---
  const [txCounts, setTxCounts] = useState({ l1: null, l2: null });
  const [txLoading, setTxLoading] = useState(false);
  const [txError, setTxError] = useState(null);

  // Farcaster Mini App ready
  useEffect(() => { (async () => { try { await sdk.actions.ready(); } catch {} })(); }, []);

  // theme pref
  useEffect(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem("celo-lite-theme");
    if (saved === "light" || saved === "dark" || saved === "auto") setTheme(saved);
  }, []);

  // open self dialog via ?self=1
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get("self") === "1") setOpenSelf(true);
    }
  }, []);

  // appliquer le thème
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

  // charger / mettre en cache compteur L1/L2
  useEffect(() => {
    (async () => {
      if (!address) { setTxCounts({ l1: null, l2: null }); return; }
      try {
        setTxError(null);
        setTxLoading(true);

        const key = `txcounts:${address}`;
        const cached = typeof window !== "undefined" ? localStorage.getItem(key) : null;
        if (cached) {
          const { at, l1, l2 } = JSON.parse(cached);
          if (Date.now() - at < 5 * 60 * 1000) {
            setTxCounts({ l1, l2 });
            setTxLoading(false);
            return;
          }
        }

        const res = await fetch(`/api/txcount?address=${address}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const l1 = data.l1 ?? 0;
        const l2 = data.l2 ?? 0;
        setTxCounts({ l1, l2 });

        if (typeof window !== "undefined") {
          localStorage.setItem(key, JSON.stringify({ at: Date.now(), l1, l2 }));
        }
      } catch (e) {
        console.error(e);
        setTxError(e?.message || "Failed to load transactions");
      } finally {
        setTxLoading(false);
      }
    })();
  }, [address]);

  const short = (a) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "");
  const themeLabel = theme === "auto" ? "Auto" : theme === "light" ? "Light" : "Dark";
  const themeIcon = theme === "auto" ? "A" : theme === "light" ? "☀️" : "🌙";
  const onCelo = chainId === CELO_CHAIN_ID;

  // balance format simple
  const balanceStr = balLoading ? "…" : (bal ? `${(bal.formatted || "").split(".")[0]}.${(bal.formatted || "").split(".")[1]?.slice(0,4) || "0"} ${bal.symbol || "CELO"}` : "…");

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
          {/* ======= HEADER ======= */}
          <header className="topbar">
            <div className="brand">
              <img className="brand-logo" src="/icon.png" alt="Celo Lite" width="36" height="36" />
              <div className="brand-text">
                <h1>Celo Lite</h1>
                <p className="tagline">Ecosystem · Staking · Governance</p>
              </div>
            </div>

            <a className="centerBadge" href="https://www.celopg.eco/" target="_blank" rel="noreferrer" title="CeloPG">
              <img src="/celopg.png" alt="CeloPG" />
            </a>

            <div className="actions">
              {/* AppKit connect / disconnect */}
              <AppKitConnect className="" />

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
            {isConnected ? (
              <>
                <p><b>{short(address)}</b></p>
                <p className={onCelo ? "ok" : "warn"}>
                  chain: {chainId || "-"} {onCelo ? "(celo)" : "(switch to Celo to stake/vote)"}
                </p>
                <p>balance: {balanceStr}</p>

                {/* Compteur L1/L2 */}
                <p>
                  {txLoading
                    ? "transactions: …"
                    : txCounts.l1 == null
                      ? ""
                      : `transactions: ${txCounts.l1} (L1) · ${txCounts.l2} (L2)`}
                </p>
                {txError ? <p className="warn">{txError}</p> : null}
                <p className="hint">L2 counted since {CELO_L2_START_LABEL}.</p>
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
              userAddress={address ?? null}
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

          {/* Footer */}
          <footer className="foot">
            <div className="social">
              {/* ... (inchangé) ... */}
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

        .topbar{ display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:16px; margin-bottom:10px; }
        .brand{ display:flex; align-items:center; gap:10px; }
        .brand-logo{ border-radius:8px; display:block; }
        .brand-text{ line-height:1.1; }
        h1{ font-size:26px; font-weight:800; margin:0; }
        .tagline{ margin:2px 0 0; color:var(--muted); font-size:13px; font-weight:500; }

        .centerBadge{ justify-self:center; display:flex; align-items:center; justify-content:center; width:44px; height:44px; border-radius:12px; background:var(--card); border:1px solid var(--ring); }
        .centerBadge img{ width:26px; height:26px; display:block; }

        .actions{ justify-self:end; display:flex; align-items:center; gap:10px; }
        .pill{ display:inline-flex; align-items:center; gap:8px; height:36px; min-width:136px; padding:0 12px; border-radius:10px; font-size:13px; background:var(--card); border:1px solid var(--ring); color:inherit; }
        .pill .icon{ width:16px; height:16px; display:block; }
        .pill .emoji{ font-size:14px; }

        .wallet-cta{ display:inline-flex; align-items:center; justify-content:center; height:40px; min-width:172px; padding:0 16px; border-radius:12px; font-weight:800; letter-spacing:.1px; background:#fff; color:#0b0b0b; border:1px solid var(--ring); }

        .addr{ font-variant-numeric:tabular-nums; background:var(--card); border:1px solid var(--ring); padding:6px 10px; border-radius:10px; }

        .card{ background:var(--card); border:1px solid var(--ring); border-radius:16px; padding:18px; margin-top:12px; text-align:center; }
        .card h2{ margin:0 0 8px; font-size:20px; }
        .card p{ margin:0 0 10px; color:var(--muted) }
        .btns{ display:flex; flex-wrap:wrap; gap:10px; margin:8px 0 6px; justify-content:center; }

        .btn{ appearance:none; border:0; background:var(--btn-bg); color:var(--btn-fg); padding:10px 14px; border-radius:12px; font-weight:600; cursor:pointer; text-decoration:none; display:inline-flex; align-items:center; justify-content:center; }
        .btn[disabled]{ opacity:.6; cursor:not-allowed }
        .btn:hover:not([disabled]){ opacity:.92 }

        .hint{ margin-top:10px; color:var(--muted) }
        .ok{ color: var(--muted) }
        .warn{ color:#b91c1c; font-weight:600 }

        .foot{ margin-top:16px; display:flex; flex-direction:column; gap:10px; }
        .social{ display:flex; align-items:center; gap:12px; flex-wrap:wrap; justify-content:center; }
        .icon-link{ display:inline-flex; align-items:center; gap:8px; padding:6px 10px; border-radius:10px; background:var(--card); border:1px solid var(--ring); color:inherit; text-decoration:none; }
        .icon-link svg{ display:block; }
        .icon-link .label{ display:none; color:inherit; } .icon-link:hover .label{ display:inline; }
        .madeby{ color:var(--muted); margin:0; text-align:center; }

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
