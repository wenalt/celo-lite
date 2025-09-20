import React, { useMemo, useState } from "react";
import Image from "next/image";

/**
 * Celo Lite — Badges Section (UI aligned, no duplicates)
 * - No internal <h2> Badges or description (handled by page section)
 * - No chain filters
 * - Buttons use the app's global `.btn` (black)
 * - Centered layout
 * - Centered modal with slightly larger font
 */

// ----------------------
// Types
// ----------------------
export type BadgeTier = {
  label: string;
  hint?: string;
};

export type BadgeSpec = {
  id: string;
  title: string;
  chain: "Celo" | "Alfajores" | string;
  image: string;
  summary: string;
  why: string;
  how: string[];
  tiers?: BadgeTier[];
  external?: { label: string; href: string }[];
};

// ----------------------
// Content (start here)
// ----------------------
const BADGES: BadgeSpec[] = [
  {
    id: "usdglo",
    title: "USD Glo Dollar",
    chain: "Celo",
    image: "/badges/badgeusdglo.png",
    summary: "Hold USDGLO on Celo to progress through simple time‑based tiers.",
    why: "Glo Dollar links stable value with real‑world impact. Holding a small amount on Celo helps users experience a mission‑aligned stable asset while building a basic onchain footprint.",
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
];

export default function BadgesSection() {
  const data = useMemo(() => BADGES, []);
  const [openId, setOpenId] = useState<string | null>(null);
  const openSpec = useMemo(() => data.find((b) => b.id === openId) || null, [data, openId]);

  return (
    <div className="cl-badges">
      <div className="cl-grid">
        {data.map((b) => (
          <div key={b.id} className="cl-item">
            <Image src={b.image} alt={b.title} width={64} height={64} className="cl-img" />
            <div className="cl-col">
              <div className="cl-row">
                <h3 className="cl-name">{b.title}</h3>
                <span className="cl-chip">{b.chain}</span>
              </div>
              <p className="cl-summary">{b.summary}</p>
              <div className="cl-actions">
                <button className="btn" onClick={() => setOpenId(b.id)}>Details</button>
                {b.external?.map((x) => (
                  <a key={x.href} className="btn" href={x.href} target="_blank" rel="noreferrer">{x.label}</a>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Centered modal */}
      {openSpec && (
        <div className="cl-modal" role="dialog" aria-modal="true">
          <div className="cl-backdrop" onClick={() => setOpenId(null)} />
          <div className="cl-dialog">
            <div className="cl-dhead">
              <Image src={openSpec.image} alt="" width={28} height={28} className="cl-icon" />
              <h4 className="cl-dtitle">{openSpec.title}</h4>
              <button className="cl-close" onClick={() => setOpenId(null)} aria-label="Close">×</button>
            </div>
            <div className="cl-dbody">
              <div className="cl-meta">Chain: {openSpec.chain}</div>
              <section>
                <h5>Why it matters</h5>
                <p>{openSpec.why}</p>
              </section>
              <section>
                <h5>How to progress</h5>
                <ul>
                  {openSpec.how.map((li, i) => (
                    <li key={i}>{li}</li>
                  ))}
                </ul>
              </section>
              {openSpec.tiers && (
                <section>
                  <h5>Tiers</h5>
                  <ul className="cl-tiers">
                    {openSpec.tiers.map((t, i) => (
                      <li key={i}><span className="dot" />{t.label}{t.hint && <span className="hint"> – {t.hint}</span>}</li>
                    ))}
                  </ul>
                </section>
              )}
              {openSpec.external && openSpec.external.length > 0 && (
                <section>
                  <h5>Links</h5>
                  <div className="cl-links">
                    {openSpec.external.map((x) => (
                      <a key={x.href} className="btn" href={x.href} target="_blank" rel="noreferrer">{x.label}</a>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
          <style jsx>{`
            .cl-modal{position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;padding:16px}
            .cl-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.42)}
            .cl-dialog{position:relative;width:100%;max-width:680px;background:var(--card);border:1px solid var(--ring);border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.3)}
            .cl-dhead{display:flex;align-items:center;gap:10px;padding:14px 16px 0}
            .cl-icon{border-radius:8px}
            .cl-dtitle{margin:0;font-size:18px;font-weight:800}
            .cl-close{margin-left:auto;background:transparent;border:0;font-size:24px;line-height:1;cursor:pointer;color:inherit}
            .cl-dbody{padding:12px 16px 16px;font-size:15px;line-height:1.55}
            .cl-dbody h5{margin:12px 0 6px;font-size:15px}
            .cl-meta{color:var(--muted);font-size:13px}
            .cl-tiers{list-style:none;padding:0;margin:0}
            .cl-tiers li{display:flex;align-items:center;gap:8px;margin:6px 0}
            .cl-tiers .dot{display:inline-block;width:6px;height:6px;border-radius:999px;background:currentColor;opacity:.75}
            .hint{color:var(--muted);font-size:12px}
            .cl-links{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px}
          `}</style>
        </div>
      )}

      <style jsx>{`
        .cl-badges{width:100%}
        .cl-grid{display:flex;flex-direction:column;gap:10px;align-items:center}
        .cl-item{display:flex;align-items:center;gap:12px;justify-content:center;flex-wrap:wrap;width:100%}
        .cl-img{border-radius:12px}
        .cl-col{max-width:640px}
        .cl-row{display:flex;align-items:center;gap:8px;justify-content:center}
        .cl-name{margin:0;font-size:16px;font-weight:800}
        .cl-chip{display:inline-flex;align-items:center;padding:2px 8px;border-radius:999px;border:1px solid var(--ring);background:var(--card);font-size:12px}
        .cl-summary{margin:4px 0 0;color:var(--muted);font-size:14px}
        .cl-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-top:8px}
      `}</style>
    </div>
  );
}
