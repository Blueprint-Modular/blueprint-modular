"use client";

import { useState } from "react";
import Link from "next/link";
import { Skeleton, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

type SkeletonVariant = "rectangular" | "circular" | "text";

export default function DocSkeletonPage() {
  const [variant, setVariant] = useState<SkeletonVariant>("rectangular");
  const [width, setWidth] = useState<string>("200");
  const [height, setHeight] = useState<string>("24");

  const wNum = width.trim() ? Number(width) || undefined : undefined;
  const hNum = height.trim() ? Number(height) || undefined : undefined;
  const parts: string[] = [];
  if (wNum != null) parts.push(`width=${wNum}`);
  if (hNum != null) parts.push(`height=${hNum}`);
  if (variant !== "rectangular") parts.push(`variant="${variant}"`);
  const pythonCode = `bpm.skeleton(${parts.join(", ")})`;
  const { prev, next } = getPrevNext("skeleton");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">Composants</Link> → bpm.skeleton
        </div>
        <h1>bpm.skeleton</h1>
        <p className="doc-description">
          Placeholder de chargement (skeleton) avec variantes rectangulaire, circulaire ou texte.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Affichage de données</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div className="flex flex-wrap items-end gap-6">
            <Skeleton variant={variant} width={wNum} height={hNum} />
            <div className="flex flex-col gap-2">
              <Skeleton variant="text" width={180} height={16} />
              <Skeleton variant="text" width={140} height={16} />
              <Skeleton variant="text" width={160} height={16} />
            </div>
            <Skeleton variant="circular" width={48} height={48} />
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>variant</label>
            <select value={variant} onChange={(e) => setVariant(e.target.value as SkeletonVariant)}>
              <option value="rectangular">rectangular</option>
              <option value="circular">circular</option>
              <option value="text">text</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>width (px)</label>
            <input
              type="text"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="ex. 200"
            />
          </div>
          <div className="sandbox-control-group">
            <label>height (px)</label>
            <input
              type="text"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="ex. 24"
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
            <td><code>variant</code></td>
            <td><code>rectangular | circular | text</code></td>
            <td>rectangular</td>
            <td>Non</td>
            <td>Forme du skeleton (rectangle, cercle, ligne de texte).</td>
          </tr>
          <tr>
            <td><code>width</code></td>
            <td><code>number | string</code></td>
            <td>—</td>
            <td>Non</td>
            <td>Largeur (px si number, sinon valeur CSS).</td>
          </tr>
          <tr>
            <td><code>height</code></td>
            <td><code>number | string</code></td>
            <td>—</td>
            <td>Non</td>
            <td>Hauteur (px si number, sinon valeur CSS).</td>
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
      <CodeBlock code={'bpm.skeleton(width=200, height=24)\nbpm.skeleton(variant="circular", width=48, height=48)'} language="python" />
      <CodeBlock code={'# Lignes de texte (chargement)\nfor _ in range(3):\n    bpm.skeleton(variant="text", width=180, height=16)'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
