"use client";

import { useState } from "react";
import Link from "next/link";
import { PlotlyChart, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

const SAMPLE_DATA = [
  { x: [1, 2, 3, 4, 5], y: [10, 15, 13, 17, 12], type: "scatter", name: "Série A" },
  { x: [1, 2, 3, 4, 5], y: [8, 12, 14, 11, 16], type: "scatter", name: "Série B" },
];

export default function DocPlotlyChartPage() {
  const [height, setHeight] = useState(380);
  const [width, setWidth] = useState<number | string>("100%");

  const pyHeight = height !== 380 ? `, height=${height}` : "";
  const pyWidth = width !== "100%" ? (typeof width === "number" ? `, width=${width}` : `, width="${width}"`) : "";
  const pythonCode = `bpm.plotlyChart(data=[{"x": [1,2,3], "y": [10,15,13], "type": "scatter"}]${pyHeight}${pyWidth})`;
  const { prev, next } = getPrevNext("plotlychart");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.plotlyChart</div>
        <h1>bpm.plotlyChart</h1>
        <p className="doc-description">Graphique Plotly (iframe ou placeholder).</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Graphiques</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <PlotlyChart data={SAMPLE_DATA} height={height} width={width} />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>height</label>
            <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value) || 380)} />
          </div>
          <div className="sandbox-control-group">
            <label>width</label>
            <input type="text" value={width} onChange={(e) => setWidth(e.target.value === "" ? "100%" : e.target.value)} placeholder="100% ou nombre" />
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
          <tr><td><code>data</code></td><td><code>object[]</code></td><td>—</td><td>Non</td><td>Tableau de traces Plotly (ex. [{type:&apos;bar&apos;, x:[], y:[]}]).</td></tr>
          <tr><td><code>layout</code></td><td><code>object</code></td><td>—</td><td>Non</td><td>Config layout Plotly (title, xaxis, yaxis, etc.).</td></tr>
          <tr><td><code>config</code></td><td><code>object</code></td><td>—</td><td>Non</td><td>Config Plotly (responsive, displayModeBar, etc.).</td></tr>
          <tr><td><code>height</code></td><td><code>number</code></td><td>380</td><td>Non</td><td>Hauteur en pixels.</td></tr>
          <tr><td><code>width</code></td><td><code>number | string</code></td><td>100%</td><td>Non</td><td>Largeur.</td></tr>
          <tr><td><code>iframeSrc</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>URL iframe (compatibilité ascendante).</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Classes CSS.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={'bpm.plotlyChart(data=[{"x": [1,2,3], "y": [10,15,13], "type": "scatter"}])'} language="python" />
      <CodeBlock code={'bpm.plotlyChart(data=traces, layout={"title": "CA mensuel"}, height=400)'} language="python" />
      <CodeBlock code={'bpm.plotlyChart(data=[{"x": ["A","B","C"], "y": [1,2,3], "type": "bar"}])'} language="python" />
      <CodeBlock code={'bpm.plotlyChart(iframeSrc="https://...")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
