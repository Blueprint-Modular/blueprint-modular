"use client";

import { useState } from "react";
import Link from "next/link";
import { Selectbox, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

const OPTS = [{ value: "a", label: "Option A" }, { value: "b", label: "Option B" }, { value: "c", label: "Option C" }];

export default function DocSelectboxPage() {
  const [label, setLabel] = useState("Choisir");
  const [placeholder, setPlaceholder] = useState("Selectionner...");
  const [value, setValue] = useState<string | null>("b");
  const [disabled, setDisabled] = useState(false);

  const escapedLabel = label.replace(/"/g, '\\"');
  const escapedPlaceholder = placeholder.replace(/"/g, '\\"');
  const pythonCode = `bpm.selectbox(label="${escapedLabel}", placeholder="${escapedPlaceholder}", disabled=${disabled})`;
  const { prev, next } = getPrevNext("selectbox");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.selectbox</div>
        <h1>bpm.selectbox</h1>
        <p className="doc-description">Liste deroulante pour choisir une valeur.</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Interaction</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>
      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Selectbox label={label} placeholder={placeholder} options={OPTS} value={value} onChange={setValue} disabled={disabled} />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>label</label>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>placeholder</label>
            <input type="text" value={placeholder} onChange={(e) => setPlaceholder(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>disabled</label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} />
              Desactive
            </label>
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header"><span>Python</span><button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>Copier</button></div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>
      <table className="props-table">
        <thead><tr><th>Prop</th><th>Type</th><th>Defaut</th><th>Requis</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>label</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Label.</td></tr>
          <tr><td><code>options</code></td><td><code>SelectOption[]</code></td><td>—</td><td>Oui</td><td>Options.</td></tr>
          <tr><td><code>value</code></td><td><code>string | null</code></td><td>—</td><td>Oui</td><td>Valeur selectionnee.</td></tr>
          <tr><td><code>onChange</code></td><td><code>function</code></td><td>—</td><td>Oui</td><td>Callback.</td></tr>
          <tr><td><code>placeholder</code></td><td><code>string</code></td><td>Selectionner...</td><td>Non</td><td>Texte par defaut.</td></tr>
          <tr><td><code>disabled</code></td><td><code>boolean</code></td><td>false</td><td>Non</td><td>Desactive.</td></tr>
        </tbody>
      </table>
      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={'bpm.selectbox(label="Region", options=[{"value": "fr", "label": "France"}], value=region, onChange=set_region)'} language="python" />
      <CodeBlock code={'bpm.selectbox(options=["A", "B", "C"], placeholder="Choix")'} language="python" />
      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
