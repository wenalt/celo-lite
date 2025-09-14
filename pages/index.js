// pages/index.js
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { sdk } from "@farcaster/miniapp-sdk";
import { ethers } from "ethers";

// wagmi (AppKit)
import { useAccount, useChainId, useBalance, useWalletClient } from "wagmi";

// bouton AppKit (ton composant)
import AppKitConnect from "../components/wallets/AppKitConnect";

// ABI DailyCheckin
import DailyCheckinABI from "../abi/DailyCheckin.json";

const SelfVerificationDialog = dynamic(
  () => import("../components/self/SelfVerificationDialog"),
  { ssr: false }
);

const BTN = "btn";
const CARD = "card";

const CELO_CHAIN_ID = 42220;
const CELO_L2_START_LABEL = "25 Mar 2025";

// NEW: Saison 1 (Prosperity Passport)
const S1_START_LABEL = "23 Aug 2025";

const CHECKIN_ADDR =
  process.env.NEXT_PUBLIC_CHECKIN_ADDRESS ||
  "0x8C654199617927a1F8218023D9c5bec42605a451";

// --- utils ---
function formatSecs(s) {
  const n = Number(s || 0);
  if (n <= 0) return "ready";
  const h = Math.floor(n / 3600);
  const m = Math.floor((n % 3600) / 60);
  const sec = n % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}
const short = (a) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "");

// BrowserProvider helper (wagmi walletClient -> ethers signer)
async function getEthersSigner(walletClient) {
  let eip1193 = null;

  // 1) priorité à l’injected (Rabby/MetaMask desktop)
  if (typeof window !== "undefined" && window.ethereum) eip1193 = window.ethereum;

  // 2) fallback : transport wagmi (WalletConnect via AppKit, Farcaster Wallet, etc.)
  if (!eip1193 && walletClient?.transport) eip1193 = walletClient.transport;

  if (!eip1193 || typeof eip1193.request !== "function") {
    throw new Error("No EIP-1193 provider available");
  }
  const bp = new ethers.BrowserProvider(eip1193);
  return await bp.getSigner();
}

