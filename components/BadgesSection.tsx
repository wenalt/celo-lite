import React, { useMemo, useState } from "react";
import Image from "next/image";

/**
 * Celo Lite — Badges Section (no external UI deps)
 * -------------------------------------------------
 * This version removes shadcn-ui imports and uses tiny local components
 * so it works out-of-the-box in your repo.
 */

// ----------------------
// Tiny local UI primitives
// ----------------------
function Card({ children }: { children: React.ReactNode }) {
  return <div className="cl-card">{children}</div>;
}
function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: false }
) {
  const { className = "", children, ...rest } = props;
  return (
    <button className={`cl-btn ${className}`} {...rest}>
      {children}
    </button>
  );
}
function BadgePill({ children }: { children: React.ReactNode }) {
  return <span className="cl-badge">{children}</span>;
}

// Very small in-app sheet (details panel)
function Sheet({
  open,
  onClose,
  title,
  children,
  iconSrc,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  iconSrc?: string;
}) {
  if (!open) return null;
  return (
    <div className="cl-sheet-root" role="dialog" aria-modal="true">
      <div className="cl-sheet-backdrop" onClick={onClose} />
      <div className="cl-sheet">
        <div className="cl-sheet-head">
          {iconSrc ? (
            <Image src={iconSrc} alt="" width={24} height={24} className="cl-sheet-icon" />
          ) : null}
          <h4 className="cl-sheet-title">{title}</h4>
          <button className="cl-sheet-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="cl-sheet-body">{children}</div>
      </div>
      <style jsx>{`
        .cl-sheet-root{position:fixed;inset:0;z-index:70}
        .cl-sheet-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.4)}
        .cl-sheet{position:relative;margin:6vh auto 0;max-width:640px;width:92%;background:var(--card,#fff);color:inherit;border:1px solid var(--ring,rgba(0,0,0,.08));border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.25)}
        .cl-sheet-head{display:flex;align-items:center;gap:10px;padding:14px 14px 0}
        .cl-sheet-icon{border-radius:6px}
        .cl-sheet-title{margin:0;font-size:16px;font-weight:700}
        .cl-sheet-close{margin-left:auto;background:transparent;border:0;font-size:22px;line-height:1;cursor:pointer;color:inherit}
        .cl-sheet-body{padding:12px 14px 16px}
      `}</style>
    </div>
  );
}

// ----------------------
// Types
// ----------------------
export type BadgeTier = {
  label: string;            // e.g. "Hold > $1 for > 1 day"
  hint?: string;            // optional gotcha or note
};

export type BadgeSpec = {
  id: string;               // slug, e.g. "usdglo"
  title: string;            // "USD Glo Dollar"
  chain: "Celo" | "Alfajores" | string;
  image: string;            // public path for next/image
  summary: string;          // one‑liner
  why: string;              // short paragraph: why it matters
  how: string[];            // bullet steps to complete
  tiers?: BadgeTier[];      // optional list of tiers
  external?: { label: string; href: string }[]; // quick links
};

