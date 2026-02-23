"use client";

import { useState } from "react";
import Link from "next/link";
import { Breadcrumb, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

export default function DocBreadcrumbPage() {
  const [itemsStr, setItemsStr] = useState("Accueil, Produits, Détail produit");
  const [separator, setSeparator] = useState("›");

  const labels = itemsStr.split(",").map((s) => s.trim()).filter(Boolean);
  const items = labels.map((label, i) =>
    i < labels.length - 1 ? { label, href: "#" } : { label }
  );

  const parts: string[] = [];
  if (labels.length) {
    const itemsArg = labels
      .map((l, i) =>
        i < labels.length - 1
          ? `{"label": "${l.replace(/"/g, '\\"')}", "href": "#"}`
          : `{"label": "${l.replace(/"/g, '\\"')}"}`
      )
      .join(", ");
    parts.push(`items=[${itemsArg}]`);
  }
  if (separator !== "›") parts.push(`separator="${separator.replace(/"/g, '\\"')}"`);
  const pythonCode = parts.length ? `bpm.breadcrumb(${parts.join(", ")})` : "bpm.breadcrumb()";
  const { prev, next } = getPrevNext("breadcrumb");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">Composants</Link> → bpm.breadcrumb
        </div>
        <h1>bpm.breadcrumb</h1>
        <p className="doc-description">
          Fil d&apos;Ariane : liste d&apos;étapes avec liens (sauf la dernière).
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Navigation</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div className="w-full">
            <Breadcrumb
              items={items.length ? items : [{ label: "Accueil", href: "#" }, { label: "Page actuelle" }]}
              separator={separator}
            />
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>items (labels séparés par des virgules)</label>
            <input
              type="text"
              value={itemsStr}
              onChange={(e) => setItemsStr(e.target.value)}
              placeholder="Accueil, Section, Page actuelle"
            />
          </div>
          <div className="sandbox-control-group">
            <label>separator</label>
            <input
              type="text"
              value={separator}
              onChange={(e) => setSeparator(e.target.value)}
              placeholder="›"
            />
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>Copier</button>
          </div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>

      <table className="props-table">
        <thead>
          <tr><th>Prop</th><th>Type</th><th>Défaut</th><th>Requis</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>items</code></td><td><code>&#123; label: string, href?: string &#125;[]</code></td><td>[]</td><td>Non</td><td>Éléments du fil (dernier = page courante, sans <code>href</code>).</td></tr>
          <tr><td><code>separator</code></td><td><code>string</code></td><td>›</td><td>Non</td><td>Caractère entre les éléments.</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Classes CSS additionnelles.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={'bpm.breadcrumb(items=[{"label": "Accueil", "href": "/"}, {"label": "Docs"}])'} language="python" />
      <CodeBlock code={'bpm.breadcrumb(items=[{"label": "A"}, {"label": "B", "href": "#b"}, {"label": "C"}], separator="/")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
