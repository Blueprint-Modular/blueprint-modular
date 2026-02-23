"use client";

import { useState } from "react";
import Link from "next/link";
import { Chip, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

const VARIANTS = ["default", "primary", "outline"] as const;

export default function DocChipPage() {
  const [label, setLabel] = useState("Tag");
  const [variant, setVariant] = useState<(typeof VARIANTS)[number]>("default");
  const [showDelete, setShowDelete] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const parts: string[] = [];
  parts.push(`label="${label.trim().replace(/"/g, '\\"') || "Tag"}"`);
  if (variant !== "default") parts.push(`variant="${variant}"`);
  if (showDelete) parts.push("on_delete=True");
  if (disabled) parts.push("disabled=True");
  const pythonCode = `bpm.chip(${parts.join(", ")})`;
  const { prev, next } = getPrevNext("chip");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">Composants</Link> → bpm.chip
        </div>
        <h1>bpm.chip</h1>
        <p className="doc-description">
          Pastille (chip) pour étiquettes ou sélections, avec variantes et bouton de suppression optionnel.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Interaction</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div className="w-full flex flex-wrap gap-2">
            <Chip
              label={label.trim() || "Tag"}
              variant={variant}
              onDelete={showDelete ? () => {} : undefined}
              onClick={undefined}
              disabled={disabled}
            />
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>label</label>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Tag" />
          </div>
          <div className="sandbox-control-group">
            <label>variant</label>
            <select value={variant} onChange={(e) => setVariant(e.target.value as (typeof VARIANTS)[number])}>
              {VARIANTS.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>onDelete</label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={showDelete} onChange={(e) => setShowDelete(e.target.checked)} />
              Afficher ×
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
          <tr><td><code>label</code></td><td><code>ReactNode</code></td><td>—</td><td>Oui</td><td>Contenu de la pastille.</td></tr>
          <tr><td><code>variant</code></td><td><code>&quot;default&quot; | &quot;primary&quot; | &quot;outline&quot;</code></td><td>default</td><td>Non</td><td>Style (fond, accent, bordure).</td></tr>
          <tr><td><code>onDelete</code></td><td><code>() =&gt; void</code></td><td>—</td><td>Non</td><td>Si défini, affiche un bouton × pour retirer (Python : <code>on_delete=True</code>).</td></tr>
          <tr><td><code>onClick</code></td><td><code>() =&gt; void</code></td><td>—</td><td>Non</td><td>Callback au clic sur la pastille.</td></tr>
          <tr><td><code>disabled</code></td><td><code>boolean</code></td><td>false</td><td>Non</td><td>Désactive la pastille.</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Classes CSS additionnelles.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={'bpm.chip(label="React")'} language="python" />
      <CodeBlock code={'bpm.chip(label="Sélectionné", variant="primary")'} language="python" />
      <CodeBlock code={'bpm.chip(label="Supprimable", on_delete=True)'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
