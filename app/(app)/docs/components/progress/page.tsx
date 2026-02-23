"use client";

import { useState } from "react";
import Link from "next/link";
import { Progress, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

export default function DocProgressPage() {
  const [value, setValue] = useState(65);
  const [max, setMax] = useState(100);
  const [label, setLabel] = useState("Avancement");
  const [showValue, setShowValue] = useState(true);

  const pythonCode =
    `bpm.progress(value=${value}, max=${max}` +
    (label ? `, label="${label.replace(/"/g, '\\"')}"` : "") +
    (!showValue ? ", show_value=False" : "") +
    ")";
  const { prev, next } = getPrevNext("progress");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">Composants</Link> → bpm.progress
        </div>
        <h1>bpm.progress</h1>
        <p className="doc-description">
          Barre de progression avec valeur, maximum optionnel et affichage du pourcentage.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Affichage de données</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div className="w-full max-w-md">
            <Progress
              value={value}
              max={max}
              label={label || undefined}
              showValue={showValue}
            />
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>value</label>
            <input
              type="number"
              min={0}
              max={max}
              value={value}
              onChange={(e) => setValue(Number(e.target.value) || 0)}
            />
          </div>
          <div className="sandbox-control-group">
            <label>max</label>
            <input
              type="number"
              min={1}
              value={max}
              onChange={(e) => setMax(Math.max(1, Number(e.target.value) || 1))}
            />
          </div>
          <div className="sandbox-control-group">
            <label>label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="ex. Avancement"
            />
          </div>
          <div className="sandbox-control-group">
            <label>showValue</label>
            <select value={showValue ? "true" : "false"} onChange={(e) => setShowValue(e.target.value === "true")}>
              <option value="true">true (afficher %)</option>
              <option value="false">false</option>
            </select>
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
            <td><code>value</code></td>
            <td><code>number</code></td>
            <td>0</td>
            <td>Non</td>
            <td>Valeur courante (avancement).</td>
          </tr>
          <tr>
            <td><code>max</code></td>
            <td><code>number</code></td>
            <td>1</td>
            <td>Non</td>
            <td>Valeur maximale (pourcentage = value / max × 100).</td>
          </tr>
          <tr>
            <td><code>label</code></td>
            <td><code>string | null</code></td>
            <td>null</td>
            <td>Non</td>
            <td>Libellé affiché au-dessus de la barre.</td>
          </tr>
          <tr>
            <td><code>showValue</code></td>
            <td><code>boolean</code></td>
            <td>true</td>
            <td>Non</td>
            <td>Afficher le pourcentage à droite.</td>
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
      <CodeBlock code={'bpm.progress(value=50, max=100)\nbpm.progress(value=0.65, max=1, label="Avancement")'} language="python" />
      <CodeBlock code={'bpm.progress(value=8, max=10, label="Étapes", show_value=True)'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
