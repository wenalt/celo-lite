// pages/api/txcount.js
const CELO_CHAIN_ID = 42220;

// L2 pivot — 25 March 2025 00:00:00 UTC
const CELO_L2_START_TS = Math.floor(Date.UTC(2025, 2, 25) / 1000);

// S1 (Prosperity Passport Season 1)
// 23 Aug 2025 00:00:00 UTC → 24 Dec 2025 23:59:59 UTC
const CELO_S1_START_TS = Math.floor(Date.UTC(2025, 7, 23) / 1000);
const CELO_S1_END_TS = Math.floor(Date.UTC(2025, 11, 24, 23, 59, 59) / 1000);

// Etherscan V2 (Multichain) endpoint
const ETHERSCAN_BASE = "https://api.etherscan.io/v2/api";

// Lis la clé côté serveur (ne pas exposer publiquement)
const ETHERSCAN_KEY =
  process.env.ETHERSCAN_V2_API_KEY ||
  process.env.ETHERSCAN_API_KEY ||
  process.env.ETHERSCAN_MULTICHAIN_API_KEY ||
  process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY ||
  "";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const address = String(req.query.address || "").trim().toLowerCase();
    if (!address) return res.status(400).json({ error: "Missing address" });
    if (!ETHERSCAN_KEY)
      return res.status(500).json({ error: "Missing Etherscan V2 API key" });

    let page = 1;
    const offset = 1000;
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

      if (!data || !Array.isArray(data.result)) {
        if (data && data.status === "0") break;
        throw new Error("Bad Etherscan response");
      }

      for (const tx of data.result) {
        const ts = Number(tx.timeStamp);
        if (!Number.isFinite(ts)) continue;

        total++;

        if (ts >= CELO_L2_START_TS) l2++;

        // S1 uniquement dans l'intervalle officiel
        if (ts >= CELO_S1_START_TS && ts <= CELO_S1_END_TS) {
          s1++;
        }
      }

      if (data.result.length < offset) break;
      page++;
      if (page > 10) break;
    }

    const l1 = Math.max(total - l2, 0);

    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=60");
    return res.status(200).json({ l1, l2, s1, total });
  } catch (e) {
    console.error("txcount error:", e);
    return res.status(500).json({ error: e?.message || "Internal error" });
  }
}
