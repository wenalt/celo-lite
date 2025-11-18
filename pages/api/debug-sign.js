// pages/api/debug-sign.js
import { Wallet, ethers } from "ethers";

const CONTRACT_ADDRESS = "0x840AD8Ea35a8d155fa58f0122D03b1f92c788d0e";
// ⚠️ Tu as déployé sur Celo mainnet → chainId = 42220
// (si jamais tu avais fait Alfajores, ce serait 44787)
const CHAIN_ID = 42220;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const pk = process.env.CELO_LITE_SIGNER_PK;
  if (!pk) {
    return res
      .status(500)
      .json({ error: "Missing CELO_LITE_SIGNER_PK env var" });
  }

  // 👉 IMPORTANT : mets ici l’adresse qui va appeler `claim` dans Remix
  // (ton adresse MetaMask actuelle sur Celo)
  const userAddress = "0x65a4b717d9950cc364aa37a89a78c2bef3559200";

  try {
    const amount = ethers.parseEther("0.1"); // 0.1 CELO
    const nonce = 1n; // premier test

    // Doit matcher EXACTEMENT le solidity:
    // keccak256(abi.encodePacked(msg.sender, amount, nonce, chainid, address(this)))
    const messageHash = ethers.solidityPackedKeccak256(
      ["address", "uint256", "uint256", "uint256", "address"],
      [userAddress, amount, nonce, BigInt(CHAIN_ID), CONTRACT_ADDRESS]
    );

    const wallet = new Wallet(pk);
    const signature = await wallet.signMessage(ethers.getBytes(messageHash));

    return res.status(200).json({
      user: userAddress,
      amount: amount.toString(),
      nonce: nonce.toString(),
      messageHash,
      signature,
    });
  } catch (e) {
    console.error("debug-sign error:", e);
    return res.status(500).json({
      error: e?.message || "Unknown error in /api/debug-sign",
    });
  }
}
