"use client";

import { useState } from "react";
import Link from "next/link";
import { Table, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

const DEMO_DATA = [
  { Produit: "Widget A", Prix: 29.99, Stock: 142, Statut: "En stock" },
  { Produit: "Widget B", Prix: 49.99, Stock: 38, Statut: "Stock bas" },
  { Produit: "Widget C", Prix: 9.99, Stock: 500, Statut: "En stock" },
  { Produit: "Widget D", Prix: 79.99, Stock: 0, Statut: "Rupture" },
  { Produit: "Widget E", Prix: 19.99, Stock: 210, Statut: "En stock" },
];

const COLUMNS = [
  { key: "Produit", label: "Produit" },
  { key: "Prix", label: "Prix", decimals: 2 },
  { key: "Stock", label: "Stock" },
  { key: "Statut", label: "Statut" },
];

export default function DocTablePage() {
  const [striped, setStriped] = useState(true);
  const [hover, setHover] = useState(true);
  const [defaultSortColumn, setDefaultSortColumn] = useState<string | null>("Produit");
  const [selectedRow, setSelectedRow] = useState<Record<string, unknown> | null>(null);
  const [valueLocale, setValueLocale] = useState<"fr-FR" | "en-US" | "de-DE">("fr-FR");
  const [valueDecimals, setValueDecimals] = useState(0);
  const [valueGrouping, setValueGrouping] = useState(true);

  const pythonCode =
    "import bpm\nimport pandas as pd\n\ndf = pd.DataFrame({\n  \"Produit\": [\"Widget A\", \"Widget B\", \"Widget C\"],\n  \"Prix\": [29.99, 49.99, 9.99],\n  \"Stock\": [142, 38, 500],\n})\n\nbpm.table(df, striped=" +
    String(striped) +
    ", hover=" +
    String(hover) +
    (valueLocale !== "fr-FR" ? `, value_locale="${valueLocale}"` : "") +
    (valueDecimals !== 0 ? `, value_decimals=${valueDecimals}` : "") +
    (!valueGrouping ? ", value_grouping=False" : "") +
    ")";

  const { prev, next } = getPrevNext("table");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.table</div>
        <h1>bpm.table</h1>
        <p className="doc-description">
          Tableau de données avec tri, lignes alternées, survol et lignes cliquables pour accéder au détail.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Affichage de données</span>
          <span className="doc-reading-time">⏱ 3 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Table
            columns={COLUMNS}
            data={DEMO_DATA}
            striped={striped}
            hover={hover}
            defaultSortColumn={defaultSortColumn}
            defaultSortDirection="asc"
            onRowClick={(row) => setSelectedRow(row)}
            valueLocale={valueLocale}
            valueDecimals={valueDecimals}
            valueGrouping={valueGrouping}
          />
          {selectedRow && (
            <div className="mt-3 p-3 rounded-lg text-sm border" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-secondary)" }}>
              <strong>Ligne cliquée :</strong> {String(selectedRow.Produit ?? "")} — {String(selectedRow.Prix ?? "")} € — Stock {String(selectedRow.Stock ?? "")} — {String(selectedRow.Statut ?? "")}
            </div>
          )}
          {!selectedRow && (
            <p className="mt-2 text-xs" style={{ color: "var(--bpm-text-secondary)" }}>Cliquez sur une ligne pour afficher le détail.</p>
          )}
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>striped</label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={striped}
                onChange={(e) => setStriped(e.target.checked)}
              />
              {striped ? "Oui" : "Non"}
            </label>
          </div>
          <div className="sandbox-control-group">
            <label>hover</label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={hover}
                onChange={(e) => setHover(e.target.checked)}
              />
              {hover ? "Oui" : "Non"}
            </label>
          </div>
          <div className="sandbox-control-group">
            <label>Tri par défaut</label>
            <select
              value={defaultSortColumn ?? ""}
              onChange={(e) => setDefaultSortColumn(e.target.value || null)}
            >
              <option value="">Aucun</option>
              <option value="Produit">Produit</option>
              <option value="Prix">Prix</option>
              <option value="Stock">Stock</option>
              <option value="Statut">Statut</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>valueLocale</label>
            <select value={valueLocale} onChange={(e) => setValueLocale(e.target.value as "fr-FR" | "en-US" | "de-DE")}>
              <option value="fr-FR">fr-FR (1 000,50)</option>
              <option value="en-US">en-US (1,000.50)</option>
              <option value="de-DE">de-DE (1.000,50)</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>valueDecimals</label>
            <input
              type="number"
              min={0}
              max={10}
              value={valueDecimals}
              onChange={(e) => setValueDecimals(Number(e.target.value) || 0)}
            />
          </div>
          <div className="sandbox-control-group">
            <label>valueGrouping</label>
            <select value={valueGrouping ? "true" : "false"} onChange={(e) => setValueGrouping(e.target.value === "true")}>
              <option value="true">true (1 000,50)</option>
              <option value="false">false (1000,50)</option>
            </select>
          </div>
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
            <td><code>columns</code></td>
            <td><code>TableColumn[]</code></td>
            <td>—</td>
            <td>Oui</td>
            <td>
              <code>key</code>, <code>label</code> ; optionnel : <code>align</code>, <code>render</code> (pas <code>renderCell</code>),
              <code>decimals</code>, <code>noWrap</code>, <code>className</code>. Cellule custom : <code>render: (value, row) =&gt; …</code>
            </td>
          </tr>
          <tr>
            <td><code>data</code></td>
            <td><code>Record&lt;string, unknown&gt;[]</code></td>
            <td>—</td>
            <td>Oui</td>
            <td>Lignes du tableau. Interdit : JSX dans <code>data[]</code> — utiliser <code>render</code> sur la colonne.</td>
          </tr>
          <tr>
            <td><code>striped</code></td>
            <td><code>boolean</code></td>
            <td><code>true</code></td>
            <td>Non</td>
            <td>Lignes alternées.</td>
          </tr>
          <tr>
            <td><code>hover</code></td>
            <td><code>boolean</code></td>
            <td><code>true</code></td>
            <td>Non</td>
            <td>Surbrillance au survol.</td>
          </tr>
          <tr>
            <td><code>onRowClick</code></td>
            <td><code>(row) =&gt; void</code></td>
            <td>—</td>
            <td>Non</td>
            <td>Callback au clic sur une ligne.</td>
          </tr>
          <tr>
            <td><code>defaultSortColumn</code></td>
            <td><code>string | null</code></td>
            <td><code>null</code></td>
            <td>Non</td>
            <td>Colonne de tri initiale.</td>
          </tr>
          <tr>
            <td><code>defaultSortDirection</code></td>
            <td><code>&apos;asc&apos; | &apos;desc&apos;</code></td>
            <td><code>&apos;asc&apos;</code></td>
            <td>Non</td>
            <td>Direction du tri initial.</td>
          </tr>
          <tr>
            <td><code>valueLocale</code></td>
            <td><code>string</code></td>
            <td>fr-FR</td>
            <td>Non</td>
            <td>Locale pour formater les nombres (ex. fr-FR → 1 000,50, en-US → 1,000.50).</td>
          </tr>
          <tr>
            <td><code>valueDecimals</code></td>
            <td><code>number</code></td>
            <td>0</td>
            <td>Non</td>
            <td>Décimales par défaut pour les cellules numériques. Surcharge possible par colonne (<code>decimals</code>).</td>
          </tr>
          <tr>
            <td><code>valueGrouping</code></td>
            <td><code>boolean</code></td>
            <td>true</td>
            <td>Non</td>
            <td>Séparateur de milliers (false = 1000,50 sans espace).</td>
          </tr>
          <tr>
            <td><code>emptyMessage</code></td>
            <td><code>string</code></td>
            <td>« Aucune donnée disponible »</td>
            <td>Non</td>
            <td>Message si <code>data</code> vide.</td>
          </tr>
          <tr>
            <td><code>name</code>, <code>keyColumn</code>, <code>minWidth</code>, <code>trackContext</code>, <code>className</code></td>
            <td>voir <code>Table.tsx</code></td>
            <td>—</td>
            <td>Non</td>
            <td>Contexte IA, largeur min., clé de ligne, etc.</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock
        code={"bpm.table(df, striped=True, hover=True)\n# Clic sur une ligne pour ouvrir le détail\nbpm.table(df, on_row_click=lambda row: bpm.write(row[\"id\"]))"}
        language="python"
      />
      <CodeBlock
        code={'# Tri initial par colonne "Prix" décroissant\nbpm.table(df, default_sort_column="Prix", default_sort_direction="desc")'}
        language="python"
      />
      <CodeBlock
        code={'# Format des nombres (comme bpm.metric)\nbpm.table(df, value_locale="en-US", value_decimals=2, value_grouping=True)'}
        language="python"
      />
      <CodeBlock
        code={'# Alignement par colonne (left | center | right)\nbpm.table(df, columns=[{"key": "Nom", "label": "Nom"}, {"key": "Montant", "label": "Montant", "align": "right"}])'}
        language="python"
      />

      <nav className="doc-pagination">
        {prev ? (
          <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link>
        ) : <span />}
        {next ? (
          <Link href={"/docs/components/" + next}>bpm.{next} →</Link>
        ) : <span />}
      </nav>
    </div>
  );
}
