import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { ExternalLink, Info } from "lucide-react";

/**
 * Celo Lite — Badges Section
 * -------------------------------------------------
 * Goals
 *  - Show a clean grid of badges (image + title + short explainer)
 *  - Keep everything in‑app with a lightweight details panel (Sheet)
 *  - Allow optional deep links to external pages (e.g., CeloPG, Glo Dollar)
 *  - Content lives in a simple data structure so you can grow it over time
 *
 * Usage
 *  <BadgesSection />
 *
 * Images
 *  Place your badge images under /public/badges/ (e.g. /public/badges/usdglo.png)
 *  You can use temporary placeholders and replace them later.
 */

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
    image: "/badges/baseusdglo.png", // put your exported image here
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
      { label: "Open Glo Dollar", href: "https://app.glodollar.org/buy" },
      { label: "Open CeloPG", href: "https://celopg.eco" },
    ],
  },
  // Add more badges here as you collect images + details
];

// ----------------------
// UI helpers
// ----------------------
function DetailSheet({ spec }: { spec: BadgeSpec }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="sm" variant="secondary" className="gap-2"><Info className="h-4 w-4"/> Details</Button>
      </SheetTrigger>
      <SheetContent className="max-w-lg w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Image src={spec.image} alt={spec.title} width={32} height={32} className="rounded" />
            {spec.title}
          </SheetTitle>
          <SheetDescription>
            <div className="mt-2 text-sm text-muted-foreground">Chain: {spec.chain}</div>
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-6">
          <section>
            <h4 className="text-sm font-semibold mb-2">Why it matters</h4>
            <p className="text-sm leading-relaxed">{spec.why}</p>
          </section>
          <section>
            <h4 className="text-sm font-semibold mb-2">How to progress</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {spec.how.map((li, i) => (
                <li key={i}>{li}</li>
              ))}
            </ul>
          </section>
          {spec.tiers && (
            <section>
              <h4 className="text-sm font-semibold mb-2">Tiers</h4>
              <div className="space-y-2">
                {spec.tiers.map((t, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <div className="mt-1 h-2 w-2 rounded-full bg-foreground/60" />
                    <div>
                      <div>{t.label}</div>
                      {t.hint && <div className="text-muted-foreground text-xs">{t.hint}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
          {spec.external && spec.external.length > 0 && (
            <section>
              <h4 className="text-sm font-semibold mb-2">Links</h4>
              <div className="flex flex-wrap gap-2">
                {spec.external.map((x) => (
                  <Button key={x.href} asChild variant="outline" size="sm" className="gap-2">
                    <a href={x.href} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4" /> {x.label}
                    </a>
                  </Button>
                ))}
              </div>
            </section>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ----------------------
// Section component
// ----------------------
export default function BadgesSection() {
  const data = useMemo(() => BADGES, []);
  const [filter, setFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return data;
    return data.filter((b) => b.chain.toLowerCase() === filter);
  }, [data, filter]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Badges</h2>
          <p className="text-sm text-muted-foreground">Short, Celo‑aligned explanations so users understand the why → act with confidence.</p>
        </div>
        <div className="flex items-center gap-2">
          <UIBadge variant="secondary" className="cursor-pointer" onClick={() => setFilter("all")}>All</UIBadge>
          <UIBadge variant="outline" className="cursor-pointer" onClick={() => setFilter("celo")}>Celo</UIBadge>
          <UIBadge variant="outline" className="cursor-pointer" onClick={() => setFilter("alfajores")}>Alfajores</UIBadge>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((b) => (
          <Card key={b.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Image src={b.image} alt={b.title} width={64} height={64} className="rounded-xl" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium leading-tight">{b.title}</h3>
                    <UIBadge variant="outline">{b.chain}</UIBadge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{b.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <DetailSheet spec={b} />
                    {b.external?.map((x) => (
                      <Button key={x.href} asChild size="sm" variant="outline" className="gap-2">
                        <a href={x.href} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4"/> {x.label}</a>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
