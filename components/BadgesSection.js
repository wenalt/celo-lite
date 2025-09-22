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
      { label: "Regen Atlas — Pool A", href: "https://www.regenatlas.xyz/assets/91efab48-decc-46ac-bc7b-c2ec7c272548" },
      { label: "Regen Atlas — Pool B", href: "https://www.regenatlas.xyz/assets/d4a3e607-7bd5-49b0-a4ef-4715c2fe65d4" },
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
      { label: "Self on Android", href: "https://play.google.com/store/apps/details?id=com.proofofpassportapp" },
      { label: "Self on iOS", href: "https://apps.apple.com/fr/app/self-zk-passport-identity/id6478563710" },
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

  // NEW — Community Guild Member
  {
    id: "community-guild-member",
    title: "Community Guild Member",
    chain: "Celo",
    image: "/badges/comgmember.png",
    summary:
      "Earn Discord roles in the Celo Communities Guild through organic participation.",
    why:
      "Guild roles reflect real community engagement (helping others, sharing updates, joining calls). Earning roles builds reputation and connects you with builders and programs across the Celo ecosystem.",
    how: [
      "Open the Celo Communities Guild and connect your Discord account.",
      "Join the Celo Discord and participate organically (help, updates, events).",
      "Complete the role requirements listed in Guild to level up.",
      "Claim your role in Guild once criteria are met.",
    ],
    tiers: [
      { label: "Beginner Celorian" },
      { label: "Adventurer Celorian" },
      { label: "Vanguard Celorian" },
      { label: "Pioneer Celorian" },
      { label: "Champion Celorian" },
    ],
    external: [
      { label: "Open Celo Communities Guild", href: "https://guild.xyz/celo-communities" },
    ],
  },

  // NEW — Proof of Ship
  {
    id: "proof-of-ship",
    title: "Proof of Ship",
    chain: "Celo",
    image: "/badges/posbadge.png",
    summary: "Earn cUSD by shipping public work and logging it through the Proof of Ship flow.",
    why:
      "Proof of Ship rewards builders for shipping public work aligned with Celo. Earnings are paid in cUSD and reflect consistent delivery, helping you build a verifiable on-chain track record.",
    how: [
      "Read how the integration works.",
      "Open the Celo Proof of Ship program page.",
      "Ship publicly (code, product, tutorial, integration) and submit according to the program instructions.",
      "Connect your wallet and claim eligible rewards in cUSD when your ship is approved.",
    ],
    tiers: [
      { label: "Earn 100 cUSD or more" },
      { label: "Earn 250 cUSD or more" },
      { label: "Earn 500 cUSD or more" },
      { label: "Earn 750 cUSD or more" },
      { label: "Earn 1000 cUSD or more" },
    ],
    external: [
      { label: "How it works (Docs)", href: "https://docs.gap.karmahq.xyz/how-to-guides/integrations/celo-proof-of-ship" },
      { label: "Program page", href: "https://www.celopg.eco/programs/proof-of-ship-s1" },
    ],
  },

  // NEW — CEL2 Transactions
  {
    id: "cel2-transactions",
    title: "CEL2 Transactions",
    chain: "Celo",
    image: "/badges/cel2txbadge.png",
    summary:
      "Make transactions on CEL2. The Daily check-in gives you one free tx per day.",
    why:
      "CEL2 is Celo’s L2. Regular usage decentralizes activity and builds your on-chain footprint. With the free Daily check-in you can interact at zero gas once per day — steady progress, no friction.",
    how: [
      "Connect your wallet on Celo Mainnet (CEL2).",
      "Use the Daily check-in button in Celo Lite (1 free tx/day).",
      "Do organic actions on CEL2 (governance, apps, transfers) to climb tiers.",
    ],
    tiers: [
      { label: "10 transactions on CEL2" },
      { label: "50 transactions on CEL2" },
      { label: "100 transactions on CEL2" },
      { label: "250 transactions on CEL2" },
      { label: "500 transactions on CEL2" },
    ],
    external: [
      { label: "Open Layer3", href: "https://app.layer3.xyz/search?chainIds=42220" },
    ],
  },

  // NEW — Talent Protocol / Builder Score
  {
    id: "talent-protocol-score",
    title: "Builder Score",
    chain: "Celo",
    image: "/badges/talentscorebadge.png",
    summary:
      "Increase your Talent Protocol Builder Score to signal reputation across the ecosystem.",
    why:
      "The Builder Score reflects sustained, verifiable builder activity (profile completeness, contributions, participation). A higher score helps showcase credibility and unlock opportunities.",
    how: [
      "Create or sign in to your Talent Protocol profile.",
      "Connect your wallet and complete your builder profile.",
      "Link your work and contributions (projects, repos, posts).",
      "Stay active: ship, document, and keep your profile updated to grow your score.",
    ],
    tiers: [
      { label: "Have a Builder score above 20" },
      { label: "Have a Builder score above 40" },
      { label: "Have a Builder score above 60" },
      { label: "Have a Builder score above 80" },
    ],
    external: [
      { label: "Open Talent Protocol", href: "https://app.talentprotocol.com/" },
    ],
  },

  // NEW — S1 Transactions (Season 1)
  {
    id: "s1-transactions",
    title: "S1 Transactions",
    chain: "Celo",
    image: "/badges/s1txsbadge.png",
    summary:
      "Number of transactions on Celo in Season 1 (since 23 Aug 2025; ends in ~93 days). Celo Lite shows your S1 counter (CEL1/CEL2/S1) to track progress.",
    why:
      "Season 1 highlights consistent on-chain activity in a defined window. Tracking S1 transactions helps you pace your engagement and unlock tiers during the season.",
    how: [
      "Connect your wallet in Celo Lite to display your S1 transaction counter.",
      "Use Daily check-in (free tx/day) and interact organically across the ecosystem.",
      "Keep an eye on your S1 total in the Wallet card (CEL1/CEL2/S1).",
    ],
    tiers: [
      { label: "10 transactions on Celo in Season 1" },
      { label: "50 transactions on Celo in Season 1" },
      { label: "100 transactions on Celo in Season 1" },
      { label: "250 transactions on Celo in Season 1" },
      { label: "500 transactions on Celo in Season 1" },
    ],
    external: [],
  },

  // NEW — Gitcoin Donor
  {
    id: "gitcoin-donor",
    title: "Gitcoin Donor",
    chain: "Celo",
    image: "/badges/gtcdonorbadge.png",
    summary: "Donate on Gitcoin using Celo to support public goods.",
    why:
      "Gitcoin funding supports builders and public goods across the ecosystem. ⚠ Donations use real funds and are generally non-refundable.",
    how: [
      "Open Gitcoin Grants and connect your wallet.",
      "Choose a grantee and select Celo if available (or bridge if needed).",
      "Confirm the donation transaction.",
      "Keep records for your own accounting if required.",
    ],
    tiers: [
      { label: "Donate $25 more on Gitcoin" },
      { label: "Donate $100 more on Gitcoin" },
      { label: "Donate $250 more on Gitcoin" },
      { label: "Donate $1000 more on Gitcoin" },
    ],
    external: [
      { label: "Open Gitcoin Grants", href: "https://grants.gitcoin.co/" },
    ],
  },

  // NEW — Giveth Donor
  {
    id: "giveth-donor",
    title: "Giveth Donor",
    chain: "Celo",
    image: "/badges/givethdonorbadge.png",
    summary: "Donate on Giveth using Celo to support public goods & communities.",
    why:
      "Giveth channels donations directly to projects. ⚠ Donations use real funds and are generally non-refundable.",
    how: [
      "Open Giveth projects filtered for Celo.",
      "Pick a project, connect your wallet, and select Celo if needed.",
      "Confirm the donation transaction.",
      "Optionally keep your receipt/tx hash for your records.",
    ],
    tiers: [
      { label: "Donate $25 more on Giveth" },
      { label: "Donate $100 more on Giveth" },
      { label: "Donate $250 more on Giveth" },
      { label: "Donate $1000 more on Giveth" },
    ],
    external: [
      { label: "Open Giveth Projects (Celo)", href: "https://giveth.io/projects/all?filter=AcceptFundOnCelo" },
    ],
  },

  // NEW — Celo Genesis
  {
    id: "celo-genesis",
    title: "Celo Genesis",
    chain: "Celo",
    image: "/badges/celogenesisbadge.png",
    summary: "Recognition based on the year your Celo wallet was created.",
    why:
      "Genesis reflects when you first joined the Celo network. Earlier creation dates signal long-term participation; newer dates welcome fresh builders to the ecosystem.",
    how: [
      "Connect your wallet in Prosperity Passport.",
      "Your wallet’s creation/first-activity year is detected automatically.",
      "The corresponding tier is shown; claim your badge.",
    ],
    tiers: [
      { label: "Wallet created in the year 2024" },
      { label: "Wallet created in the year 2023" },
      { label: "Wallet created in the year 2022" },
      { label: "Wallet created in the year 2021" },
      { label: "Wallet created in the year 2020" },
    ],
    external: [],
  },

  // NEW — Farcaster Connection
  {
    id: "farcaster-connection",
    title: "Farcaster Connection",
    chain: "Optimism",
    image: "/badges/fcconnectbadge.png",
    summary: "Link your Farcaster account to your Prosperity Passport.",
    why:
      "Connecting Farcaster ties your social identity to your onchain reputation, helping programs discover real builders while keeping control in your hands.",
    how: [
      "Open CeloPG Passport.",
      "Click the Farcaster Connection badge.",
      "Scan the QR code from Warpcast to authorize linking.",
      "Account linked — the badge turns complete.",
    ],
    tiers: [{ label: "Link your Farcaster account" }],
    external: [{ label: "Open CeloPG Passport", href: "https://pass.celopg.eco/" }],
  },

  // NEW — CEL1 Transactions
  {
    id: "cel1-transactions",
    title: "CEL1 Transactions",
    chain: "Celo",
    image: "/badges/cel1txbadge.png",
    summary:
      "Number of transactions on the former Celo L1 network (historical activity prior to CEL2).",
    why:
      "This badge reflects your footprint on the original Celo L1 before the move to CEL2. It’s a snapshot of legacy activity that showcases long-time participation in the ecosystem.",
    how: [
      "Connect your wallet in Celo Lite / Prosperity Passport.",
      "Your historical L1 transaction count is detected automatically.",
      "The corresponding tier is displayed; no extra action is required.",
    ],
    tiers: [
      { label: "10 transactions on the old Celo network" },
      { label: "50 transactions on the old Celo network" },
      { label: "100 transactions on the old Celo network" },
      { label: "250 transactions on the old Celo network" },
      { label: "500 transactions on the old Celo network" },
    ],
    external: [],
  },

  // NEW — ReFi DAO Contributor
  {
    id: "refi-dao-contributor",
    title: "ReFi DAO Contributor",
    chain: "Celo",
    image: "/badges/refibadge.png",
    summary:
      "Recognition for contributors listed in ReFi DAO’s contributor registry. (Note: new registrations appear to be closed.)",
    why:
      "This badge highlights prior or existing participation in ReFi DAO’s contributor program. If you’re already on the list, it helps surface your ReFi involvement in the Celo ecosystem.",
    how: [
      "If you were previously registered, connect your wallet to have it recognized.",
      "New registrations currently show an error on the sign-up page; follow ReFi DAO channels for future openings.",
    ],
    tiers: [
      { label: "ReFi DAO Contributor Level 1" },
      { label: "ReFi DAO Contributor Level 2" },
      { label: "ReFi DAO Contributor Level 3" },
      { label: "ReFi DAO Contributor Level 4" },
      { label: "ReFi DAO Contributor Level 5" },
    ],
    external: [
      { label: "ReFi DAO — Sign up (may be closed)", href: "https://www.refidao.com/join#sign-up" },
    ],
  },

  // NEW — GreenPill Member
  {
    id: "greenpill-member",
    title: "GreenPill Member",
    chain: "Celo",
    image: "/badges/greenpillbadge.png",
    summary: "Part of GreenPill Member List.",
    why:
      "GreenPill connects regen-minded builders and doers. Membership signals alignment with public goods and coordination-first values across the Celo ecosystem.",
    how: [
      "Visit GreenPill Network and explore participation paths (chapters, events, contributions).",
      "Follow the participation flow to become a member (varies by chapter/track).",
      "Once listed/recognized, your membership tier will reflect in Passport.",
    ],
    tiers: [
      { label: "Tier 1 member" },
      { label: "Tier 2 member" },
      { label: "Tier 3 member" },
    ],
    external: [
      { label: "Participate — GreenPill Network", href: "https://greenpill.network/#participate" },
      { label: "About GreenPill", href: "https://www.superchain.eco/projects/green-pill" }, // NEW
    ],
  },

  // NEW — Regional DAO Lead
  {
    id: "regional-dao-lead",
    title: "Regional DAO Lead",
    chain: "Celo",
    image: "/badges/regionaldaoleadbadge.png",
    summary: "Part of the Celo Regional DAO Steward list (by nomination/selection).",
    why:
      "Regional DAO Leads coordinate local communities, events, and programs. This badge recognizes approved stewards; it’s not a general-access application.",
    how: [
      "Be active in your local Celo community (events, education, coordination).",
      "If your region runs a steward process, you may be nominated/approved by program admins.",
      "Once approved, your wallet/address is added to the steward list and reflected as a badge.",
    ],
    tiers: [{ label: "Become a Celo Regional DAO Lead" }],
    external: [
      { label: "Celo Discord (communities)", href: "https://discord.gg/celo" },
      { label: "Celo Communities Guild", href: "https://guild.xyz/celo-communities" },
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
