"use client";

import { useState } from "react";
import Link from "next/link";
import { Markdown, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

const SAMPLE_MD = "## Titre\n\nParagraphe avec **gras** et *italique*.\n\n- Item 1\n- Item 2\n\n---\n\nFin.";

export default function DocMarkdownPage() {
  const [text, setText] = useState(SAMPLE_MD);

  const pythonCode = `bpm.markdown(text="""${text.slice(0, 50)}${text.length > 50 ? "..." : ""}""")`;
  const { prev, next } = getPrevNext("markdown");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.markdown</div>
        <h1>bpm.markdown</h1>
        <p className="doc-description">Rendu Markdown sécurisé.</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Affichage de données</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Markdown text={text} />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>text</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} style={{ width: "100%" }} />
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button type="button" onClick={() => navigator.clipboard.writeText(`bpm.markdown(text="""${text.replace(/"/g, '\\"')}""")`)}>Copier</button>
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
          <tr><td><code>text</code></td><td><code>string</code></td><td>—</td><td>Oui</td><td>Contenu Markdown. Utilisez <code>---</code> sur une ligne pour une ligne horizontale (hr).</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Classes CSS.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={'bpm.markdown(text="## Procédure\\n\\n1. Valider le devis\\n2. Envoyer au client.")'} language="python" />
      <CodeBlock code={'bpm.markdown(text=content)'} language="python" />
      <CodeBlock code={'bpm.markdown(text="**Important** : voir la notice.")'} language="python" />
      <CodeBlock code={'bpm.markdown(text="---\\nSection suivante")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
