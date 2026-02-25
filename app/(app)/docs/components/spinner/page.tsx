"use client";

import { useState } from "react";
import Link from "next/link";
import { Spinner, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

type SpinnerSize = "small" | "medium" | "large";
type SpinnerVariant = "circle" | "dot";

export default function DocSpinnerPage() {
  const [text, setText] = useState("Chargement...");
  const [size, setSize] = useState<SpinnerSize>("medium");
  const [variant, setVariant] = useState<SpinnerVariant>("circle");

  const pythonCode =
    "bpm.spinner(text=\"" + text.replace(/"/g, '\\"') + "\", size=\"" + size + "\", variant=\"" + variant + "\")";

  const { prev, next } = getPrevNext("spinner");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.spinner</div>
        <h1>bpm.spinner</h1>
        <p className="doc-description">
          Indicateur de chargement : Circle (cercle tournant) ou Dot (3 points animés, comme en IA).
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Feedback</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview sandbox-preview--spinner">
          <Spinner text={text} size={size} variant={variant} />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>variant</label>
            <select value={variant} onChange={(e) => setVariant(e.target.value as SpinnerVariant)}>
              <option value="circle">circle</option>
              <option value="dot">dot</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>text</label>
            <input type="text" value={text} onChange={(e) => setText(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>size</label>
            <select value={size} onChange={(e) => setSize(e.target.value as SpinnerSize)}>
              <option value="small">small</option>
              <option value="medium">medium</option>
              <option value="large">large</option>
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
            <td><code>variant</code></td>
            <td><code>&#39;circle&#39; | &#39;dot&#39;</code></td>
            <td><code>&#39;circle&#39;</code></td>
            <td>Non</td>
            <td>Style : circle (cercle tournant) ou dot (3 points animés, comme en IA).</td>
          </tr>
          <tr>
            <td><code>text</code></td>
            <td><code>string</code></td>
            <td><code>&#39;Chargement...&#39;</code></td>
            <td>Non</td>
            <td>Texte sous le spinner.</td>
          </tr>
          <tr>
            <td><code>size</code></td>
            <td><code>&#39;small&#39; | &#39;medium&#39; | &#39;large&#39;</code></td>
            <td><code>&#39;medium&#39;</code></td>
            <td>Non</td>
            <td>Taille du spinner.</td>
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
      <CodeBlock code={'bpm.spinner(text="Analyse en cours...", size="large")'} language="python" />
      <CodeBlock code={'bpm.spinner(variant="dot", text="Chargement…")'} language="python" />
      <CodeBlock code="bpm.spinner()  # Circle, texte par défaut, taille medium" language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
