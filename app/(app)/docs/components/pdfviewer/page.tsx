"use client";

import { useState } from "react";
import Link from "next/link";
import { PdfViewer, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

export default function DocPdfViewerPage() {
  const [src, setSrc] = useState("https://www.w3.org/WAI/WCAG21/Techniques/pdf/img/table-word.pdf");
  const [title, setTitle] = useState("PDF");
  const [width, setWidth] = useState<string | number>("100%");
  const [height, setHeight] = useState<string | number>("600px");

  const pyTitle = title !== "PDF" ? `, title="${title.replace(/"/g, '\\"')}"` : "";
  const pyWidth = width !== "100%" ? (typeof width === "number" ? `, width=${width}` : `, width="${width}"`) : "";
  const pyHeight = height !== "600px" ? (typeof height === "number" ? `, height=${height}` : `, height="${height.replace(/"/g, '\\"')}"`) : "";
  const pythonCode = `bpm.pdfViewer(src="${src.replace(/"/g, '\\"')}"${pyTitle}${pyWidth}${pyHeight})`;
  const { prev, next } = getPrevNext("pdfviewer");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.pdfViewer</div>
        <h1>bpm.pdfViewer</h1>
        <p className="doc-description">Visualiseur PDF (iframe).</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Média</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview" style={{ minHeight: 300 }}>
          <PdfViewer src={src} title={title} width={width} height={height} />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>src</label>
            <input type="text" value={src} onChange={(e) => setSrc(e.target.value)} placeholder="URL du PDF" />
          </div>
          <div className="sandbox-control-group">
            <label>title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>width</label>
            <input type="text" value={width} onChange={(e) => setWidth(e.target.value || "100%")} />
          </div>
          <div className="sandbox-control-group">
            <label>height</label>
            <input type="text" value={height} onChange={(e) => setHeight(e.target.value || "600px")} />
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
          <tr><td><code>src</code></td><td><code>string</code></td><td>—</td><td>Oui</td><td>URL du document PDF.</td></tr>
          <tr><td><code>title</code></td><td><code>string</code></td><td>PDF</td><td>Non</td><td>Titre de l&apos;iframe (accessibilité).</td></tr>
          <tr><td><code>width</code></td><td><code>number | string</code></td><td>100%</td><td>Non</td><td>Largeur.</td></tr>
          <tr><td><code>height</code></td><td><code>number | string</code></td><td>600px</td><td>Non</td><td>Hauteur.</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Classes CSS.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={'bpm.pdfViewer(src="/documents/rapport.pdf")'} language="python" />
      <CodeBlock code={'bpm.pdfViewer(src=url, title="Rapport annuel", height="80vh")'} language="python" />
      <CodeBlock code={'bpm.pdfViewer(src=pdf_url, width=800, height=600)'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
