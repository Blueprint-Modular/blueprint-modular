"use client";

import Link from "next/link";
import { PlotlyChart } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

export default function DocPlotlyPage() {
  const { prev, next } = getPrevNext("plotly");
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.plotly</div>
        <h1>bpm.plotly</h1>
        <p className="doc-description">Graphiques Plotly (iframe ou placeholder).</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">Visualisation</span></div>
      </div>
      <div className="sandbox-container">
        <div className="sandbox-preview">
          <PlotlyChart width="400px" height={300} />
        </div>
        <div className="sandbox-code">
          <pre><code>{'bpm.plotly(iframe_src="...")  # ou sans iframe_src = placeholder'}</code></pre>
        </div>
      </div>
      <table className="props-table">
        <thead><tr><th>Prop</th><th>Type</th><th>Défaut</th></tr></thead>
        <tbody>
          <tr><td>iframeSrc</td><td>string</td><td>—</td></tr>
          <tr><td>width</td><td>number | string</td><td>100%</td></tr>
          <tr><td>height</td><td>number | string</td><td>400</td></tr>
        </tbody>
      </table>
      <nav className="doc-pagination mt-8">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
