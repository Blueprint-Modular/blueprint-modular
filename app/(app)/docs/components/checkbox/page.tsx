"use client";

import { useState } from "react";
import Link from "next/link";
import { Checkbox, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

export default function DocCheckboxPage() {
  const [label, setLabel] = useState("Accepter les conditions");
  const [checked, setChecked] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const parts: string[] = [];
  if (label.trim() !== "") parts.push(`label="${label.trim().replace(/"/g, '\\"')}"`);
  if (checked) parts.push("value=True");
  if (disabled) parts.push("disabled=True");
  const pythonCode = parts.length ? `bpm.checkbox(${parts.join(", ")})` : "bpm.checkbox()";
  const { prev, next } = getPrevNext("checkbox");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">Composants</Link> → bpm.checkbox
        </div>
        <h1>bpm.checkbox</h1>
        <p className="doc-description">
          Case à cocher avec label et état désactivable.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Interaction</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div className="w-full">
            <Checkbox
              label={label.trim() || undefined}
              checked={checked}
              onChange={setChecked}
              disabled={disabled}
            />
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="ex. Accepter"
            />
          </div>
          <div className="sandbox-control-group">
            <label>checked</label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
              Coché
            </label>
          </div>
          <div className="sandbox-control-group">
            <label>disabled</label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} />
              Désactivé
            </label>
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
          <tr><td><code>label</code></td><td><code>ReactNode</code></td><td>—</td><td>Non</td><td>Texte ou contenu à côté de la case.</td></tr>
          <tr><td><code>checked</code></td><td><code>boolean</code></td><td>false</td><td>Non</td><td>État coché (Python : <code>value</code>).</td></tr>
          <tr><td><code>onChange</code></td><td><code>(checked: boolean) =&gt; void</code></td><td>—</td><td>Non</td><td>Callback au changement.</td></tr>
          <tr><td><code>disabled</code></td><td><code>boolean</code></td><td>false</td><td>Non</td><td>Désactive la case.</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Classes CSS additionnelles.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code="bpm.checkbox()" language="python" />
      <CodeBlock code={'bpm.checkbox(label="Accepter les CGU", value=True)'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
