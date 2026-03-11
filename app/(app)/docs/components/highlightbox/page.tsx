"use client";

import { useState } from "react";
import Link from "next/link";
import { HighlightBox, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

export default function DocHighlightboxPage() {
  const [value, setValue] = useState(1);
  const [label, setLabel] = useState("DAILY");
  const [title, setTitle] = useState("Tranché hyperprotéiné");
  const [momentDescription, setMomentDescription] = useState("base quotidienne");
  const [barColor, setBarColor] = useState("#212121");

  const pyValue = value !== 1 ? `value=${value}, ` : "";
  const pyLabel = `label="${label.replace(/"/g, '\\"')}"`;
  const pyTitle = `, title="${title.replace(/"/g, '\\"')}"`;
  const pyMoment = momentDescription ? `, moment_description="${momentDescription.replace(/"/g, '\\"')}"` : "";
  const pyBar = barColor !== "#212121" ? `, bar_color="${barColor}"` : "";
  const pythonCode = `bpm.highlightBox(${pyValue}${pyLabel}${pyTitle}${pyMoment}${pyBar})`;
  const { prev, next } = getPrevNext("highlightbox");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.highlightBox</div>
        <h1>bpm.highlightBox</h1>
        <p className="doc-description">Carte avec barre latérale (numéro + label) et contenu structuré (titre, moment, RTB, cible).</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Mise en page</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div style={{ maxWidth: 400 }}>
            <HighlightBox
              value={value}
              label={label}
              title={title}
              momentDescription={momentDescription || undefined}
              rtbPoints={["Point 1", "Point 2"]}
              targetPoints="Cible exemple"
              barColor={barColor}
            />
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>value</label>
            <input type="number" min={1} value={value} onChange={(e) => setValue(Number(e.target.value) || 1)} />
          </div>
          <div className="sandbox-control-group">
            <label>label</label>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>momentDescription</label>
            <input type="text" value={momentDescription} onChange={(e) => setMomentDescription(e.target.value)} placeholder="Optionnel" />
          </div>
          <div className="sandbox-control-group">
            <label>barColor</label>
            <input type="text" value={barColor} onChange={(e) => setBarColor(e.target.value)} placeholder="#212121" />
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
          <tr><th>Prop</th><th>Type</th><th>Défaut</th><th>Requis</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>value</code></td><td><code>number</code></td><td>—</td><td>Oui</td><td>Numéro affiché dans la barre gauche.</td></tr>
          <tr><td><code>label</code></td><td><code>string</code></td><td>—</td><td>Oui</td><td>Texte sous le numéro (ex. DAILY).</td></tr>
          <tr><td><code>title</code></td><td><code>string</code></td><td>—</td><td>Oui</td><td>Titre principal du contenu.</td></tr>
          <tr><td><code>momentDescription</code></td><td><code>string | null</code></td><td>—</td><td>Non</td><td>Description moment (italique, gris).</td></tr>
          <tr><td><code>rtbPoints</code></td><td><code>string[] | null</code></td><td>—</td><td>Non</td><td>Points RTB (séparés par ·).</td></tr>
          <tr><td><code>targetPoints</code></td><td><code>string | string[] | null</code></td><td>—</td><td>Non</td><td>Points cible.</td></tr>
          <tr><td><code>barColor</code></td><td><code>string | null</code></td><td>#212121</td><td>Non</td><td>Couleur de la barre latérale.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={'bpm.highlightBox(value=1, label="DAILY", title="Produit phare")'} language="python" />
      <CodeBlock code={'bpm.highlightBox(value=2, label="WEEKLY", title="Objectif", moment_description="ce mois", bar_color="#00a3e2")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
