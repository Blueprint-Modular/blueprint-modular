"use client";

import { useState } from "react";
import Link from "next/link";
import { Expander, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

export default function DocExpanderPage() {
  const [title, setTitle] = useState("Voir les détails");
  const [defaultExpanded, setDefaultExpanded] = useState(false);

  const escapedTitle = title.replace(/"/g, '\\"');
  const pythonCode = `bpm.expander(title="${escapedTitle}", default_open=${defaultExpanded}, content=...)`;
  const { prev, next } = getPrevNext("expander");

  return (
    <div className="max-w-4xl">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs">Documentation</Link> → <Link href="/docs/components">Composants</Link> → bpm.expander</div>
        <h1>bpm.expander</h1>
        <p className="doc-description">Bloc repliable pour afficher/masquer du contenu.</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Mise en page</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Expander title={title} defaultExpanded={defaultExpanded}>
            <p className="text-sm">Contenu démo : paragraphe, liste, ou tout composant BPM.</p>
          </Expander>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>defaultOpen</label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={defaultExpanded} onChange={(e) => setDefaultExpanded(e.target.checked)} />
              Ouvert par défaut
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
          <tr>
            <td><code>title</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>Oui</td>
            <td>Titre du bloc repliable.</td>
          </tr>
          <tr>
            <td><code>children</code></td>
            <td><code>ReactNode</code></td>
            <td>—</td>
            <td>Oui</td>
            <td>Contenu affiché quand ouvert.</td>
          </tr>
          <tr>
            <td><code>defaultExpanded</code></td>
            <td><code>boolean</code></td>
            <td><code>false</code></td>
            <td>Non</td>
            <td>Ouvert par défaut.</td>
          </tr>
          <tr>
            <td><code>className</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>Non</td>
            <td>Classes CSS.</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={'bpm.expander(title="Configuration avancée", default_open=False, content=bpm.panel(...))'} language="python" />
      <CodeBlock code={'bpm.expander(title="FAQ", content=bpm.write("Réponse..."))'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
