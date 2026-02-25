"use client";

import { useState } from "react";
import Link from "next/link";
import { Barcode, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

type BarcodeFormat = "EAN13" | "CODE128";

export default function DocBarcodePage() {
  const [value, setValue] = useState("1234567890123");
  const [format, setFormat] = useState<BarcodeFormat>("CODE128");
  const [height, setHeight] = useState(60);
  const { prev, next } = getPrevNext("barcode");

  const pyFormat = format !== "CODE128" ? `, format="${format}"` : "";
  const pyHeight = height !== 60 ? `, height=${height}` : "";
  const pythonCode = `bpm.barcode("${value.replace(/"/g, '\\"')}"${pyFormat}${pyHeight})`;

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">Composants</Link> → bpm.barcode
        </div>
        <h1>bpm.barcode</h1>
        <p className="doc-description">
          Code-barres (EAN-13, Code 128) pour identification et traçabilité.
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
        <Link href="/sandbox?component=barcode" className="doc-cta inline-block">
          Ouvrir dans le sandbox
        </Link>
      </div>

      <div className="sandbox-container mt-6">
        <div className="sandbox-preview">
          <Barcode value={value} format={format} height={height} />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>value</label>
            <input type="text" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Valeur du code" />
          </div>
          <div className="sandbox-control-group">
            <label>format</label>
            <select value={format} onChange={(e) => setFormat(e.target.value as BarcodeFormat)}>
              <option value="CODE128">CODE128</option>
              <option value="EAN13">EAN13</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>height</label>
            <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value) || 60)} min={20} max={120} />
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
            <td>Valeur encodée (ex. EAN-13, Code 128).</td>
          </tr>
          <tr>
            <td><code>format</code></td>
            <td><code>&quot;EAN13&quot; | &quot;CODE128&quot;</code></td>
            <td>CODE128</td>
            <td>Non</td>
            <td>Type de code-barres.</td>
          </tr>
          <tr>
            <td><code>height</code></td>
            <td><code>number</code></td>
            <td>60</td>
            <td>Non</td>
            <td>Hauteur en pixels.</td>
          </tr>
          <tr>
            <td><code>width</code></td>
            <td><code>number</code></td>
            <td>2</td>
            <td>Non</td>
            <td>Épaisseur des barres (px).</td>
          </tr>
          <tr>
            <td><code>lineColor</code></td>
            <td><code>string</code></td>
            <td>var(--bpm-text-primary)</td>
            <td>Non</td>
            <td>Couleur des barres.</td>
          </tr>
          <tr>
            <td><code>background</code></td>
            <td><code>string</code></td>
            <td>transparent</td>
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
      <CodeBlock code={'bpm.barcode("1234567890123")'} language="python" />
      <CodeBlock code={'bpm.barcode("ABC-123", format="CODE128", height=80)'} language="python" />

      <nav className="doc-pagination mt-12">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
