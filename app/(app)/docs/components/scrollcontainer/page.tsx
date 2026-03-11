"use client";

import { useState } from "react";
import Link from "next/link";
import { ScrollContainer, CodeBlock, Text } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

type DirectionOption = "vertical" | "horizontal" | "both";

export default function DocScrollContainerPage() {
  const [maxHeight, setMaxHeight] = useState(180);
  const [direction, setDirection] = useState<DirectionOption>("vertical");
  const [hideScrollbar, setHideScrollbar] = useState(false);

  const pyMaxHeight = `max_height=${maxHeight}`;
  const pyDirection = direction !== "vertical" ? `, direction="${direction}"` : "";
  const pyHide = hideScrollbar ? ", hide_scrollbar=True" : "";
  const pythonCode = `bpm.scrollContainer(${pyMaxHeight}${pyDirection}${pyHide})`;
  const { prev, next } = getPrevNext("scrollcontainer");

  const sampleContent = (
    <div style={{ padding: 8 }}>
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} style={{ padding: "8px 0", borderBottom: "1px solid var(--bpm-border)" }}>
          <Text>Ligne de contenu {i}</Text>
        </div>
      ))}
    </div>
  );

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.scrollContainer</div>
        <h1>bpm.scrollContainer</h1>
        <p className="doc-description">Conteneur avec défilement interne (hauteur max, scrollbar optionnelle).</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Mise en page</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <ScrollContainer maxHeight={maxHeight} direction={direction} hideScrollbar={hideScrollbar}>
            {sampleContent}
          </ScrollContainer>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>maxHeight (px)</label>
            <input type="number" min={80} value={maxHeight} onChange={(e) => setMaxHeight(Number(e.target.value) || 180)} />
          </div>
          <div className="sandbox-control-group">
            <label>direction</label>
            <select value={direction} onChange={(e) => setDirection(e.target.value as DirectionOption)}>
              <option value="vertical">vertical</option>
              <option value="horizontal">horizontal</option>
              <option value="both">both</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>hideScrollbar</label>
            <select value={hideScrollbar ? "true" : "false"} onChange={(e) => setHideScrollbar(e.target.value === "true")}>
              <option value="false">false</option>
              <option value="true">true</option>
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
          <tr><th>Prop</th><th>Type</th><th>Défaut</th><th>Requis</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>children</code></td><td><code>ReactNode</code></td><td>—</td><td>Oui</td><td>Contenu scrollable.</td></tr>
          <tr><td><code>height</code></td><td><code>string | number</code></td><td>100%</td><td>Non</td><td>Hauteur du conteneur.</td></tr>
          <tr><td><code>maxHeight</code></td><td><code>string | number</code></td><td>—</td><td>Non</td><td>Hauteur max pour activer le scroll.</td></tr>
          <tr><td><code>direction</code></td><td><code>vertical | horizontal | both</code></td><td>vertical</td><td>Non</td><td>Direction du défilement.</td></tr>
          <tr><td><code>hideScrollbar</code></td><td><code>boolean</code></td><td>false</td><td>Non</td><td>Masquer la scrollbar visuelle.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={"bpm.scrollContainer(max_height=200)  # contenu avec scroll vertical"} language="python" />
      <CodeBlock code={'bpm.scrollContainer(max_height=150, hide_scrollbar=True)'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
