"use client";

import { useState } from "react";
import Link from "next/link";
import { CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

const LANGS = ["python", "bash", "json", "typescript"] as const;

export default function DocCodeBlockPage() {
  const [language, setLanguage] = useState<string>("python");
  const [code, setCode] = useState('def hello():\n    print("Hello, BPM!")');

  const { prev, next } = getPrevNext("codeblock");
  const pyCode = `bpm.codeblock(code="...", language="${language}")`;

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.codeblock</div>
        <h1>bpm.codeblock</h1>
        <p className="doc-description">Bloc de code avec surlignage et bouton Copier.</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Utilitaires</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>
      <div className="sandbox-container">
        <div className="sandbox-preview">
          <CodeBlock code={code} language={language} />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              {LANGS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>Contenu</label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={6}
              className="w-full p-2 border rounded text-sm bg-[var(--bpm-surface)] text-[var(--bpm-text-primary)] border-[var(--bpm-border)] font-mono"
            />
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header"><span>Python</span></div>
          <pre><code>{pyCode}</code></pre>
        </div>
      </div>
      <table className="props-table">
        <thead><tr><th>Prop</th><th>Type</th><th>Defaut</th><th>Requis</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>code</code></td><td><code>string</code></td><td>—</td><td>Oui</td><td>Contenu du bloc.</td></tr>
          <tr><td><code>language</code></td><td><code>string</code></td><td>text</td><td>Non</td><td>Langage (python, bash, json, etc.).</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Classes CSS.</td></tr>
        </tbody>
      </table>
      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={'bpm.codeblock(code="print(1+1)", language="python")'} language="python" />
      <CodeBlock code={'bpm.codeblock(code="npm run build", language="bash")'} language="python" />
      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
