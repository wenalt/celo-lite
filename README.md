# celo-lite

Explore the Celo Prosperity ecosystem from Farcaster miniapp

# Celo Lite — Ecosystem · Staking · Governance

A minimal, mobile-friendly micro app to **stake, vote and explore** Celo’s Prosperity ecosystem:
- Quick links to **Mondo** (stake → vote)
- **Prosperity Passport** to track your onchain footprint
- **Layer3** quests (current season)
- Built-in **WalletConnect** (EVM), chain guardrails, and wallet status

Live: https://celo-lite.vercel.app

## Features
- 🔌 WalletConnect v2 (QR modal, chain switch / add chain)
- 🔒 Network check (prompts Celo Mainnet if not selected)
- 💰 CELO balance display (read-only)
- 🟡 Direct links: Mondo, Governance, Prosperity Passport, Layer3 (Celo)
- 🌓 Auto + manual theme (light/dark)
- 📱 Clean UI / centered layout, Inter font
- ✅ **Self Protocol verification** (QR desktop + mobile deeplink, ZK proofs)

## Getting Started

```bash
# 1) install
pnpm i
# or
npm i

# 2) env
cp .env.example .env.local
# edit .env.local with your WalletConnect Project ID
# and Self config (see below)

# 3) dev
npm run dev