export default function Home() {
  // --- connection (wagmi/AppKit) ---
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();

  // CELO balance (on interroge directement la chain 42220)
  const { data: celoBalance } = useBalance({
    address,
    chainId: CELO_CHAIN_ID,
    query: { enabled: !!address },
    watch: true,
  });

  // thème & self modal
  const [theme, setTheme] = useState("auto");
  const [openSelf, setOpenSelf] = useState(false);

  // compteur tx L1/L2/S1 (via /api/txcount)
  const [txCounts, setTxCounts] = useState({ l1: null, l2: null, s1: null });
  const [txLoading, setTxLoading] = useState(false);
  const [txError, setTxError] = useState(null);

  // daily check-in state
  const [ciCount, setCiCount] = useState(null);
  const [ciLast, setCiLast] = useState(null);
  const [ciLeft, setCiLeft] = useState(null);
  const [ciBusy, setCiBusy] = useState(false);
  const [ciError, setCiError] = useState(null);

  // ready() Mini App
  useEffect(() => { (async () => { try { await sdk.actions.ready(); } catch {} })(); }, []);

  // thème persisted
  useEffect(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem("celo-lite-theme");
    if (saved === "light" || saved === "dark" || saved === "auto") setTheme(saved);
  }, []);
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (theme === "light") root.setAttribute("data-theme", "light");
    else if (theme === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    localStorage.setItem("celo-lite-theme", theme);
  }, [theme]);
  const themeLabel = theme === "auto" ? "Auto" : theme === "light" ? "Light" : "Dark";
  const themeIcon = theme === "auto" ? "A" : theme === "light" ? "☀️" : "🌙";
  function cycleTheme() {
    setTheme((t) => (t === "auto" ? "light" : t === "light" ? "dark" : "auto"));
  }

  // open self modal via ?self=1
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get("self") === "1") setOpenSelf(true);
    }
  }, []);

  // fetch tx L1/L2/S1 when address changes (cache 5 min)
  useEffect(() => {
    (async () => {
      if (!address) { setTxCounts({ l1: null, l2: null, s1: null }); return; }
      try {
        setTxError(null);
        setTxLoading(true);

        const key = `txcounts:v2:${address}`; // v2 => cache bust for S1 support
        const cached = typeof window !== "undefined" ? localStorage.getItem(key) : null;
        if (cached) {
          const { at, l1, l2, s1 } = JSON.parse(cached);
          if (Date.now() - at < 5 * 60 * 1000) {
            setTxCounts({ l1, l2, s1 });
            setTxLoading(false);
            return;
          }
        }

        const res = await fetch(`/api/txcount?address=${address}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const l1 = data.l1 ?? 0;
        const l2 = data.l2 ?? 0;
        const s1 = data.s1 ?? 0; // NEW

        setTxCounts({ l1, l2, s1 });

        if (typeof window !== "undefined") {
          localStorage.setItem(key, JSON.stringify({ at: Date.now(), l1, l2, s1 }));
        }
      } catch (e) {
        console.error(e);
        setTxError(e?.message || "Failed to load transactions");
      } finally {
        setTxLoading(false);
      }
    })();
  }, [address]);

  // read check-in state (only on Celo)
  const isOnCelo = chainId === CELO_CHAIN_ID;
  const canUseCheckin = isConnected && isOnCelo && CHECKIN_ADDR;

  async function loadCheckin() {
    if (!address || !walletClient) return;
    if (!isOnCelo) {
      setCiError("Switch to Celo to use check-in.");
      setCiCount(null); setCiLast(null); setCiLeft(null);
      return;
    }
    try {
      setCiError(null);
      const signer = await getEthersSigner(walletClient);
      const c = new ethers.Contract(CHECKIN_ADDR, DailyCheckinABI, signer);
      const [cnt, last, left] = await Promise.all([
        c.checkinCount(address),
        c.lastCheckin(address),
        c.timeUntilNext(address),
      ]);
      setCiCount(Number(cnt));
      setCiLast(Number(last));
      setCiLeft(Number(left));
    } catch (e) {
      console.error(e);
      setCiError("Failed to read check-in.");
    }
  }

  useEffect(() => {
    if (address && walletClient) loadCheckin();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, walletClient, isOnCelo]);

  // write: check-in (user-pays)
  async function doCheckin() {
    try {
      setCiBusy(true); setCiError(null);
      if (!isOnCelo) {
        // on propose un switch “doux” via EIP-1193 si possible
        try {
          const req = (walletClient?.transport?.request) || (typeof window !== "undefined" && window.ethereum?.request);
          if (req) {
            await req({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0xa4ec" /* 42220 */ }],
            });
          }
        } catch (e) {
          setCiBusy(false);
          setCiError("Please switch to Celo Mainnet.");
          return;
        }
      }
      const signer = await getEthersSigner(walletClient);
      const c = new ethers.Contract(CHECKIN_ADDR, DailyCheckinABI, signer);

      const left = await c.timeUntilNext(address);
      if (Number(left) > 0) {
        setCiBusy(false);
        setCiLeft(Number(left));
        setCiError("Cooldown active.");
        return;
      }

      const tx = await c.checkIn();
      await tx.wait();
      await loadCheckin();
    } catch (e) {
      console.error(e);
      setCiError(e?.message || "Check-in failed.");
    } finally {
      setCiBusy(false);
    }
  }

  const celoBalanceText = useMemo(() => {
    if (!celoBalance) return "…";
    return `${Number(celoBalance.formatted).toFixed(4)} ${celoBalance.symbol || "CELO"}`;
  }, [celoBalance]);

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
              {/* AppKit connect (Rabby/Farcaster/MM, etc.) */}
              <AppKitConnect />

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
                <p className={isOnCelo ? "ok" : "warn"}>
                  chain: {chainId ?? "-"} {isOnCelo ? "(celo)" : "(switch to Celo to stake/vote)"}
                </p>
                <p>balance: {celoBalanceText}</p>

                {/* transactions L1/L2/S1 */}
                <p>
                  {txLoading
                    ? "transactions: …"
                    : txCounts.l1 == null
                      ? ""
                      : `transactions: ${txCounts.l1} (L1) · ${txCounts.l2} (L2) · ${txCounts.s1 ?? 0} (S1)`}
                </p>
                {txError ? <p className="warn">{txError}</p> : null}
                <p className="hint">
                  L2 counted since {CELO_L2_START_LABEL}. S1 since {S1_START_LABEL}.
                </p>

                {/* Daily check-in */}
                {CHECKIN_ADDR ? (
                  <div style={{ marginTop: 12, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                    <button
                      className={BTN}
                      onClick={doCheckin}
                      disabled={ciBusy || !isOnCelo || Number(ciLeft || 0) > 0}
                      title={
                        !isOnCelo
                          ? "Switch to Celo to use check-in"
                          : Number(ciLeft || 0) > 0
                          ? `Cooldown: ${formatSecs(ciLeft)}`
                          : "Daily check-in"
                      }
                    >
                      {ciBusy ? "Checking-in…" : "Daily check-in"}
                    </button>
                    <div style={{ fontSize: 13, color: "var(--muted)", alignSelf: "center" }}>
                      {ciError
                        ? <span style={{ color: "#b91c1c", fontWeight: 600 }}>{ciError}</span>
                        : <>total: {ciCount ?? "…"} · next: {ciLeft == null ? "…" : formatSecs(ciLeft)}</>
                      }
                    </div>
                  </div>
                ) : null}
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

          {/* Footer */}
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
                  <path fill="#5865F2" d="M20.317 4.369A19.9 19.9 0 0 0 16.558 3c-.2.41-.42.94-.66 1.375a18.9 18.9 0 0 0-5.796 0C9.86 3.94 9.64 3.41 9.44 3A19.02 19.02 0 0 0 5.68 4.369C3.258 7.91 2.46 11.34 2.662 14.719A19.67 19.67 0 0 0 8 17c.35-.63.67-1.225 1.1-1.78a7.6 7.6 0 0 1-1.74-.85c.145-.104.287-.213.424-.327 3.343 1.558 6.96 1.558 10.303 0 .138.114.28.223.424.327-.57.33-1.14.62-1.74.85.43.555.75 1.15 1.1 1.78a19.67 19.67 0 0 0 5.338-2.281c-.224-3.65-.584-7.08-3.008-10.531ZM9.5 13.5c-.83 0-1.5-.9-1.5-2s.67-2 1.5-2 1.5.9 1.5 2-.67 2-1.5 2Zm5 0c-.83 0-1.5-.9-1.5-2s.67-2 1.5-2 1.5.9 1.5 2-.67 2-1.5 2Z"/>
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
        }
      `}</style>
    </>
  );
}
