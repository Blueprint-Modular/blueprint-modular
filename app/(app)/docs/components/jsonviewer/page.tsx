"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { JsonViewer, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

const DEFAULT_JSON = `{
  "user": {
    "name": "Marie Dupont",
    "email": "marie@example.com",
    "active": true,
    "tags": ["admin", "editor"]
  },
  "stats": { "views": 1250, "likes": 42 },
  "items": [1, 2, 3]
}`;

export default function DocJsonViewerPage() {
  const [jsonInput, setJsonInput] = useState(DEFAULT_JSON);
  const [defaultExpandedLevel, setDefaultExpandedLevel] = useState(1);
  const [maxHeight, setMaxHeight] = useState(400);

  const { parsed, error } = useMemo(() => {
    const t = jsonInput.trim();
    if (!t) return { parsed: null, error: "Saisissez du JSON" };
    try {
      const p = JSON.parse(t);
      return { parsed: p, error: null };
    } catch (e) {
      return { parsed: null, error: (e as Error).message };
    }
  }, [jsonInput]);

  const pythonCode = `bpm.jsonviewer(data=${JSON.stringify(parsed ?? {})}, default_expanded_level=${defaultExpandedLevel}, max_height=${maxHeight})`;

  const { prev, next } = getPrevNext("jsonviewer");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">Composants</Link> → bpm.jsonviewer
        </div>
        <h1>bpm.jsonviewer</h1>
        <p className="doc-description">
          Affichage JSON formaté et repliable.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Affichage de données</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview" style={{ minHeight: 120 }}>
          {error ? (
            <div
              className="p-3 rounded-lg text-sm"
              style={{
                background: "var(--bpm-bg-secondary)",
                border: "1px solid var(--bpm-accent)",
                color: "var(--bpm-text-primary)",
              }}
            >
              JSON invalide : {error}
            </div>
          ) : parsed !== null ? (
            <JsonViewer
              data={parsed}
              defaultExpandedLevel={defaultExpandedLevel}
              maxHeight={maxHeight}
            />
          ) : (
            <span style={{ color: "var(--bpm-text-secondary)" }}>Saisissez du JSON à gauche.</span>
          )}
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>data (JSON)</label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              rows={12}
              className="font-mono text-sm"
              style={{
                width: "100%",
                padding: "8px 10px",
                border: "1px solid var(--bpm-border)",
                borderRadius: 6,
                background: "var(--bpm-surface)",
                color: "var(--bpm-text-primary)",
              }}
              spellCheck={false}
            />
          </div>
          <div className="sandbox-control-group">
            <label>defaultExpandedLevel</label>
            <select
              value={defaultExpandedLevel}
              onChange={(e) => setDefaultExpandedLevel(Number(e.target.value))}
              style={{
                width: "100%",
                padding: "6px 10px",
                border: "1px solid var(--bpm-border)",
                borderRadius: 6,
                background: "var(--bpm-surface)",
                color: "var(--bpm-text-primary)",
              }}
            >
              <option value={0}>0 (tout replié)</option>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>maxHeight (px)</label>
            <input
              type="number"
              value={maxHeight}
              onChange={(e) => setMaxHeight(Number(e.target.value) || 400)}
              min={100}
              max={800}
              step={50}
              style={{
                width: "100%",
                padding: "6px 10px",
                border: "1px solid var(--bpm-border)",
                borderRadius: 6,
                background: "var(--bpm-surface)",
                color: "var(--bpm-text-primary)",
              }}
            />
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
            <td><code>data</code></td>
            <td><code>object | string</code></td>
            <td>—</td>
            <td>Oui</td>
            <td>Objet JavaScript ou chaîne JSON à afficher.</td>
          </tr>
          <tr>
            <td><code>defaultExpandedLevel</code></td>
            <td><code>number</code></td>
            <td><code>1</code></td>
            <td>Non</td>
            <td>Nombre de niveaux ouverts par défaut (0 = tout replié).</td>
          </tr>
          <tr>
            <td><code>maxHeight</code></td>
            <td><code>number</code></td>
            <td><code>400</code></td>
            <td>Non</td>
            <td>Hauteur max en px (scroll si dépassement).</td>
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
      <CodeBlock code={'bpm.jsonviewer(data={"user": {"name": "Alice"}, "count": 42})'} language="python" />
      <CodeBlock code="bpm.jsonviewer(data=my_dict, default_expanded_level=0, max_height=300)" language="python" />

      <div className="mt-6 p-4 rounded-xl border" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}>
        <p className="text-sm mb-3" style={{ color: "var(--bpm-text-secondary)" }}>
          Tester en conditions réelles dans le sandbox :
        </p>
        <Link href="/sandbox?component=jsonviewer" className="doc-cta inline-block">
          Ouvrir dans le sandbox
        </Link>
      </div>

      <nav className="doc-pagination mt-12">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
