"use client";

import { useState } from "react";
import Link from "next/link";
import { DataExplorer, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

const SAMPLE_DATA = [
  { id: 1, nom: "Alice", score: 85, date: "2024-01-15" },
  { id: 2, nom: "Bob", score: 72, date: "2024-02-20" },
  { id: 3, nom: "Claire", score: 91, date: "2024-03-10" },
];

export default function DocDataExplorerPage() {
  const [title, setTitle] = useState("Participants");
  const [searchable, setSearchable] = useState(true);
  const [exportable, setExportable] = useState(false);
  const [pageSize, setPageSize] = useState(20);

  const pyTitle = title ? `, title="${title.replace(/"/g, '\\"')}"` : "";
  const pySearchable = !searchable ? ", searchable=False" : "";
  const pyExportable = exportable ? ", exportable=True" : "";
  const pyPageSize = pageSize !== 20 ? `, pageSize=${pageSize}` : "";
  const pythonCode = `bpm.dataExplorer(data=rows${pyTitle}${pySearchable}${pyExportable}${pyPageSize})`;
  const { prev, next } = getPrevNext("dataexplorer");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.dataExplorer</div>
        <h1>bpm.dataExplorer</h1>
        <p className="doc-description">Explorateur de données (table, recherche, tri, pagination, export CSV).</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">IA &amp; Spécialisés</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <DataExplorer
            data={SAMPLE_DATA}
            title={title || undefined}
            searchable={searchable}
            exportable={exportable}
            pageSize={pageSize}
          />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre optionnel" />
          </div>
          <div className="sandbox-control-group">
            <label>searchable</label>
            <select value={searchable ? "true" : "false"} onChange={(e) => setSearchable(e.target.value === "true")}>
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>exportable</label>
            <select value={exportable ? "true" : "false"} onChange={(e) => setExportable(e.target.value === "true")}>
              <option value="false">false</option>
              <option value="true">true</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>pageSize</label>
            <input type="number" min={5} value={pageSize} onChange={(e) => setPageSize(Number(e.target.value) || 20)} />
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
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Défaut</th>
            <th>Requis</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>data</code></td><td><code>Record&lt;string, unknown&gt;[]</code></td><td>—</td><td>Oui</td><td>Données à afficher (tableau d&apos;objets).</td></tr>
          <tr><td><code>columns</code></td><td><code>ColumnDef[]</code></td><td>—</td><td>Non</td><td>Définition des colonnes (key, label, type?, sortable?, filterable?). Inférées si absentes.</td></tr>
          <tr><td><code>title</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Titre au-dessus du tableau.</td></tr>
          <tr><td><code>searchable</code></td><td><code>boolean</code></td><td>true</td><td>Non</td><td>Afficher le champ recherche.</td></tr>
          <tr><td><code>exportable</code></td><td><code>boolean</code></td><td>false</td><td>Non</td><td>Afficher le bouton Exporter CSV.</td></tr>
          <tr><td><code>pageSize</code></td><td><code>number</code></td><td>20</td><td>Non</td><td>Nombre de lignes par page.</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Classes CSS.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={'bpm.dataExplorer(data=rows)'} language="python" />
      <CodeBlock code={'bpm.dataExplorer(data=rows, title="Export", searchable=True, exportable=True)'} language="python" />
      <CodeBlock code={'bpm.dataExplorer(data=rows, columns=[{"key": "name", "label": "Nom", "type": "text", "sortable": True}]}'} language="python" />
      <CodeBlock code={'bpm.dataExplorer(data=rows, pageSize=10)'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
