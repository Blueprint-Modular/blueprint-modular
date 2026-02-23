"use client";

import { useState } from "react";
import Link from "next/link";
import { Accordion, CodeBlock } from "@/components/bpm";
import type { AccordionSection } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

const DEMO_SECTIONS: AccordionSection[] = [
  { id: "sec1", title: "Section 1", content: "Contenu de la première section. Texte, listes ou composants BPM." },
  { id: "sec2", title: "Section 2", content: "Contenu de la deuxième section. Vous pouvez ouvrir plusieurs sections si allowMultiple est true." },
  { id: "sec3", title: "Section 3", content: "Contenu de la troisième section." },
];

export default function DocAccordionPage() {
  const [allowMultiple, setAllowMultiple] = useState(false);

  const pythonCode =
    `sections = [\n` +
    `  {"title": "Section 1", "content": "Contenu 1"},\n` +
    `  {"title": "Section 2", "content": "Contenu 2"},\n` +
    `]\nbpm.accordion(sections=sections` +
    (allowMultiple ? ", allow_multiple=True" : "") +
    ")";
  const { prev, next } = getPrevNext("accordion");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">Composants</Link> → bpm.accordion
        </div>
        <h1>bpm.accordion</h1>
        <p className="doc-description">
          Accordéon : sections repliables (un ou plusieurs ouverts selon allowMultiple).
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Mise en page</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div className="w-full max-w-md">
            <Accordion sections={DEMO_SECTIONS} allowMultiple={allowMultiple} />
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>allowMultiple</label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allowMultiple}
                onChange={(e) => setAllowMultiple(e.target.checked)}
              />
              Plusieurs sections ouvertes
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
            <td><code>sections</code></td>
            <td><code>AccordionSection[]</code></td>
            <td>[]</td>
            <td>Non</td>
            <td>Liste de sections (title, content, id optionnel).</td>
          </tr>
          <tr>
            <td><code>allowMultiple</code></td>
            <td><code>boolean</code></td>
            <td>false</td>
            <td>Non</td>
            <td>Autoriser plusieurs sections ouvertes en même temps.</td>
          </tr>
          <tr>
            <td><code>defaultOpenIds</code></td>
            <td><code>string[]</code></td>
            <td>[]</td>
            <td>Non</td>
            <td>Ids des sections ouvertes au chargement.</td>
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
      <CodeBlock
        code={'bpm.accordion(sections=[\n  {"title": "FAQ 1", "content": "Réponse 1"},\n  {"title": "FAQ 2", "content": "Réponse 2"},\n])'}
        language="python"
      />
      <CodeBlock
        code={'bpm.accordion(sections=sections, allow_multiple=True, default_open_ids=["sec1"])'}
        language="python"
      />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
