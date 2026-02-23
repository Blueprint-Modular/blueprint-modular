"use client";

import Link from "next/link";
import { HighlightBox, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

export default function DocHighlightBoxPage() {
  const { prev, next } = getPrevNext("highlight-box");

  const exampleRtb = [
    "+30% protéines vs classique",
    "Protéines pois & blé français",
    "Format tranché pratique",
    "Faible MG",
  ];
  const exampleCible = "Usage quotidien, entrée de gamme, recrutement large";

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">Composants</Link> → bpm.highlight-box
        </div>
        <h1>bpm.highlight-box</h1>
        <p className="doc-description">
          Carte avec barre latérale (numéro + label) et panneau de contenu structuré : titre, moment (optionnel), RTB et Cible.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Mise en page</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div className="w-full max-w-xl">
            <HighlightBox
              value={1}
              label="DAILY"
              title="Tranché hyperprotéiné (type dinde / poulet)"
              momentDescription="base quotidienne — petit-déjeuner salé, sandwich, collation"
              rtbPoints={exampleRtb}
              targetPoints={exampleCible}
            />
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>Python</span>
          </div>
          <pre><code>{`bpm.highlight_box(
  value=1,
  label="DAILY",
  title="Tranché hyperprotéiné (type dinde / poulet)",
  moment_description="base quotidienne — petit-déjeuner salé, sandwich, collation",
  rtb_points=["+30% protéines vs classique", "Protéines pois & blé français", "Format tranché pratique", "Faible MG"],
  target_points="Usage quotidien, entrée de gamme, recrutement large"
)`}</code></pre>
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
            <td><code>value</code></td>
            <td><code>number</code></td>
            <td>—</td>
            <td>Oui</td>
            <td>Numéro affiché dans la barre gauche.</td>
          </tr>
          <tr>
            <td><code>label</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>Oui</td>
            <td>Texte sous le numéro (ex. &quot;DAILY&quot;).</td>
          </tr>
          <tr>
            <td><code>title</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>Oui</td>
            <td>Titre principal du contenu.</td>
          </tr>
          <tr>
            <td><code>momentDescription</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>Non</td>
            <td>Texte affiché après le libellé &quot;Moment :&quot; (en italique, gris).</td>
          </tr>
          <tr>
            <td><code>rtbPoints</code></td>
            <td><code>string[]</code></td>
            <td>—</td>
            <td>Non</td>
            <td>Points RTB (affichés séparés par ·).</td>
          </tr>
          <tr>
            <td><code>targetPoints</code></td>
            <td><code>string | string[]</code></td>
            <td>—</td>
            <td>Non</td>
            <td>Points Cible (chaîne ou liste).</td>
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

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemple minimal</h2>
      <CodeBlock
        code={'bpm.highlight_box(value=1, label="DAILY", title="Mon produit")'}
        language="python"
      />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
