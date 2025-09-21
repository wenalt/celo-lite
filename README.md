# Celo Lite

A lightweight, open‑source **hub** for the Celo ecosystem and the **Prosperity Passport**. The goal is simple: reduce friction so users can **act onchain** and **stay engaged** without juggling a dozen tabs.

> Live: **[https://celo-lite.vercel.app](https://celo-lite.vercel.app)**
> Repo: **[https://github.com/wenalt/celo-lite](https://github.com/wenalt/celo-lite)**

---

## Why Celo Lite?

* Put the **most‑used actions in one place** (wallet, governance, Passport, ecosystem apps, routines, builder programs).
* Keep the experience **Celo‑aligned** and **educational by design** (short guidance that explains the *why*, not just the *how*).
* Offer **small helpers** that nudge organic engagement without being intrusive.

---

## What’s live today

Celo Lite currently works as a clean **one‑click launcher** with a few helper features:

### Core sections

* **Wallet** – Connect to show status.
* **Governance** – Quick access to **Open Mondo** and proposal browsing.
* **Prosperity Passport** – Open **CeloPG** and perform **Self.xyz verification** *(live)*.
* **Ecosystem** – Jump to **USD Glo Dollar** and **Regen Atlas (retire Eco Credits)**.
* **Routines** – Open **Layer3** and **claim \$G**.
* **Builders Programs** – Shortcuts to **Goodbuilders R2**, **Proof of Ship**, **Proof of Impact**, and **Support Streams**.
* **Badges** - in progress

### Helper features

* **Transaction Counter by period** – See activity segmented by **CEL1 / CEL2 / Prosperity Passport S1** to help users orient their onchain footprint over time.
* **Free Daily Check‑in** – A lightweight, optional nudge to encourage regular, organic interaction with Celo.

> Note: Except for Self.xyz verification, buttons are currently **one‑click redirects** to the relevant pages. The focus is on being a fast, reliable **hub** while we strengthen the educational layer.

---

## Educational focus (in progress)

Celo Lite is **educational by principle**. We’re expanding concise guidance around each section/quest so users understand:

* **Why it matters** (impact, governance, reputation, real‑world use cases),
* **What to do** (clean steps, gotchas),
* **Where it shows** (onchain footprint, social proof when relevant).

This content is being added iteratively to keep the app useful while it grows.

---

## Screens

You can browse the current layout on the live site. A few indicative blocks:

* Wallet
* Governance (Open Mondo / Browse Governance)
* Prosperity Passport (CeloPG + Self.xyz)
* Ecosystem (Glo Dollar / Regen Atlas)
* Routines (Layer3 / Claim \$G)
* Builders Programs (Goodbuilders R2 / Proof of Ship / Proof of Impact / Support Streams)

*(Screenshots will be added as the UI stabilizes.)*

---

## Getting started (dev)

> Minimal instructions, as the project evolves quickly. Check the repo scripts for the latest commands.

```bash
# 1) Clone
git clone https://github.com/wenalt/celo-lite
cd celo-lite

# 2) Install deps
npm install
# or: pnpm install / yarn install

# 3) Run locally
npm run dev
# then open the printed local URL
```

* The app targets **EVM wallets** (standard injected providers).
* Deployed on **Vercel** (settings in the project).

---

## Contributing

Contributions are welcome — from copy edits (educational tips!) to UI, QA, and Celo‑aligned integrations.

1. Open an issue describing the improvement (short + concrete).
2. If it’s copy/education, please include a source or rationale.
3. Submit a PR. Keep it small and focused.

We aim for:

* **Clarity** over complexity,
* **Celo alignment** over feature bloat,
* **Open source** over lock‑in.

---

## Privacy & UX principles

* **No custody** of user keys.
* **No personal tracking**; counters/check‑ins are lightweight and opt‑in UX helpers.
* Keep flows **predictable**: clear labels, explicit redirects, and minimal surprises.

---

## Roadmap (near‑term, non‑binding)

* Expand **concise explanations** for quests/badges and key sections.
* Tighten **counter/check‑in** UX (clearer feedback, small rewards later if appropriate).
* Continue polishing the **hub experience** (fast redirects, consistent copy)

> We’ll only announce features here once they’re actually live — staying humble and coherent with what the app delivers today.

---

## Acknowledgements

* Celo community and moderators for guidance.
* Builders and users who share feedback and test flows.

---

## License

Open‑source. See the LICENSE file in this repository.
