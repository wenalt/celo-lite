// pages/api/txcount.js
const CELO_CHAIN_ID = 42220;

// L2 pivot — 25 March 2025 00:00:00 UTC
const CELO_L2_START_TS = Math.floor(Date.UTC(2025, 2, 25) / 1000);

// S1 (Prosperity Passport Season 1) — 23 Aug 2025 00:00:00 UTC
const CELO_S1_START_TS = Math.floor(Date.UTC(2025, 7, 23) / 1000);

// Etherscan V2 (Multichain) endpoint
const ETHERSCAN_BASE = "https://api.etherscan.io/v2/api";

// Lis la clé côté serveur (ne pas exposer publiquement)
const ETHERSCAN_KEY =
  process.env.ETHERSCAN_V2_API_KEY ||
  process.env.ETHERSCAN_API_KEY ||
  process.env.ETHERSCAN_MULTICHAIN_API_KEY ||
  process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || // fallback rapide (à éviter en prod)
  "";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const address = String(req.query.address || "").trim().toLowerCase();
    if (!address) return res.status(400).json({ error: "Missing address" });
    if (!ETHERSCAN_KEY) return res.status(500).json({ error: "Missing Etherscan V2 API key" });

    let page = 1;
    const offset = 1000; // V2: 1000 free (5000 paid)
    let total = 0;
    let l2 = 0;
    let s1 = 0;

    while (true) {
      const url =
        `${ETHERSCAN_BASE}?chainid=${CELO_CHAIN_ID}` +
        `&module=account&action=txlist&address=${address}` +
        `&startblock=0&endblock=99999999&page=${page}&offset=${offset}&sort=asc` +
        `&apikey=${ETHERSCAN_KEY}`;

      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) throw new Error(`Etherscan HTTP ${r.status}`);
      const data = await r.json();

      // status "1" = OK, "0" peut aussi signifier "no tx found"
      if (!data || !Array.isArray(data.result)) {
        if (data && data.status === "0") break; // pas de tx
        throw new Error("Bad Etherscan response");
      }

      // Comptage
      for (const tx of data.result) {
        const ts = Number(tx.timeStamp);
        if (!Number.isFinite(ts)) continue;

        total++;
        if (ts >= CELO_L2_START_TS) l2++;
        if (ts >= CELO_S1_START_TS) s1++; // NEW: S1
      }

      // Dernière page ?
      if (data.result.length < offset) break;
      page++;

      // Garde-fou (au cas où)
      if (page > 10) break;
    }

    const l1 = Math.max(total - l2, 0);
    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=60"); // 1 min CDN
    return res.status(200).json({ l1, l2, s1, total });
  } catch (e) {
    console.error("txcount error:", e);
    return res.status(500).json({ error: e?.message || "Internal error" });
  }
}