// ----------------------
// Content (start here)
// ----------------------
const BADGES: BadgeSpec[] = [
  {
    id: "usdglo",
    title: "USD Glo Dollar",
    chain: "Celo",
    image: "/badges/badgeusdglo.png", // updated filename
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
  // Add more badges here as you collect images + details
];

// ----------------------
// Section component
// ----------------------
export default function BadgesSection() {
  const data = useMemo(() => BADGES, []);
  const [filter, setFilter] = useState<string>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return data;
    return data.filter((b) => b.chain.toLowerCase() === filter);
  }, [data, filter]);

  const openSpec = useMemo(() => data.find((b) => b.id === openId) || null, [data, openId]);

  return (
    <div className="cl-badges-section">
      <div className="cl-head">
        <div>
          <h2 className="cl-title">Badges</h2>
          <p className="cl-sub">Short, Celo‑aligned explanations so users understand the why → act with confidence.</p>
        </div>
        <div className="cl-filters">
          <BadgePill>
            <button className="cl-link" onClick={() => setFilter("all")}>All</button>
          </BadgePill>
          <BadgePill>
            <button className="cl-link" onClick={() => setFilter("celo")}>Celo</button>
          </BadgePill>
          <BadgePill>
            <button className="cl-link" onClick={() => setFilter("alfajores")}>Alfajores</button>
          </BadgePill>
        </div>
      </div>

      <div className="cl-grid">
        {filtered.map((b) => (
          <Card key={b.id}>
            <div className="cl-row">
              <Image src={b.image} alt={b.title} width={64} height={64} className="cl-img" />
              <div className="cl-col">
                <div className="cl-row2">
                  <h3 className="cl-name">{b.title}</h3>
                  <BadgePill>{b.chain}</BadgePill>
                </div>
                <p className="cl-summary">{b.summary}</p>
                <div className="cl-actions">
                  <Button onClick={() => setOpenId(b.id)}>Details</Button>
                  {b.external?.map((x) => (
                    <a key={x.href} className="cl-btn cl-btn-outline" href={x.href} target="_blank" rel="noreferrer">
                      {x.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Sheet
        open={!!openSpec}
        onClose={() => setOpenId(null)}
        title={openSpec?.title || ""}
        iconSrc={openSpec?.image}
      >
        {openSpec && (
          <div className="cl-detail">
            <div className="cl-meta">Chain: {openSpec.chain}</div>
            <section>
              <h4>Why it matters</h4>
              <p>{openSpec.why}</p>
            </section>
            <section>
              <h4>How to progress</h4>
              <ul>
                {openSpec.how.map((li, i) => (
                  <li key={i}>{li}</li>
                ))}
              </ul>
            </section>
            {openSpec.tiers && (
              <section>
                <h4>Tiers</h4>
                <ul className="cl-tiers">
                  {openSpec.tiers.map((t, i) => (
                    <li key={i}>
                      <span className="dot" />
                      <div>
                        <div>{t.label}</div>
                        {t.hint && <div className="hint">{t.hint}</div>}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {openSpec.external && openSpec.external.length > 0 && (
              <section>
                <h4>Links</h4>
                <div className="cl-links">
                  {openSpec.external.map((x) => (
                    <a key={x.href} className="cl-btn cl-btn-outline" href={x.href} target="_blank" rel="noreferrer">{x.label}</a>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </Sheet>

      <style jsx>{`
        .cl-badges-section{max-width:960px;margin:0 auto}
        .cl-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px}
        .cl-title{margin:0;font-size:20px}
        .cl-sub{margin:4px 0 0;color:var(--muted)}
        .cl-filters{display:flex;gap:6px;align-items:center}
        .cl-link{background:transparent;border:0;color:inherit;cursor:pointer;padding:0 4px}

        .cl-grid{display:grid;grid-template-columns:1fr;gap:10px}
        @media(min-width:640px){.cl-grid{grid-template-columns:1fr 1fr}}

        .cl-card{background:var(--card);border:1px solid var(--ring);border-radius:16px;padding:14px}
        .cl-row{display:flex;align-items:center;gap:12px}
        .cl-row2{display:flex;align-items:center;gap:8px}
        .cl-img{border-radius:12px}
        .cl-name{margin:0;font-size:16px;font-weight:700}
        .cl-summary{margin:4px 0 0;color:var(--muted);font-size:14px}
        .cl-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}

        .cl-btn{appearance:none;border:0;background:var(--btn-bg);color:var(--btn-fg);padding:8px 12px;border-radius:10px;font-weight:600;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}
        .cl-btn:hover{opacity:.92}
        .cl-btn-outline{background:transparent;color:inherit;border:1px solid var(--ring)}

        .cl-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 8px;border-radius:999px;border:1px solid var(--ring);background:var(--card);font-size:12px}

        .cl-detail section{margin-top:12px}
        .cl-detail h4{margin:0 0 6px;font-size:14px}
        .cl-detail p{margin:0;color:var(--muted)}
        .cl-detail ul{margin:0;padding-left:18px}
        .cl-tiers{list-style:none;padding:0;margin:0}
        .cl-tiers li{display:flex;gap:8px;align-items:flex-start;margin:6px 0}
        .cl-tiers .dot{display:inline-block;width:6px;height:6px;border-radius:999px;background:currentColor;margin-top:7px;opacity:.7}
        .hint{color:var(--muted);font-size:12px}
        .cl-links{display:flex;flex-wrap:wrap;gap:8px}
      `}</style>
    </div>
  );
}
