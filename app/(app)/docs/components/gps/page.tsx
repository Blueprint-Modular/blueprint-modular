"use client";

import { useState } from "react";
import Link from "next/link";
import { Gps, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

export default function DocGpsPage() {
  const [label, setLabel] = useState("");
  const [showMap, setShowMap] = useState(true);
  const [height, setHeight] = useState(300);
  const [mode, setMode] = useState<"display" | "picker">("display");

  const parts: string[] = [];
  if (label.trim()) parts.push(`label="${label.trim().replace(/"/g, '\\"')}"`);
  if (!showMap) parts.push("showMap=False");
  if (height !== 300) parts.push(`height=${height}`);
  if (mode !== "display") parts.push(`mode="${mode}"`);
  const pythonCode = parts.length ? `bpm.gps(${parts.join(", ")})` : "bpm.gps()";
  const { prev, next } = getPrevNext("gps");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.gps</div>
        <h1>bpm.gps</h1>
        <p className="doc-description">Affichage ou sélection de position GPS (carte, picker).</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Média</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview" style={{ minHeight: 200 }}>
          <Gps
            label={label.trim() || undefined}
            showMap={showMap}
            height={height}
            mode={mode}
          />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>label</label>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Titre optionnel" />
          </div>
          <div className="sandbox-control-group">
            <label>showMap</label>
            <select value={showMap ? "true" : "false"} onChange={(e) => setShowMap(e.target.value === "true")}>
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>height</label>
            <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value) || 300)} />
          </div>
          <div className="sandbox-control-group">
            <label>mode</label>
            <select value={mode} onChange={(e) => setMode(e.target.value as "display" | "picker")}>
              <option value="display">display</option>
              <option value="picker">picker</option>
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
          <tr><td><code>label</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Titre affiché au-dessus du bloc.</td></tr>
          <tr><td><code>showMap</code></td><td><code>boolean</code></td><td>true</td><td>Non</td><td>Afficher une carte Leaflet.</td></tr>
          <tr><td><code>onLocation</code></td><td><code>(coords) =&gt; void</code></td><td>—</td><td>Non</td><td>Callback quand la position est obtenue (mode display).</td></tr>
          <tr><td><code>height</code></td><td><code>number</code></td><td>300</td><td>Non</td><td>Hauteur de la carte en px.</td></tr>
          <tr><td><code>mode</code></td><td><code>&quot;display&quot; | &quot;picker&quot;</code></td><td>display</td><td>Non</td><td>display = affichage position, picker = sélection d&apos;un point.</td></tr>
          <tr><td><code>value</code></td><td><code>{ lat: number; lng: number } | null</code></td><td>—</td><td>Non</td><td>Position courante (mode picker).</td></tr>
          <tr><td><code>onChange</code></td><td><code>(coords) =&gt; void</code></td><td>—</td><td>Non</td><td>Callback à chaque déplacement du marker ou clic (mode picker).</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Classes CSS.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={'bpm.gps()'} language="python" />
      <CodeBlock code={'bpm.gps(label="Ma position", onLocation=save_coords)'} language="python" />
      <CodeBlock code={'bpm.gps(mode="picker", value=coords, onChange=set_coords)'} language="python" />
      <CodeBlock code={'bpm.gps(showMap=False, onLocation=handle_location)'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
