// components/BadgesSection.js
import React, { useMemo, useState } from "react";

/**
 * Minimal, framework-safe version.
 * - No styled-jsx
 * - No next/image (plain <img/>)
 * - Centered layout, uses global `.btn` for black buttons
 * - Simple centered modal
 */

const BADGES = [
  {
    id: "usdglo",
    title: "USD Glo Dollar",
    chain: "Celo",
    image: "/badges/badgeusdglo.png",
    summary: "Hold USDGLO on Celo to progress through simple time-based tiers.",
    why:
      "Glo Dollar links stable value with real-world impact. Holding a small amount on Celo helps users experience a mission-aligned stable asset while building a basic onchain footprint.",
    how: [
      "Get USDGLO on Celo (from a supported venue).",
      "Hold the token in your wallet—no need to stake or lock.",
      "Tiers unlock automatically after the required time windows.",
    ],
    tiers: [
      { label: "Held > $1 USDGLO for more than 1 day" },
      { label: "Held > $10 USDGLO for more than 7 days" },
      { label: "Held > $100 USDGLO for more than 28 days" },
      { label: "Held > $1000 USDGLO for more than 28 days" },
      { label: "Held > $5000 USDGLO for more than 28 days" },
    ],
    external: [
      { label: "Open Glo Dollar", href: "https://www.glodollar.org/" },
      { label: "Open CeloPG", href: "https://celopg.eco" },
    ],
  },

  // NEW — Eco Credit Retirement (Regen Atlas)
  {
    id: "eco-credit-retirement",
    title: "Eco Credit Retirement",
    chain: "Celo",
    image: "/badges/badgeecr.png",
    summary:
      "Retire Eco Credits on Celo via Regen Atlas. Purchases are retired (burned) permanently.",
    why:
      "Retiring Eco Credits funds verified climate action and permanently burns those credits. ⚠️ This is irreversible: you buy credits with money and retire them to offset impact; they cannot be ‘un-retired’.",
    how: [
      "Open a supported Eco Credit pool on Regen Atlas.",
      "Connect your EVM wallet on Celo.",
      "Choose the quantity to retire and confirm the transaction.",
      "Wait for confirmation; your retirement receipt will be visible in-app/explorer.",
    ],
    tiers: [
      { label: "Retire 1 Eco Credits" },
      { label: "Retire 10 Eco Credits" },
      { label: "Retire 50 Eco Credits" },
      { label: "Retire 250 Eco Credits" },
      { label: "Retire 1000 Eco Credits" },
    ],
    external: [
      {
        label: "Regen Atlas — Pool A",
        href: "https://www.regenatlas.xyz/assets/91efab48-decc-46ac-bc7b-c2ec7c272548",
      },
      {
        label: "Regen Atlas — Pool B",
        href: "https://www.regenatlas.xyz/assets/d4a3e607-7bd5-49b0-a4ef-4715c2fe65d4",
      },
    ],
  },

  // NEW — Self verification (Self Protocol)
  {
    id: "self-verification",
    title: "Self verification",
    chain: "Celo",
    image: "/badges/badgeself.png", // ou "/badges/badgeselff.png"
    summary: "Verify your uniqueness with the Self Protocol (privacy-preserving).",
    why:
      "Self uses zero-knowledge proofs to attest your uniqueness (and optionally your country) without exposing private data. This helps the ecosystem limit spam and strengthen on-chain reputation.",
    how: [
      "Install the Self app on your phone (Android/iOS).",
      "In Celo Lite → Prosperity Passport, scan the QR to link your wallet.",
      "Follow the flow in Self (liveness + optional country attestation).",
      "Once validated, use “Self.xyz Verification” in Celo Lite.",
    ],
    tiers: [{ label: "Verify your Country via Self" }],
    external: [
      {
        label: "Self on Android",
        href: "https://play.google.com/store/apps/details?id=com.proofofpassportapp",
      },
      {
        label: "Self on iOS",
        href: "https://apps.apple.com/fr/app/self-zk-passport-identity/id6478563710",
      },
    ],
  },

  // NEW — Celo Voter
  {
    id: "celo-voter",
    title: "Celo Voter",
    chain: "Celo",
    image: "/badges/celovoterbadge.png",
    summary: "Vote on on-chain governance proposals via Mondo.",
    why:
      "Voting steers protocol parameters and treasury. Casting votes with locked/staked CELO builds a credible on-chain civic footprint and helps align the network with its community.",
    how: [
      "Open the governance portal (Mondo) and connect your wallet on Celo Mainnet.",
      "Ensure you have voting power (lock/stake CELO on a validator via Mondo).",
      "Pick an active proposal, review details, choose For / Against / Abstain.",
      "Submit the vote and sign the transaction. Your vote will appear on the proposal page/explorer.",
    ],
    tiers: [
      { label: "Vote on 1 Celo Proposal" },
      { label: "Vote on 5 Celo Proposal" },
      { label: "Vote on 15 Celo Proposal" },
      { label: "Vote on 30 Celo Proposal" },
    ],
    external: [
      { label: "Open Mondo Governance", href: "https://mondo.celo.org/governance" },
    ],
  },
];




