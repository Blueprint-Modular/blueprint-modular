"use client";

import { useState } from "react";
import Link from "next/link";
import { Divider, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

export default function DocDividerPage() {
  const [label, setLabel] = useState("");
  const [orientation, setOrientation] = useState<"horizontal" | "vertical">("horizontal");

  const parts: string[] = [];
  if (label.trim() !== "") parts.push(`label="${label.trim().replace(/"/g, '\\"')}"`);
  if (orientation !== "horizontal") parts.push(`orientation="${orientation}"`);
  const pythonCode = parts.length ? `bpm.divider(${parts.join(", ")})` : "bpm.divider()";
  const { prev, next } = getPrevNext("divider");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">Composants</Link> → bpm.divider
        </div>
        <h1>bpm.divider</h1>
        <p className="doc-description">
          Séparateur horizontal ou vertical, optionnellement avec un libellé au centre.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Mise en page</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div className="w-full" style={orientation === "vertical" ? { display: "flex", gap: "1rem", alignItems: "stretch", minHeight: 80 } : undefined}>
            <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Au-dessus</span>
            <Divider label={label.trim() || undefined} orientation={orientation} />
            <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>En dessous</span>
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>orientation</label>
            <select
              value={orientation}
              onChange={(e) => setOrientation(e.target.value as "horizontal" | "vertical")}
            >
              <option value="horizontal">horizontal</option>
              <option value="vertical">vertical</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="ex. ou"
            />
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>
              Copier
            </button>
          </div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>

      <table className="props-table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Défaut</th>
            <th>Requis</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>label</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>Non</td>
            <td>Texte affiché au centre du séparateur (horizontal uniquement).</td>
          </tr>
          <tr>
            <td><code>orientation</code></td>
            <td><code>&quot;horizontal&quot; | &quot;vertical&quot;</code></td>
            <td>horizontal</td>
            <td>Non</td>
            <td>Orientation de la ligne.</td>
          </tr>
          <tr>
            <td><code>className</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>Non</td>
            <td>Classes CSS additionnelles.</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code="bpm.divider()" language="python" />
      <CodeBlock code='bpm.divider(label="ou")' language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
