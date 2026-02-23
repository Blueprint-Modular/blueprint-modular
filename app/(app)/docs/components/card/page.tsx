"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

type CardVariant = "default" | "elevated" | "outlined";

export default function DocCardPage() {
  const [title, setTitle] = useState("Titre de la carte");
  const [subtitle, setSubtitle] = useState("Sous-titre optionnel");
  const [content, setContent] = useState("Contenu de la carte : texte, listes ou composants BPM.");
  const [variant, setVariant] = useState<CardVariant>("default");

  const escapedTitle = title.replace(/"/g, '\\"');
  const escapedSubtitle = subtitle.replace(/"/g, '\\"');
  const escapedContent = content.replace(/"/g, '\\"').replace(/\n/g, " ");
  const pyVariant = variant !== "default" ? `, variant="${variant}"` : "";
  const pythonCode =
    `bpm.card(title="${escapedTitle}", subtitle="${escapedSubtitle}", content="${escapedContent}"${pyVariant})`;
  const { prev, next } = getPrevNext("card");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">Composants</Link> → bpm.card
        </div>
        <h1>bpm.card</h1>
        <p className="doc-description">
          Carte avec titre, sous-titre et contenu (variantes : default, elevated, outlined).
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Mise en page</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div className="w-full max-w-sm">
            <Card title={title || undefined} subtitle={subtitle || undefined} variant={variant}>
              {content}
            </Card>
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre" />
          </div>
          <div className="sandbox-control-group">
            <label>subtitle</label>
            <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Sous-titre" />
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
          <div className="sandbox-control-group">
            <label>variant</label>
            <select value={variant} onChange={(e) => setVariant(e.target.value as CardVariant)}>
              <option value="default">default</option>
              <option value="elevated">elevated</option>
              <option value="outlined">outlined</option>
            </select>
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
            <td><code>title</code></td>
            <td><code>ReactNode</code></td>
            <td>—</td>
            <td>Non</td>
            <td>Titre de la carte.</td>
          </tr>
          <tr>
            <td><code>subtitle</code></td>
            <td><code>ReactNode</code></td>
            <td>—</td>
            <td>Non</td>
            <td>Sous-titre sous le titre.</td>
          </tr>
          <tr>
            <td><code>children</code></td>
            <td><code>ReactNode</code></td>
            <td>—</td>
            <td>Non</td>
            <td>Contenu principal de la carte.</td>
          </tr>
          <tr>
            <td><code>image</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>Non</td>
            <td>URL d’une image en en-tête.</td>
          </tr>
          <tr>
            <td><code>actions</code></td>
            <td><code>ReactNode</code></td>
            <td>—</td>
            <td>Non</td>
            <td>Zone d’actions (boutons) en bas de la carte.</td>
          </tr>
          <tr>
            <td><code>variant</code></td>
            <td><code>default | elevated | outlined</code></td>
            <td>default</td>
            <td>Non</td>
            <td>Style : fond, ombre ou bordure.</td>
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
      <CodeBlock code={'bpm.card(title="Titre", content="Contenu de la carte.")'} language="python" />
      <CodeBlock code={'bpm.card(title="Carte surélevée", subtitle="Sous-titre", content="...", variant="elevated")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
