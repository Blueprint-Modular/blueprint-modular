"use client";

import { useState } from "react";
import Link from "next/link";
import { Image } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

export default function DocImagePage() {
  const [fit, setFit] = useState<"contain" | "cover" | "fill" | "none">("contain");
  const { prev, next } = getPrevNext("image");
  const src = "https://picsum.photos/400/300";
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.image</div>
        <h1>bpm.image</h1>
        <p className="doc-description">Affichage d&apos;image avec options de dimensionnement.</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">Média</span></div>
      </div>
      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div style={{ width: 300, height: 200, border: "1px solid var(--bpm-border)" }}>
            <Image src={src} alt="Exemple" fit={fit} width={300} height={200} />
          </div>
        </div>
        <div className="sandbox-controls">
          <label>fit</label>
          <select value={fit} onChange={(e) => setFit(e.target.value as typeof fit)}>
            <option value="contain">contain</option>
            <option value="cover">cover</option>
            <option value="fill">fill</option>
            <option value="none">none</option>
          </select>
        </div>
      </div>
      <nav className="doc-pagination mt-8">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
