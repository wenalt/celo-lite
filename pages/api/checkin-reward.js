// pages/api/checkin-reward.js
import { Wallet, ethers } from "ethers";

const CONTRACT_ADDRESS = "0x840AD8Ea35a8d155fa58f0122D03b1f92c788d0e";
const CHAIN_ID = 42220; // Celo mainnet

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const pk = process.env.CELO_LITE_SIGNER_PK;
  if (!pk) {
    return res
      .status(500)
      .json({ error: "Missing CELO_LITE_SIGNER_PK env var" });
  }

  try {
    const { address } = req.body || {};

    if (!address || typeof address !== "string") {
      return res.status(400).json({ error: "Missing or invalid address" });
    }

    // petite validation très simple de l'address
    if (!address.startsWith("0x") || address.length !== 42) {
      return res.status(400).json({ error: "Invalid address format" });
    }

    // Montant fixe : 0.1 CELO par check-in
    const amount = ethers.parseEther("0.1");

    // 🗓 Nonce basé sur le jour (ex: 20251118)
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // "YYYYMMDD"
    const nonce = BigInt(today); // ex: 20251118n

    // Doit matcher exactement le Solidity:
    // keccak256(abi.encodePacked(msg.sender, amount, nonce, chainid, address(this)))
    const messageHash = ethers.solidityPackedKeccak256(
      ["address", "uint256", "uint256", "uint256", "address"],
      [address, amount, nonce, BigInt(CHAIN_ID), CONTRACT_ADDRESS]
    );

    const wallet = new Wallet(pk);
    const signature = await wallet.signMessage(ethers.getBytes(messageHash));

    return res.status(200).json({
      address,
      amount: amount.toString(),
      nonce: nonce.toString(),
      messageHash,
      signature,
    });
  } catch (e) {
    console.error("checkin-reward error:", e);
    return res.status(500).json({
      error: e?.message || "Unknown error in /api/checkin-reward",
    });
  }
}
