"use client";

import { useState } from "react";
import Link from "next/link";
import { Toggle, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

export default function DocTogglePage() {
  const [label, setLabel] = useState("Activer les notifications");
  const [value, setValue] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const pythonCode =
    "bpm.toggle(label=\"" + label.replace(/"/g, "\\\"") + "\", checked=" + String(value) + ", disabled=" + String(disabled) + ")";

  const { prev, next } = getPrevNext("toggle");

  return (
    <div className="max-w-4xl">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs">Documentation</Link> → <Link href="/docs/components">Composants</Link> → bpm.toggle</div>
        <h1>bpm.toggle</h1>
        <p className="doc-description">Interrupteur on/off pour une option booléenne.</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Interaction</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Toggle label={label} value={value} onChange={setValue} disabled={disabled} />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>label</label>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>checked</label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setValue(e.target.checked)}
              />
              Coché
            </label>
          </div>
          <div className="sandbox-control-group">
            <label>disabled</label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} />
              Désactivé
            </label>
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
          <tr>
            <td><code>label</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>Non</td>
            <td>Texte à côté du switch.</td>
          </tr>
          <tr>
            <td><code>value</code></td>
            <td><code>boolean</code></td>
            <td>—</td>
            <td>Oui</td>
            <td>État activé/désactivé.</td>
          </tr>
          <tr>
            <td><code>onChange</code></td>
            <td><code>function</code></td>
            <td>—</td>
            <td>Oui</td>
            <td>Callback au changement.</td>
          </tr>
          <tr>
            <td><code>disabled</code></td>
            <td><code>boolean</code></td>
            <td><code>false</code></td>
            <td>Non</td>
            <td>Désactive le toggle.</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={'bpm.toggle(label="Activer", checked=state, onChange=set_state)'} language="python" />
      <CodeBlock code={'bpm.toggle(label="Option", checked=False, disabled=True)'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
