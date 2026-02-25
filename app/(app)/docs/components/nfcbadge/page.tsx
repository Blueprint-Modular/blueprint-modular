"use client";

import { useState } from "react";
import Link from "next/link";
import { NfcBadge, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

type NfcVariant = "default" | "primary" | "success";

export default function DocNfcBadgePage() {
  const [label, setLabel] = useState("Scannable");
  const [variant, setVariant] = useState<NfcVariant>("default");
  const { prev, next } = getPrevNext("nfcbadge");

  const pyVariant = variant !== "default" ? `, variant="${variant}"` : "";
  const pythonCode = `bpm.nfcbadge("${label.replace(/"/g, '\\"')}"${pyVariant})`;

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">Composants</Link> → bpm.nfcbadge
        </div>
        <h1>bpm.nfcbadge</h1>
        <p className="doc-description">
          Badge visuel pour statut NFC (Scannable, etc.). Indication que l&apos;élément est lié à un tag NFC.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Identification & traçabilité</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-xl border" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}>
        <p className="text-sm mb-3" style={{ color: "var(--bpm-text-secondary)" }}>
          Tester ce composant en direct dans le sandbox :
        </p>
        <Link href="/sandbox?component=nfcbadge" className="doc-cta inline-block">
          Ouvrir dans le sandbox
        </Link>
      </div>

      <div className="sandbox-container mt-6">
        <div className="sandbox-preview">
          <NfcBadge label={label} variant={variant} />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>label</label>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Scannable" />
          </div>
          <div className="sandbox-control-group">
            <label>variant</label>
            <select value={variant} onChange={(e) => setVariant(e.target.value as NfcVariant)}>
              <option value="default">default</option>
              <option value="primary">primary</option>
              <option value="success">success</option>
            </select>
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
            <td><code>label</code></td>
            <td><code>string</code></td>
            <td>Scannable</td>
            <td>Non</td>
            <td>Texte du badge (statut affiché).</td>
          </tr>
          <tr>
            <td><code>variant</code></td>
            <td><code>&quot;default&quot; | &quot;primary&quot; | &quot;success&quot;</code></td>
            <td>default</td>
            <td>Non</td>
            <td>Style et couleur du badge.</td>
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
      <CodeBlock code={'bpm.nfcbadge()'} language="python" />
      <CodeBlock code={'bpm.nfcbadge("Scannable", variant="primary")'} language="python" />
      <CodeBlock code={'bpm.nfcbadge("Lu", variant="success")'} language="python" />

      <nav className="doc-pagination mt-12">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
