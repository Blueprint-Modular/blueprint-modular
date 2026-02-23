"use client";

import { useState } from "react";
import Link from "next/link";
import { Tabs, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

const DEMO_TABS = [
  { label: "Vue générale", content: <p>Contenu de la vue générale : KPIs, graphiques, résumé.</p> },
  { label: "Détails", content: <p>Contenu des détails : tableau, filtres, export.</p> },
  { label: "Historique", content: <p>Contenu de l&apos;historique : timeline, événements.</p> },
];

export default function DocTabsPage() {
  const [defaultTab, setDefaultTab] = useState(0);

  const pythonCode = `bpm.tabs([
    {"label": "Vue générale", "content": vue_generale_fn},
    {"label": "Détails", "content": details_fn},
    {"label": "Historique", "content": historique_fn},
], default_tab=${defaultTab})`;

  const { prev, next } = getPrevNext("tabs");

  return (
    <div className="max-w-4xl">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">Documentation → Composants → bpm.tabs</div>
        <h1>bpm.tabs</h1>
        <p className="doc-description">
          Onglets pour organiser le contenu en sections.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Mise en page</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Tabs
            tabs={DEMO_TABS}
            defaultTab={defaultTab}
            onChange={() => {}}
          />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>defaultTab (0–2)</label>
            <input
              type="number"
              min={0}
              max={2}
              value={defaultTab}
              onChange={(e) => setDefaultTab(Math.max(0, Math.min(2, Number(e.target.value) || 0)))}
            />
          </div>
          <p className="text-sm mt-2" style={{ color: "var(--bpm-text-secondary)" }}>
            Onglet actif : {DEMO_TABS[defaultTab]?.label ?? defaultTab}
          </p>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(pythonCode)}
            >
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
            <td><code>tabs</code></td>
            <td><code>(Tab | string)[]</code></td>
            <td><code>[]</code></td>
            <td>Oui</td>
            <td>Liste d’onglets (label, content optionnel, key).</td>
          </tr>
          <tr>
            <td><code>defaultTab</code></td>
            <td><code>number</code></td>
            <td><code>0</code></td>
            <td>Non</td>
            <td>Index de l’onglet affiché par défaut.</td>
          </tr>
          <tr>
            <td><code>onChange</code></td>
            <td><code>(index: number) =&gt; void</code></td>
            <td>—</td>
            <td>Non</td>
            <td>Callback au changement d’onglet.</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock
        code={`tabs = [
    {"label": "Résumé", "content": bpm.panel("Résumé du rapport...")},
    {"label": "Données", "content": bpm.table(df)},
]
bpm.tabs(tabs, default_tab=0)`}
        language="python"
      />
      <CodeBlock
        code={`# Onglets en chaînes (sans contenu)
bpm.tabs(["Étape 1", "Étape 2", "Étape 3"], default_tab=1)`}
        language="python"
      />

      <nav className="doc-pagination">
        {prev ? (
          <Link href={`/docs/components/${prev}`}>← bpm.{prev}</Link>
        ) : <span />}
        {next ? (
          <Link href={`/docs/components/${next}`}>bpm.{next} →</Link>
        ) : <span />}
      </nav>
    </div>
  );
}