export default function BadgesSection() {
  const data = useMemo(() => BADGES, []);
  const [openId, setOpenId] = useState(null);
  const openSpec = useMemo(
    () => data.find((b) => b.id === openId) || null,
    [data, openId]
  );

  const wrap = {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
  };

  const item = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    flexWrap: "wrap",
  };

  const imgStyle = { borderRadius: 12, width: 64, height: 64, objectFit: "cover" };
  const name = { margin: 0, fontSize: 16, fontWeight: 800 };
  const chip = {
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 8px",
    borderRadius: 999,
    border: "1px solid var(--ring)",
    background: "var(--card)",
    fontSize: 12,
    marginLeft: 8,
  };
  const summary = { margin: "4px 0 0", color: "var(--muted)", fontSize: 14, textAlign: "center" };
  const actions = { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 8 };

  const modalRoot = {
    position: "fixed",
    inset: 0,
    zIndex: 80,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  };
  const backdrop = { position: "absolute", inset: 0, background: "rgba(0,0,0,.42)" };
  const dialog = {
    position: "relative",
    width: "100%",
    maxWidth: 680,
    background: "var(--card)",
    border: "1px solid var(--ring)",
    borderRadius: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,.3)",
  };
  const dhead = { display: "flex", alignItems: "center", gap: 10, padding: "14px 16px 0" };
  const dtitle = { margin: 0, fontSize: 18, fontWeight: 800 };
  const closeBtn = { marginLeft: "auto", background: "transparent", border: 0, fontSize: 24, lineHeight: 1, cursor: "pointer", color: "inherit" };
  const dbody = { padding: "12px 16px 16px", fontSize: 15, lineHeight: 1.55 };
  const meta = { color: "var(--muted)", fontSize: 13 };

  return (
    <div style={wrap}>
      {data.map((b) => (
        <div key={b.id} style={item}>
          <img src={b.image} alt={b.title} style={imgStyle} />
          <div style={{ maxWidth: 640 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <h3 style={name}>{b.title}</h3>
              <span style={chip}>{b.chain}</span>
            </div>
            <p style={summary}>{b.summary}</p>
            <div style={actions}>
              <button className="btn" onClick={() => setOpenId(b.id)}>Details</button>
              {b.external?.map((x) => (
                <a key={x.href} className="btn" href={x.href} target="_blank" rel="noreferrer">
                  {x.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      ))}

      {openSpec && (
        <div style={modalRoot} role="dialog" aria-modal="true">
          <div style={backdrop} onClick={() => setOpenId(null)} />
          <div style={dialog}>
            <div style={dhead}>
              <img src={openSpec.image} alt="" width={28} height={28} style={{ borderRadius: 8 }} />
              <h4 style={dtitle}>{openSpec.title}</h4>
              <button style={closeBtn} onClick={() => setOpenId(null)} aria-label="Close">×</button>
            </div>
            <div style={dbody}>
              <div style={meta}>Chain: {openSpec.chain}</div>
              <section>
                <h5 style={{ margin: "12px 0 6px", fontSize: 15 }}>Why it matters</h5>
                <p style={{ margin: 0 }}>{openSpec.why}</p>
              </section>
              <section>
                <h5 style={{ margin: "12px 0 6px", fontSize: 15 }}>How to progress</h5>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {openSpec.how.map((li, i) => <li key={i}>{li}</li>)}
                </ul>
              </section>
              {openSpec.tiers && (
                <section>
                  <h5 style={{ margin: "12px 0 6px", fontSize: 15 }}>Tiers</h5>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {openSpec.tiers.map((t, i) => (
                      <li key={i} style={{ display: "flex", alignItems: "center", gap: 8, margin: "6px 0" }}>
                        <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: 999, background: "currentColor", opacity: .75 }} />
                        <span>{t.label}{t.hint ? <span style={{ color: "var(--muted)", fontSize: 12 }}> – {t.hint}</span> : null}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {openSpec.external && openSpec.external.length > 0 && (
                <section>
                  <h5 style={{ margin: "12px 0 6px", fontSize: 15 }}>Links</h5>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                    {openSpec.external.map((x) => (
                      <a key={x.href} className="btn" href={x.href} target="_blank" rel="noreferrer">{x.label}</a>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
