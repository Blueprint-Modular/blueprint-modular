"use client";

import { useState } from "react";
import Link from "next/link";
import { Column, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

export default function DocColumnPage() {
  const [columns, setColumns] = useState(2);
  const [gap, setGap] = useState("1rem");

  const gapInput = gap.trim();
  const gapVal: number | string = gapInput ? (Number(gapInput) || gapInput) : "1rem";
  const parts: string[] = columns === 2 ? [] : [`columns=${columns}`];
  if (String(gapVal) !== "1rem") parts.push(typeof gapVal === "number" ? `gap=${gapVal}` : `gap="${String(gapVal).replace(/"/g, '\\"')}"`);
  const pythonCode = parts.length === 0 ? "bpm.column()" : `bpm.column(${parts.join(", ")})`;
  const { prev, next } = getPrevNext("column");

  const placeholders = ["Col. 1", "Col. 2", "Col. 3", "Col. 4", "Col. 5", "Col. 6"].slice(0, Math.max(columns * 2, 2));

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">Composants</Link> → bpm.column
        </div>
        <h1>bpm.column</h1>
        <p className="doc-description">
          Divise la page en 1, 2, 3 ou plus colonnes. Chaque enfant du composant occupe une cellule de la grille.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Mise en page</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div className="w-full">
            <Column columns={columns} gap={gapVal}>
              {placeholders.map((label) => (
                <div
                  key={label}
                  className="rounded-lg border p-4 text-sm"
                  style={{
                    borderColor: "var(--bpm-border)",
                    background: "var(--bpm-bg-secondary)",
                    color: "var(--bpm-text-secondary)",
                  }}
                >
                  {label}
                </div>
              ))}
            </Column>
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>columns</label>
            <select value={columns} onChange={(e) => setColumns(Number(e.target.value))}>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
              <option value={6}>6</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>gap</label>
            <input
              type="text"
              value={gap}
              onChange={(e) => setGap(e.target.value)}
              placeholder="ex. 1rem ou 16"
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
            <td><code>columns</code></td>
            <td><code>number</code></td>
            <td>2</td>
            <td>Non</td>
            <td>Nombre de colonnes (1 à 12).</td>
          </tr>
          <tr>
            <td><code>gap</code></td>
            <td><code>number | string</code></td>
            <td>1rem</td>
            <td>Non</td>
            <td>Espacement entre les colonnes (px si number, sinon valeur CSS).</td>
          </tr>
          <tr>
            <td><code>children</code></td>
            <td><code>ReactNode</code></td>
            <td>—</td>
            <td>Non</td>
            <td>Contenu de chaque colonne (chaque enfant = une cellule).</td>
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
      <CodeBlock code="bpm.column()" language="python" />
      <CodeBlock code="bpm.column(columns=3)" language="python" />
      <CodeBlock code={'bpm.column(columns=4, gap="1.5rem")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
