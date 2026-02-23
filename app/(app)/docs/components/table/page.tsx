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
  { key: "Prix", label: "Prix" },
  { key: "Stock", label: "Stock" },
  { key: "Statut", label: "Statut" },
];

export default function DocTablePage() {
  const [striped, setStriped] = useState(true);
  const [hover, setHover] = useState(true);
  const [defaultSortColumn, setDefaultSortColumn] = useState<string | null>("Produit");

  const pythonCode =
    "import bpm\nimport pandas as pd\n\ndf = pd.DataFrame({\n  \"Produit\": [\"Widget A\", \"Widget B\", \"Widget C\"],\n  \"Prix\": [29.99, 49.99, 9.99],\n  \"Stock\": [142, 38, 500],\n})\n\nbpm.table(df, striped=" +
    String(striped) +
    ", hover=" +
    String(hover) +
    ")";

  const { prev, next } = getPrevNext("table");

  return (
    <div className="max-w-4xl">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">Documentation → Composants → bpm.table</div>
        <h1>bpm.table</h1>
        <p className="doc-description">
          Tableau de données avec tri, lignes alternées et survol.
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
          />
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
            <td><code>Column[]</code></td>
            <td>—</td>
            <td>Oui</td>
            <td>Définition des colonnes (key, label, align, className).</td>
          </tr>
          <tr>
            <td><code>data</code></td>
            <td><code>Record&lt;string, unknown&gt;[]</code></td>
            <td><code>[]</code></td>
            <td>Non</td>
            <td>Données à afficher.</td>
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
