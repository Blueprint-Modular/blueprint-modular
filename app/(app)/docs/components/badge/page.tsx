"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "error";

export default function DocBadgePage() {
  const [label, setLabel] = useState("Affichage de données");
  const [variant, setVariant] = useState<BadgeVariant>("default");

  const escapedLabel = label.replace(/"/g, '\\"');
  const pyVariant = variant !== "default" ? `, variant="${variant}"` : "";
  const pythonCode = `bpm.badge("${escapedLabel}"${pyVariant})`;
  const { prev, next } = getPrevNext("badge");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">Composants</Link> → bpm.badge
        </div>
        <h1>bpm.badge</h1>
        <p className="doc-description">
          Badge / étiquette avec variantes (default, primary, success, warning, error).
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Affichage de données</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant={variant}>{label || "Badge"}</Badge>
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Texte du badge"
            />
          </div>
          <div className="sandbox-control-group">
            <label>variant</label>
            <select value={variant} onChange={(e) => setVariant(e.target.value as BadgeVariant)}>
              <option value="default">default</option>
              <option value="primary">primary</option>
              <option value="success">success</option>
              <option value="warning">warning</option>
              <option value="error">error</option>
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
            <td><code>children</code> / <code>label</code></td>
            <td><code>string | ReactNode</code></td>
            <td>—</td>
            <td>Oui</td>
            <td>Texte ou contenu du badge.</td>
          </tr>
          <tr>
            <td><code>variant</code></td>
            <td><code>default | primary | success | warning | error</code></td>
            <td>default</td>
            <td>Non</td>
            <td>Style et couleur du badge.</td>
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
      <CodeBlock code={'bpm.badge("Nouveau")\nbpm.badge("Validé", variant="success")\nbpm.badge("Attention", variant="warning")'} language="python" />
      <CodeBlock code={'bpm.badge("Erreur", variant="error")\nbpm.badge("Info", variant="primary")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
