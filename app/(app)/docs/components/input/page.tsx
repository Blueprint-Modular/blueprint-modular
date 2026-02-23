"use client";

import { useState } from "react";
import Link from "next/link";
import { Input, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

const INPUT_TYPES = ["text", "email", "password", "number", "search"] as const;

export default function DocInputPage() {
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [placeholder, setPlaceholder] = useState("Saisir du texte...");
  const [type, setType] = useState<(typeof INPUT_TYPES)[number]>("text");
  const [disabled, setDisabled] = useState(false);

  const parts: string[] = [];
  if (label.trim() !== "") parts.push(`label="${label.trim().replace(/"/g, '\\"')}"`);
  if (value.trim() !== "") parts.push(`value="${value.trim().replace(/"/g, '\\"')}"`);
  if (placeholder.trim() !== "" && placeholder !== "Saisir du texte...")
    parts.push(`placeholder="${placeholder.trim().replace(/"/g, '\\"')}"`);
  if (type !== "text") parts.push(`type="${type}"`);
  if (disabled) parts.push("disabled=True");
  const pythonCode = parts.length ? `bpm.input(${parts.join(", ")})` : "bpm.input()";
  const { prev, next } = getPrevNext("input");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">Composants</Link> → bpm.input
        </div>
        <h1>bpm.input</h1>
        <p className="doc-description">
          Champ de saisie texte une ligne (label, placeholder, type : text, email, password, number, search).
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Interaction</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div className="w-full max-w-sm">
            <Input
              label={label.trim() || undefined}
              value={value}
              onChange={setValue}
              placeholder={placeholder}
              type={type}
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
              placeholder="ex. Email"
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
            <label>type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as (typeof INPUT_TYPES)[number])}
            >
              {INPUT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
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
            <td>Label au-dessus du champ.</td>
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
            <td>Texte d&apos;indication quand le champ est vide.</td>
          </tr>
          <tr>
            <td><code>type</code></td>
            <td><code>&quot;text&quot; | &quot;email&quot; | &quot;password&quot; | &quot;number&quot; | &quot;search&quot;</code></td>
            <td>text</td>
            <td>Non</td>
            <td>Type HTML du champ.</td>
          </tr>
          <tr>
            <td><code>disabled</code></td>
            <td><code>boolean</code></td>
            <td>false</td>
            <td>Non</td>
            <td>Désactive le champ.</td>
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
      <CodeBlock code="bpm.input()" language="python" />
      <CodeBlock code={'bpm.input(label="Email", placeholder="vous@exemple.fr", type="email")'} language="python" />
      <CodeBlock code={'bpm.input(label="Mot de passe", type="password", placeholder="••••••••")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
