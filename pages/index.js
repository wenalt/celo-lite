// pages/index.js
import Head from "next/head";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// dialog Self en client-only
const SelfVerificationDialog = dynamic(
  () => import("../components/self/SelfVerificationDialog"),
  { ssr: false }
);

const BTN = "btn";
const CARD = "card";

// charge la classe EthereumProvider depuis le package npm (client-only)
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

  const projectId =
    process.env.NEXT_PUBLIC_WC_PROJECT_ID ||
    "138901e6be32b5e78b59aa262e517fd0";

  // 👉 Light par défaut (mais on respecte la préférence sauvegardée s’il y en a une)
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    const saved = localStorage.getItem("celo-lite-theme");
    return saved === "light" || saved === "dark" || saved === "auto" ? saved : "light";
  });

  const [openSelf, setOpenSelf] = useState(false);

  // auto-ouvrir le modal si l’URL contient ?self=1
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get("self") === "1") setOpenSelf(true);
    }
  }, []);

  // applique le thème (light par défaut) + persistance
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
      console.warn("Failed to import @walletconnect/ethereum-provider", e);
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
        url:
          typeof location !== "undefined"
            ? location.origin
            : "https://celo-lite.vercel.app",
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

      const currentCid =
        provider.chainId || (await provider.request({ method: "eth_chainId" }));
      setChainId(currentCid);

      if (currentCid !== CELO_HEX) {
        try {
          await provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: CELO_HEX }],
          });
          setChainId(CELO_HEX);
        } catch {
          try {
            await provider.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: CELO_HEX,
                  chainName: "Celo Mainnet",
                  rpcUrls: ["https://forno.celo.org", "https://rpc.ankr.com/celo"],
                  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
                  blockExplorerUrls: ["https://celoscan.io/"],
                },
              ],
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
    try {
      await wcProvider?.disconnect();
    } catch {}
    setAddress(null);
    setChainId(null);
    setBalance(null);
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

        {/* Inter */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

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
              {/* thème */}
              <button className="theme" onClick={cycleTheme} title={`Theme: ${themeLabel}`}>
                <span className="emoji">{themeIcon}</span>
                <span className="label">{themeLabel}</span>
              </button>

              {/* Farcaster */}
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

              {/* GitHub */}
              <a
                className="fc"
                href="https://github.com/wenalt"
                target="_blank"
                rel="noreferrer"
                title="GitHub profile"
              >
                <img src="/github.svg" alt="GitHub" width="22" height="22" />
                <span>GitHub</span>
              </a>

              {/* Wallet */}
              <div className="wc">
                {address ? (
                  <>
                    <span className="addr">{short(address)}</span>
                    <button className={BTN} onClick={disconnect}>
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button className={BTN} onClick={connect}>
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* CeloPG au centre, si tu l'utilises */}
          <div className="celopg-banner">
            <a href="https://www.celopg.eco/" target="_blank" rel="noreferrer" title="CeloPG">
              <img src="/celopg.png" alt="CeloPG" width="36" height="36" />
            </a>
          </div>

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

          {/* Dialog Self */}
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
              <a
                className={BTN}
                href="https://www.regenatlas.xyz/assets/91efab48-decc-46ac-bc7b-c2ec7c272548"
                target="_blank"
                rel="noreferrer"
                title="Retire Eco Credits on Regen Atlas"
              >
                Retire Eco Credits (Regen Atlas)
              </a>
            </div>
          </section>

          {/* Routines */}
          <section className={CARD}>
            <h2>Routines</h2>
            <p>Keep a healthy onchain cadence: learn, earn, and keep reputation active.</p>
            <div className="btns">
              <a className={BTN} href="https://app.layer3.xyz/search?chainIds=42220&types=current_season" target="_blank" rel="noreferrer">
                Open Layer3
              </a>
              <a className={BTN} href="https://gooddapp.org/#/claim" target="_blank" rel="noreferrer">
                Claim $G
              </a>
            </div>
          </section>

          {/* Builders Programs */}
          <section className={CARD}>
            <h2>Builders Programs</h2>
            <div className="btns">
              <a className={BTN} href="https://www.celopg.eco/programs/goodbuilders-round-2" target="_blank" rel="noreferrer">Goodbuilders Round 2</a>
              <a className={BTN} href="https://www.celopg.eco/programs/proof-of-ship-s1" target="_blank" rel="noreferrer">Proof Of Ship</a>
              <a className={BTN} href="https://www.celopg.eco/programs/proof-of-impact-s1" target="_blank" rel="noreferrer">Proof Of Impact</a>
              <a className={BTN} href="https://www.celopg.eco/programs/supportstreams1" target="_blank" rel="noreferrer">Support Streams</a>
            </div>
          </section>

          {/* Footer social (ordre: X, Support CeloPG, Guild, Self, Discord) */}
          <footer className="foot">
            <div className="social">
              <a className="icon-link" href="https://x.com/Celo" target="_blank" rel="noreferrer" title="@Celo on X">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M17.5 3h3.1l-6.8 7.8L22 21h-6.3l-4.9-6.4L5.1 21H2l7.4-8.6L2 3h6.4l4.4 5.8L17.5 3zm-1.1 16h1.7L7.7 5h-1.7L16.4 19z"/>
                </svg>
                <span className="label">X</span>
              </a>

              <a className="icon-link" href="https://t.me/+3uD9NKPbStYwY2Nk" target="_blank" rel="noreferrer" title="Support CeloPG">
                <img src="/telegram.svg" alt="" width="22" height="22" />
                <span className="label">Support CeloPG</span>
              </a>

              <a className="icon-link" href="https://guild.xyz/celo-communities" target="_blank" rel="noreferrer" title="Celo's Communities Guild">
                <img src="/guild.jpg" alt="" width="22" height="22" />
                <span className="label">Guild</span>
              </a>

              <a className="icon-link" href="https://t.me/selfxyz" target="_blank" rel="noreferrer" title="Self's support Telegram">
                <img src="/telegram.svg" alt="" width="22" height="22" />
                <span className="label">Self support</span>
              </a>

              <a className="icon-link" href="https://discord.gg/celo" target="_blank" rel="noreferrer" title="Celo Discord">
                <img src="/discord.svg" alt="" width="22" height="22" />
                <span className="label">Discord</span>
              </a>
            </div>

            <p className="madeby">
              Questions or suggestions? ping me on Farcaster or join the Prosperity Passport support Telegram channel
            </p>
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
        .wrap{ width:100%; max-width:820px; margin:0 auto; padding:32px 20px; }

        .head{ display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:8px; }
        .brand{ display:flex; align-items:center; gap:12px; }
        h1{ font-size:28px; font-weight:700; line-height:1.1; margin:0 }
        .tagline{ margin:2px 0 0; color:var(--muted) }
        .right{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; }

        /* ✅ centrage mobile SEULEMENT (sans toucher desktop) */
        @media (max-width:640px){
          .head{ flex-direction:column; align-items:center; }
          .brand{ justify-content:center; text-align:center; }
          .right{ justify-content:center; width:100%; }
        }

        .celopg-banner{ display:flex; justify-content:center; margin:6px 0 10px; }

        .fc{ display:flex; align-items:center; gap:8px; text-decoration:none; color:inherit; padding:6px 10px; border-radius:10px; background:var(--card); border:1px solid var(--ring); }
        .wc{ display:flex; align-items:center; gap:8px; }
        .addr{ font-variant-numeric:tabular-nums; background:var(--card); border:1px solid var(--ring); padding:6px 10px; border-radius:10px; }

        .theme{ display:inline-flex; align-items:center; gap:8px; padding:6px 10px; border-radius:10px; background:var(--card); border:1px solid var(--ring); color:inherit; cursor:pointer; }
        .theme .emoji{ font-size:14px; } .theme .label{ font-size:13px; color:var(--muted) }
        @media (max-width:520px){ .theme .label{ display:none } }

        .card{ background:var(--card); border:1px solid var(--ring); border-radius:16px; padding:18px; margin-top:14px; text-align:center; }
        .card h2{ margin:0 0 8px; font-size:20px; }
        .card p{ margin:0 0 10px; color:var(--muted) }
        .btns{ display:flex; flex-wrap:wrap; gap:10px; margin:8px 0 6px; justify-content:center; }

        .btn{ appearance:none; border:0; background:var(--btn-bg); color:var(--btn-fg);
              padding:10px 14px; border-radius:12px; font-weight:600; cursor:pointer;
              text-decoration:none; display:inline-flex; align-items:center; justify-content:center; }
        .btn[disabled]{ opacity:.6; cursor:not-allowed }
        .btn:hover:not([disabled]){ opacity:.92 }

        .hint{ margin-top:10px; color:var(--muted) }
        .ok{ color: var(--muted) }
        .warn{ color:#b91c1c; font-weight:600 }

        .foot{ margin-top:18px; display:flex; flex-direction:column; gap:10px; }
        .social{ display:flex; align-items:center; gap:12px; flex-wrap:wrap; justify-content:center; }
        .icon-link{ display:inline-flex; align-items:center; gap:8px; padding:6px 10px; border-radius:10px; background:var(--card); border:1px solid var(--ring); color:inherit; text-decoration:none; }
        .icon-link .label{ display:none; color:inherit; } .icon-link:hover .label{ display:inline; }
        .madeby{ color:var(--muted); margin:0; text-align:center; }
      `}</style>
    </>
  );
}
