// pages/api/checkin-reward.js
import { ethers } from "ethers";

const CELO_CHAIN_ID = 42220;

// même adresse que côté front
const REWARD_DISTRIBUTOR_ADDR =
  process.env.NEXT_PUBLIC_REWARD_DISTRIBUTOR_ADDRESS ||
  "0x840AD8Ea35a8d155fa58f0122D03b1f92c788d0e";

// PK du signer (garde la même variable d'env que tu utilises déjà)
const SIGNER_PK =
  process.env.REWARD_SIGNER_PK || process.env.REWARD_SIGNER_PRIVATE_KEY;

if (!SIGNER_PK) {
  console.warn(
    "[checkin-reward] Missing SIGNER_PK env (REWARD_SIGNER_PK or REWARD_SIGNER_PRIVATE_KEY)"
  );
}

// 0.1 CELO en wei
const REWARD_AMOUNT_WEI = "100000000000000000";

// domain + types pour EIP-712 (doit matcher le contrat RewardDistributor)
const DOMAIN = {
  name: "CeloLiteRewardDistributor",
  version: "1",
  chainId: CELO_CHAIN_ID,
  verifyingContract: REWARD_DISTRIBUTOR_ADDR,
};

const TYPES = {
  Claim: [
    { name: "account", type: "address" },
    { name: "amount", type: "uint256" },
    { name: "nonce", type: "uint256" },
  ],
};

// signer hors handler (réutilisé entre requêtes)
const signer = SIGNER_PK ? new ethers.Wallet(SIGNER_PK) : null;

// index de jour depuis l’epoch (changé toutes les 24h approx)
function getDayIndex() {
  return Math.floor(Date.now() / 86400000);
}

// nonce = fid * 1_000_000 + dayIndex  => 1 reward / jour / FID
function makeNonce(fid) {
  const dayIndex = BigInt(getDayIndex());
  return {
    nonceBig: BigInt(fid) * 1_000_000n + dayIndex,
    dayIndex: Number(dayIndex),
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  if (!signer) {
    return res.status(500).json({ error: "Signer not configured" });
  }

  try {
    const { address } = req.body || {};
    if (!address || !ethers.isAddress(address)) {
      return res.status(400).json({ error: "Invalid address" });
    }

    // Récupérer l'utilisateur Farcaster vérifié par QuickAuth
    const rawUser = req.headers["x-farcaster-user"];
    let fid = null;

    if (typeof rawUser === "string") {
      try {
        const parsed = JSON.parse(rawUser);
        fid = parsed?.fid;
      } catch (e) {
        console.warn("Failed to parse x-farcaster-user header", e);
      }
    }

    if (!fid) {
      // Empêche les calls directs hors Mini App / QuickAuth
      return res.status(401).json({
        error: "Missing Farcaster identity (use Celo Lite from Farcaster Mini App)",
      });
    }

    // Construire un nonce unique par jour / FID
    const { nonceBig, dayIndex } = makeNonce(fid);

    const message = {
      account: address,
      amount: BigInt(REWARD_AMOUNT_WEI),
      nonce: nonceBig,
    };

    // Signature EIP-712 (ethers v6)
    const signature = await signer.signTypedData(DOMAIN, TYPES, message);

    return res.status(200).json({
      amount: REWARD_AMOUNT_WEI,
      nonce: nonceBig.toString(),
      signature,
      fid,
      dayIndex,
    });
  } catch (err) {
    console.error("[checkin-reward] Internal error", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
