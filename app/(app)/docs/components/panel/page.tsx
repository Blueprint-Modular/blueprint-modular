"use client";

import { useState } from "react";
import Link from "next/link";
import { Panel, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

type Variant = "info" | "success" | "warning" | "error";

export default function DocPanelPage() {
  const [variant, setVariant] = useState<Variant>("info");
  const [title, setTitle] = useState("Titre du panneau");
  const [content, setContent] = useState("Contenu du panneau. Message informatif ou alerte.");

  const pythonCode = `bpm.panel(title="${title.replace(/"/g, '\\"')}", content="${content.replace(/"/g, '\\"').replace(/\n/g, " ")}", variant="${variant}")`;
  const { prev, next } = getPrevNext("panel");

  return (
    <div className="max-w-4xl">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs">Documentation</Link> → <Link href="/docs/components">Composants</Link> → bpm.panel</div>
        <h1>bpm.panel</h1>
        <p className="doc-description">Panneau informatif avec variantes (info, success, warning, error).</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Mise en page</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Panel key={variant} variant={variant} title={title}>
            {content}
          </Panel>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>variant</label>
            <select value={variant} onChange={(e) => setVariant(e.target.value as Variant)}>
              <option value="info">info</option>
              <option value="success">success</option>
              <option value="warning">warning</option>
              <option value="error">error</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>Contenu (children)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="w-full p-2 border rounded text-sm bg-[var(--bpm-surface)] text-[var(--bpm-text-primary)] border-[var(--bpm-border)]"
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
          <tr><td><code>variant</code></td><td><code>info | success | warning | error</code></td><td>info</td><td>Non</td><td>Style et couleur de bordure.</td></tr>
          <tr><td><code>title</code></td><td><code>string | null</code></td><td>null</td><td>Non</td><td>Titre du panneau.</td></tr>
          <tr><td><code>children</code></td><td><code>ReactNode</code></td><td>—</td><td>Non</td><td>Contenu du panneau.</td></tr>
          <tr><td><code>icon</code></td><td><code>string | null | false</code></td><td>null</td><td>Non</td><td>Icône personnalisée ou false pour masquer.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={'bpm.panel("Titre", "Contenu du panneau", variant="info")\nbpm.panel("Erreur", "Détail", variant="error")'} language="python" />
      <CodeBlock code={'bpm.panel(title="Succès", content="Opération réussie.", variant="success")'} language="python" />
      <CodeBlock code={'bpm.panel("Attention", "Vérifiez les données.", variant="warning")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
