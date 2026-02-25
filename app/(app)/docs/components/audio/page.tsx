"use client";

import { useState } from "react";
import Link from "next/link";
import { Audio } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

export default function DocAudioPage() {
  const [src, setSrc] = useState("https://www.w3schools.com/html/horse.mp3");
  const [controls, setControls] = useState(true);
  const [loop, setLoop] = useState(false);
  const pythonCode = "bpm.audio(src=\"" + src + "\", controls=" + controls + ", loop=" + loop + ")";
  const { prev, next } = getPrevNext("audio");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.audio</div>
        <h1>bpm.audio</h1>
        <p className="doc-description">Lecteur audio HTML5 (contrôles, boucle).</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">Média</span></div>
      </div>
      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Audio src={src} controls={controls} loop={loop} />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>src</label>
            <input type="text" value={src} onChange={(e) => setSrc(e.target.value)} className="w-full p-2 border rounded text-sm" />
          </div>
          <div className="sandbox-control-group">
            <label><input type="checkbox" checked={controls} onChange={(e) => setControls(e.target.checked)} /> controls</label>
          </div>
          <div className="sandbox-control-group">
            <label><input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} /> loop</label>
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header"><span>Python</span><button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>Copier</button></div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>
      <table className="props-table">
        <thead><tr><th>Prop</th><th>Type</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>src</code></td><td>string</td><td>URL du fichier audio.</td></tr>
          <tr><td><code>controls</code></td><td>boolean</td><td>Contrôles (défaut true).</td></tr>
          <tr><td><code>loop</code></td><td>boolean</td><td>Boucler (défaut false).</td></tr>
        </tbody>
      </table>
      <nav className="doc-pagination mt-8">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
