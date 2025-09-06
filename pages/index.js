import Head from "next/head";
import { useState } from "react";

const BTN = "inline-flex items-center justify-center px-4 py-3 rounded-xl text-base font-medium bg-black text-white";
const LINK = "text-blue-700 underline";

export default function Home() {
  const [tab, setTab] = useState("vote"); // "vote" | "stake"

  return (
    <>
      <Head>
        <title>Celo Lite — Miniapp</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Celo Lite" />
        <meta property="og:description" content="vote & stake" />
        <meta property="og:image" content="/og.png" />
      </Head>

      <main style={{minHeight:"100vh", background:"#F6DF3A"}} className="flex flex-col items-center">
        <div style={{maxWidth: 680}} className="w-full px-5 py-8">
          <header className="flex items-center gap-3 mb-6">
            <img src="/icon.png" alt="icon" width={48} height={48} />
            <h1 className="text-2xl font-bold">Celo Lite</h1>
          </header>

          <div className="flex gap-2 mb-4">
            <button className={`px-4 py-2 rounded-lg border ${tab==="vote" ? "bg-black text-white" : ""}`} onClick={() => setTab("vote")}>Vote</button>
            <button className={`px-4 py-2 rounded-lg border ${tab==="stake" ? "bg-black text-white" : ""}`} onClick={() => setTab("stake")}>Stake CELO</button>
          </div>

          {tab === "vote" && (
            <section className="space-y-4 bg-white rounded-2xl p-5 border">
              <h2 className="text-xl font-semibold">Vote</h2>
              <p className="text-gray-700">open the governance tools directly. choose Mondo or Safe.</p>
              <div className="flex flex-col gap-3">
                <a className={BTN} href="https://mondo.celo.org/" target="_blank" rel="noreferrer">Open Mondo</a>
                <a className={BTN} href="https://app.safe.global/?chain=42220" target="_blank" rel="noreferrer">Open Safe (Gov)</a>
              </div>
              <p className="text-sm text-gray-600">links open in the embedded browser — you’ll use <b>your</b> EVM wallet (not Farcaster Wallet).</p>
            </section>
          )}

          {tab === "stake" && (
            <section className="space-y-4 bg-white rounded-2xl p-5 border">
              <h2 className="text-xl font-semibold">Stake CELO</h2>
              <p className="text-gray-700">stake from your Safe on Celo. use the official Passport guide if needed.</p>
              <div className="flex flex-col gap-3">
                <a className={BTN} href="https://app.safe.global/?chain=42220" target="_blank" rel="noreferrer">Open Safe (Celo)</a>
                <a className={BTN} href="https://pass.celopg.eco/" target="_blank" rel="noreferrer">Guide (Prosperity Passport)</a>
              </div>
              <p className="text-sm text-gray-600">staking via Safe aligns with Passport’s future “staker” badge.</p>
            </section>
          )}

          <footer className="mt-8 text-sm text-gray-700">
            <p>questions or ideas? ping me on farcaster.</p>
            <p className="mt-1">learn more: <a className={LINK} href="https://pass.celopg.eco/" target="_blank" rel="noreferrer">Prosperity Passport</a></p>
          </footer>
        </div>
      </main>

      {/* styles minimes (fallback) */}
      <style jsx global>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: ui-sans-serif, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
        .border { border: 1px solid rgba(0,0,0,.08); }
        .text-gray-700 { color: #374151; }
        .text-gray-600 { color: #4b5563; }
        .text-blue-700 { color: #1d4ed8; }
        .underline { text-decoration: underline; }
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .items-center { align-items: center; }
        .justify-center { justify-content: center; }
        .gap-2 { gap: .5rem; } .gap-3 { gap: .75rem; }
        .w-full { width: 100%; } .px-5 { padding-left:1.25rem; padding-right:1.25rem; }
        .py-8 { padding-top:2rem; padding-bottom:2rem; }
        .mb-4 { margin-bottom:1rem; } .mb-6 { margin-bottom:1.5rem; } .mt-1 { margin-top:.25rem; } .mt-8 { margin-top:2rem; }
        .rounded-xl { border-radius: .75rem; } .rounded-2xl { border-radius: 1rem; } .rounded-lg { border-radius: .5rem; }
        .px-4 { padding-left:1rem; padding-right:1rem; } .py-2 { padding-top:.5rem; padding-bottom:.5rem; }
        .p-5 { padding:1.25rem; }
        .text-base { font-size: 1rem; } .text-2xl { font-size: 1.5rem; font-weight: 700; } .text-xl { font-size: 1.25rem; font-weight: 600; }
        .font-bold { font-weight:700; } .font-semibold { font-weight:600; }
        .bg-white { background:white; } .bg-black { background:black; } .text-white { color:white; }
      `}</style>
    </>
  );
}
