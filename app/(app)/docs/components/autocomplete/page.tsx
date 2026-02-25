"use client";

import { useState } from "react";
import Link from "next/link";
import { Autocomplete, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

const opts = [
  { value: "paris", label: "Paris" },
  { value: "lyon", label: "Lyon" },
  { value: "marseille", label: "Marseille" },
  { value: "bordeaux", label: "Bordeaux" },
  { value: "nantes", label: "Nantes" },
  { value: "toulouse", label: "Toulouse" },
  { value: "lille", label: "Lille" },
  { value: "strasbourg", label: "Strasbourg" },
];

export default function DocAutocompletePage() {
  const [value, setValue] = useState("");
  const { prev, next } = getPrevNext("autocomplete");

  const escapedValue = value.replace(/"/g, '\\"');
  const pythonCode = `bpm.autocomplete(options=[...], value="${escapedValue}", onChange=...)`;

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">Composants</Link> → bpm.autocomplete
        </div>
        <h1>bpm.autocomplete</h1>
        <p className="doc-description">
          Champ de saisie avec suggestions (liste filtrée). Idéal pour recherche de ville, produit, etc.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Interaction</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-xl border" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}>
        <p className="text-sm mb-3" style={{ color: "var(--bpm-text-secondary)" }}>
          Tester ce composant en direct dans le sandbox :
        </p>
        <Link href="/sandbox?component=autocomplete" className="doc-cta inline-block">
          Ouvrir dans le sandbox
        </Link>
      </div>

      <div className="sandbox-container mt-6">
        <div className="sandbox-preview" style={{ maxWidth: 280 }}>
          <Autocomplete
            label="Ville"
            placeholder="Rechercher..."
            value={value}
            onChange={setValue}
            options={opts}
          />
        </div>
        <div className="sandbox-controls mt-3">
          <div className="sandbox-control-group">
            <label>value (affiché)</label>
            <input type="text" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Valeur" readOnly className="opacity-80" />
          </div>
        </div>
        <div className="sandbox-code mt-3">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>Copier</button>
          </div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>

      <h2 className="text-lg font-semibold mt-8 mb-2">Props</h2>
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
            <td><code>options</code></td>
            <td><code>AutocompleteOption[]</code></td>
            <td>—</td>
            <td>Oui</td>
            <td>Liste des options ({`{ value, label }`}).</td>
          </tr>
          <tr>
            <td><code>value</code></td>
            <td><code>string</code></td>
            <td>&quot;&quot;</td>
            <td>Non</td>
            <td>Valeur courante (contrôlée).</td>
          </tr>
          <tr>
            <td><code>onChange</code></td>
            <td><code>(value: string) =&gt; void</code></td>
            <td>—</td>
            <td>Non</td>
            <td>Callback à la sélection ou saisie.</td>
          </tr>
          <tr>
            <td><code>label</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>Non</td>
            <td>Libellé au-dessus du champ.</td>
          </tr>
          <tr>
            <td><code>placeholder</code></td>
            <td><code>string</code></td>
            <td>&quot;&quot;</td>
            <td>Non</td>
            <td>Texte d&apos;indication dans le champ.</td>
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
      <CodeBlock code={'bpm.autocomplete(label="Ville", options=[{"value": "paris", "label": "Paris"}, ...], value=..., onChange=...)'} language="python" />
      <CodeBlock code={'bpm.autocomplete(placeholder="Rechercher un produit...", options=product_options)'} language="python" />

      <nav className="doc-pagination mt-12">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
