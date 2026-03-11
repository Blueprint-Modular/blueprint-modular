"use client";

import { useState } from "react";
import Link from "next/link";
import { FilterPanel, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

const DEMO_FILTERS = [
  { key: "status", label: "Statut", type: "select" as const, options: [{ value: "actif", label: "Actif" }, { value: "inactif", label: "Inactif" }] },
  { key: "search", label: "Recherche", type: "text" as const },
];

export default function DocFilterPanelPage() {
  const [filterValues, setFilterValues] = useState<Record<string, unknown>>({});
  const [orientation, setOrientation] = useState<"horizontal" | "vertical">("horizontal");
  const pythonCode = "bpm.filterPanel(filters=[...], values={}, onChange=fn, onReset=fn" + (orientation !== "horizontal" ? ', orientation="' + orientation + '"' : "") + ")";
  const { prev, next } = getPrevNext("filterpanel");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.filterPanel</div>
        <h1>bpm.filterPanel</h1>
        <p className="doc-description">Panneau de filtres (select, multiselect, daterange, text, toggle).</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Interaction</span>
          <span className="doc-reading-time">⏱ 3 min</span>
        </div>
      </div>
      <div className="sandbox-container">
        <div className="sandbox-preview">
          <FilterPanel filters={DEMO_FILTERS} values={filterValues} onChange={(key, value) => setFilterValues((p) => ({ ...p, [key]: value }))} onReset={() => setFilterValues({})} orientation={orientation} />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>orientation</label>
            <select value={orientation} onChange={(e) => setOrientation(e.target.value as "horizontal" | "vertical")}>
              <option value="horizontal">horizontal</option>
              <option value="vertical">vertical</option>
            </select>
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header"><span>Python</span><button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>Copier</button></div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>
      <table className="props-table">
        <thead><tr><th>Prop</th><th>Type</th><th>Défaut</th><th>Requis</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>filters</code></td><td><code>FilterConfig[]</code></td><td>—</td><td>Oui</td><td>Liste des filtres.</td></tr>
          <tr><td><code>values</code></td><td><code>Record</code></td><td>{"{}"}</td><td>Non</td><td>Valeurs courantes.</td></tr>
          <tr><td><code>onChange</code></td><td><code>function</code></td><td>—</td><td>Oui</td><td>Callback changement.</td></tr>
          <tr><td><code>onReset</code></td><td><code>function</code></td><td>—</td><td>Oui</td><td>Callback reset.</td></tr>
          <tr><td><code>orientation</code></td><td><code>horizontal | vertical</code></td><td>horizontal</td><td>Non</td><td>Disposition.</td></tr>
        </tbody>
      </table>
      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={"bpm.filterPanel(filters=[...], values={}, onChange=fn, onReset=fn)"} language="python" />
      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
