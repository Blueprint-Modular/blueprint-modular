"use client";

import { useState } from "react";
import Link from "next/link";
import { Metric, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

export default function DocMetricPage() {
  const [label, setLabel] = useState("Chiffre d'affaires");
  const [value, setValue] = useState(142500);
  const [delta, setDelta] = useState<number | null>(3200);

  const escapedLabel = label.replace(/"/g, '\\"');
  const pythonCode = `bpm.metric(label="${escapedLabel}", value=${value}, delta=${delta ?? "None"})`;
  const { prev, next } = getPrevNext("metric");

  return (
    <div className="max-w-4xl">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">Documentation → Composants → bpm.metric</div>
        <h1>bpm.metric</h1>
        <p className="doc-description">Affiche une métrique avec valeur, label et delta optionnel (évolution).</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Affichage de données</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Metric label={label} value={value.toLocaleString("fr-FR")} delta={delta ?? undefined} />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>label</label>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>value</label>
            <input type="number" value={value} onChange={(e) => setValue(Number(e.target.value) || 0)} />
          </div>
          <div className="sandbox-control-group">
            <label>delta (optionnel)</label>
            <input
              type="number"
              value={delta ?? ""}
              onChange={(e) => setDelta(e.target.value === "" ? null : Number(e.target.value))}
              placeholder="vide = pas de delta"
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
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Défaut</th>
            <th>Requis</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>label</code></td><td><code>string</code></td><td>—</td><td>Oui</td><td>Libellé de la métrique.</td></tr>
          <tr><td><code>value</code></td><td><code>string | number</code></td><td>—</td><td>Oui</td><td>Valeur affichée.</td></tr>
          <tr><td><code>delta</code></td><td><code>number | null</code></td><td>—</td><td>Non</td><td>Évolution (+ / -).</td></tr>
          <tr><td><code>deltaType</code></td><td><code>normal | inverse</code></td><td>normal</td><td>Non</td><td>Interprétation du delta.</td></tr>
          <tr><td><code>currency</code></td><td><code>string</code></td><td>EUR</td><td>Non</td><td>Symbole pour le delta.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={'bpm.metric("CA", 142500, delta=3200)\nbpm.metric("NPS", 72, delta=-3)'} language="python" />
      <CodeBlock code={'bpm.metric("Taux", "98%", delta=2)'} language="python" />
      <CodeBlock code={'bpm.metric("Coût", 1500, delta=-100, deltaType="inverse")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
