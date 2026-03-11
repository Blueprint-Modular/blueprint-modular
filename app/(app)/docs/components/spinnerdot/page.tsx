"use client";

import { useState } from "react";
import Link from "next/link";
import { SpinnerDot, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

type SizeOption = "small" | "medium" | "large";

export default function DocSpinnerDotPage() {
  const [size, setSize] = useState<SizeOption>("medium");

  const pySize = size !== "medium" ? `, size="${size}"` : "";
  const pythonCode = `bpm.spinnerDot()${pySize}`;
  const { prev, next } = getPrevNext("spinnerdot");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.spinnerDot</div>
        <h1>bpm.spinnerDot</h1>
        <p className="doc-description">Indicateur de chargement compact (points / cercle tournant), pour usage inline (ex. bulle assistant).</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Feedback</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <SpinnerDot size={size} />
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>size</label>
            <select value={size} onChange={(e) => setSize(e.target.value as SizeOption)}>
              <option value="small">small (16px)</option>
              <option value="medium">medium (24px)</option>
              <option value="large">large (32px)</option>
            </select>
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
          <tr><td><code>size</code></td><td><code>small | medium | large</code></td><td>medium</td><td>Non</td><td>Taille du spinner (16px, 24px, 32px).</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Classes CSS additionnelles.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={"bpm.spinnerDot()  # medium par défaut"} language="python" />
      <CodeBlock code={'bpm.spinnerDot(size="small")'} language="python" />
      <CodeBlock code={'bpm.spinnerDot(size="large")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
