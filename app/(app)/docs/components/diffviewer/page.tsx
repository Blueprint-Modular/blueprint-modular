"use client";

import { useState } from "react";
import Link from "next/link";
import { DiffViewer, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

const DEFAULT_ORIGINAL = "function hello() {\n  return 'world';\n}";
const DEFAULT_MODIFIED = "function hello() {\n  return 'world!';\n}";

export default function DocDiffViewerPage() {
  const [original, setOriginal] = useState(DEFAULT_ORIGINAL);
  const [modified, setModified] = useState(DEFAULT_MODIFIED);
  const [mode, setMode] = useState<"split" | "unified">("split");
  const [titleOriginal, setTitleOriginal] = useState("Avant");
  const [titleModified, setTitleModified] = useState("Après");

  const pyMode = mode !== "split" ? `, mode="${mode}"` : "";
  const pyTitle = (titleOriginal !== "Avant" || titleModified !== "Après") ? `, title={"original": "${titleOriginal.replace(/"/g, '\\"')}", "modified": "${titleModified.replace(/"/g, '\\"')}"}` : "";
  const pythonCode = `bpm.diffViewer(original=old_text, modified=new_text${pyMode}${pyTitle})`;
  const { prev, next } = getPrevNext("diffviewer");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.diffViewer</div>
        <h1>bpm.diffViewer</h1>
        <p className="doc-description">Visualisation de diff texte/code (split ou unified).</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">IA &amp; Spécialisés</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <DiffViewer
            original={original}
            modified={modified}
            mode={mode}
            title={{ original: titleOriginal, modified: titleModified }}
          />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>mode</label>
            <select value={mode} onChange={(e) => setMode(e.target.value as "split" | "unified")}>
              <option value="split">split</option>
              <option value="unified">unified</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>title.original</label>
            <input type="text" value={titleOriginal} onChange={(e) => setTitleOriginal(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>title.modified</label>
            <input type="text" value={titleModified} onChange={(e) => setTitleModified(e.target.value)} />
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
          <tr><td><code>original</code></td><td><code>string</code></td><td>—</td><td>Oui</td><td>Texte ou code original.</td></tr>
          <tr><td><code>modified</code></td><td><code>string</code></td><td>—</td><td>Oui</td><td>Texte ou code modifié.</td></tr>
          <tr><td><code>language</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Langage pour la coloration (optionnel).</td></tr>
          <tr><td><code>mode</code></td><td><code>&quot;split&quot; | &quot;unified&quot;</code></td><td>split</td><td>Non</td><td>Affichage côte à côte ou unifié.</td></tr>
          <tr><td><code>title</code></td><td><code>{ original?: string; modified?: string }</code></td><td>—</td><td>Non</td><td>Titres des colonnes (mode split).</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Classes CSS.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={'bpm.diffViewer(original=old_code, modified=new_code)'} language="python" />
      <CodeBlock code={'bpm.diffViewer(original=old_code, modified=new_code, mode="unified")'} language="python" />
      <CodeBlock code={'bpm.diffViewer(original=a, modified=b, title={"original": "v1", "modified": "v2"})'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
