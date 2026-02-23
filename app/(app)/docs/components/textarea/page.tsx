"use client";

import { useState } from "react";
import Link from "next/link";
import { Textarea, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

export default function DocTextareaPage() {
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [placeholder, setPlaceholder] = useState("Saisir du texte multiligne...");
  const [rows, setRows] = useState(4);
  const [disabled, setDisabled] = useState(false);

  const parts: string[] = [];
  if (label.trim() !== "") parts.push(`label="${label.trim().replace(/"/g, '\\"')}"`);
  if (value.trim() !== "") parts.push(`value="${value.trim().replace(/"/g, '\\"')}"`);
  if (placeholder.trim() !== "" && placeholder !== "Saisir du texte multiligne...")
    parts.push(`placeholder="${placeholder.trim().replace(/"/g, '\\"')}"`);
  if (rows !== 4) parts.push(`rows=${rows}`);
  if (disabled) parts.push("disabled=True");
  const pythonCode = parts.length ? `bpm.textarea(${parts.join(", ")})` : "bpm.textarea()";
  const { prev, next } = getPrevNext("textarea");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">Composants</Link> → bpm.textarea
        </div>
        <h1>bpm.textarea</h1>
        <p className="doc-description">
          Zone de texte multiligne avec label, placeholder et nombre de lignes configurable.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Interaction</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div className="w-full max-w-md">
            <Textarea
              label={label.trim() || undefined}
              value={value}
              onChange={setValue}
              placeholder={placeholder}
              rows={rows}
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
              placeholder="ex. Commentaire"
            />
          </div>
          <div className="sandbox-control-group">
            <label>placeholder</label>
            <input
              type="text"
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
              placeholder="Saisir du texte..."
            />
          </div>
          <div className="sandbox-control-group">
            <label>rows</label>
            <input
              type="number"
              min={2}
              max={20}
              value={rows}
              onChange={(e) => setRows(Number(e.target.value) || 4)}
            />
          </div>
          <div className="sandbox-control-group">
            <label>disabled</label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={disabled}
                onChange={(e) => setDisabled(e.target.checked)}
              />
              Désactivé
            </label>
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
            <td><code>label</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>Non</td>
            <td>Label au-dessus de la zone.</td>
          </tr>
          <tr>
            <td><code>value</code></td>
            <td><code>string</code></td>
            <td>&quot;&quot;</td>
            <td>Non</td>
            <td>Valeur affichée (Python : valeur initiale ; retourne la valeur courante).</td>
          </tr>
          <tr>
            <td><code>placeholder</code></td>
            <td><code>string</code></td>
            <td>&quot;&quot;</td>
            <td>Non</td>
            <td>Texte d&apos;indication quand la zone est vide.</td>
          </tr>
          <tr>
            <td><code>rows</code></td>
            <td><code>number</code></td>
            <td>4</td>
            <td>Non</td>
            <td>Nombre de lignes visibles (hauteur).</td>
          </tr>
          <tr>
            <td><code>disabled</code></td>
            <td><code>boolean</code></td>
            <td>false</td>
            <td>Non</td>
            <td>Désactive la zone.</td>
          </tr>
          <tr>
            <td><code>key</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>Non</td>
            <td>Clé pour l&apos;état (Python). Si absent, une clé unique est générée.</td>
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
      <CodeBlock code="bpm.textarea()" language="python" />
      <CodeBlock code={'bpm.textarea(label="Commentaire", placeholder="Votre message...", rows=5)'} language="python" />
      <CodeBlock code={'bpm.textarea(label="Description", value="", rows=6)'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
