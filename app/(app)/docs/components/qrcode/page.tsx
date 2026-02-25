"use client";

import { useState } from "react";
import Link from "next/link";
import { QRCode, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

export default function DocQRCodePage() {
  const [value, setValue] = useState("https://blueprint-modular.com");
  const [size, setSize] = useState(128);
  const { prev, next } = getPrevNext("qrcode");

  const pySize = size !== 128 ? `, size=${size}` : "";
  const pythonCode = `bpm.qrcode("${value.replace(/"/g, '\\"')}"${pySize})`;

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">Composants</Link> → bpm.qrcode
        </div>
        <h1>bpm.qrcode</h1>
        <p className="doc-description">
          QR Code pour URL, vCard ou texte. Scannable par smartphone ou lecteur.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Identification & traçabilité</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container mt-6">
        <div className="sandbox-preview">
          <QRCode value={value} size={size} />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>value</label>
            <input type="text" value={value} onChange={(e) => setValue(e.target.value)} placeholder="URL ou texte" />
          </div>
          <div className="sandbox-control-group">
            <label>size</label>
            <input type="number" value={size} onChange={(e) => setSize(Number(e.target.value) || 128)} min={64} max={256} />
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
            <td><code>value</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>Oui</td>
            <td>Données encodées (URL, vCard, texte).</td>
          </tr>
          <tr>
            <td><code>size</code></td>
            <td><code>number</code></td>
            <td>128</td>
            <td>Non</td>
            <td>Taille en pixels (côté du carré).</td>
          </tr>
          <tr>
            <td><code>fgColor</code></td>
            <td><code>string</code></td>
            <td>var(--bpm-text-primary)</td>
            <td>Non</td>
            <td>Couleur des modules (avant-plan).</td>
          </tr>
          <tr>
            <td><code>bgColor</code></td>
            <td><code>string</code></td>
            <td>var(--bpm-bg-primary)</td>
            <td>Non</td>
            <td>Couleur de fond.</td>
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
      <CodeBlock code={'bpm.qrcode("https://example.com")'} language="python" />
      <CodeBlock code={'bpm.qrcode("BEGIN:VCARD\\nFN:Jean Dupont\\nEND:VCARD", size=160)'} language="python" />

      <nav className="doc-pagination mt-12">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
