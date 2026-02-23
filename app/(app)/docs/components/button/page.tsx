"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

type Variant = "primary" | "secondary" | "outline";
type Size = "small" | "medium" | "large";

export default function DocButtonPage() {
  const [variant, setVariant] = useState<Variant>("primary");
  const [size, setSize] = useState<Size>("medium");
  const [disabled, setDisabled] = useState(false);
  const [label, setLabel] = useState("Valider");

  const escapedLabel = label.replace(/"/g, "\\\"");
  const pythonCode = "bpm.button(\"" + escapedLabel + "\", variant=\"" + variant + "\", size=\"" + size + "\", disabled=" + String(disabled) + ")";
  const { prev, next } = getPrevNext("button");

  return (
    <div className="max-w-4xl">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">Documentation → Composants → bpm.button</div>
        <h1>bpm.button</h1>
        <p className="doc-description">Bouton avec variantes primary, secondary, outline et tailles.</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Interaction</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Button variant={variant} size={size} disabled={disabled} onClick={() => alert("Cliqué")}>
            {label || "Bouton"}
          </Button>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>label</label>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>variant</label>
            <select value={variant} onChange={(e) => setVariant(e.target.value as Variant)}>
              <option value="primary">primary</option>
              <option value="secondary">secondary</option>
              <option value="outline">outline</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>size</label>
            <select value={size} onChange={(e) => setSize(e.target.value as Size)}>
              <option value="small">small</option>
              <option value="medium">medium</option>
              <option value="large">large</option>
            </select>
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
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Défaut</th>
            <th>Requis</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>children</code></td><td><code>ReactNode</code></td><td>—</td><td>Oui</td><td>Contenu du bouton.</td></tr>
          <tr><td><code>variant</code></td><td><code>primary | secondary | outline</code></td><td>primary</td><td>Non</td><td>Style.</td></tr>
          <tr><td><code>size</code></td><td><code>small | medium | large</code></td><td>medium</td><td>Non</td><td>Taille.</td></tr>
          <tr><td><code>disabled</code></td><td><code>boolean</code></td><td>false</td><td>Non</td><td>Désactivé.</td></tr>
          <tr><td><code>onClick</code></td><td><code>function</code></td><td>—</td><td>Non</td><td>Callback clic.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={'if bpm.button("Valider"):\n    bpm.write("Validé !")'} language="python" />
      <CodeBlock code={'bpm.button("Annuler", variant="outline")'} language="python" />
      <CodeBlock code={'bpm.button("Petit", size="small")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
