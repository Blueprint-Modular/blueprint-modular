"use client";

import { useState } from "react";
import Link from "next/link";
import { Title, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

type Level = 1 | 2 | 3 | 4;

export default function DocTitleBpmPage() {
  const [children, setChildren] = useState("Titre de la page");
  const [level, setLevel] = useState<Level>(1);
  const [bar, setBar] = useState(false);
  const [inverted, setInverted] = useState(false);

  const pyLevel = level !== 1 ? `, level=${level}` : "";
  const pyBar = bar ? ", bar=True" : "";
  const pyInverted = inverted ? ", inverted=True" : "";
  const pythonCode = `bpm.titleBpm("${children.replace(/"/g, '\\"')}"${pyLevel}${pyBar}${pyInverted})`;
  const { prev, next } = getPrevNext("titlebpm");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.titleBpm</div>
        <h1>bpm.titleBpm</h1>
        <p className="doc-description">Titre (alias bpm.title, niveaux 1 à 4).</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Affichage de données</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Title level={level} bar={bar} inverted={inverted}>
            {children}
          </Title>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>children (texte)</label>
            <input type="text" value={children} onChange={(e) => setChildren(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>level</label>
            <select value={level} onChange={(e) => setLevel(Number(e.target.value) as Level)}>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>bar</label>
            <select value={bar ? "true" : "false"} onChange={(e) => setBar(e.target.value === "true")}>
              <option value="false">false</option>
              <option value="true">true</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>inverted</label>
            <select value={inverted ? "true" : "false"} onChange={(e) => setInverted(e.target.value === "true")}>
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
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Défaut</th>
            <th>Requis</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>children</code></td><td><code>ReactNode</code></td><td>—</td><td>Oui</td><td>Texte du titre.</td></tr>
          <tr><td><code>level</code></td><td><code>1 | 2 | 3 | 4</code></td><td>1</td><td>Non</td><td>Niveau hiérarchique.</td></tr>
          <tr><td><code>size</code></td><td><code>string | null</code></td><td>—</td><td>Non</td><td>Taille de police (surcharge le défaut du niveau).</td></tr>
          <tr><td><code>bold</code></td><td><code>boolean | number | null</code></td><td>—</td><td>Non</td><td>Gras (true = 700, false = 400).</td></tr>
          <tr><td><code>color</code></td><td><code>string | null</code></td><td>—</td><td>Non</td><td>Couleur du texte.</td></tr>
          <tr><td><code>bar</code></td><td><code>boolean</code></td><td>false</td><td>Non</td><td>Barre verticale à gauche du titre.</td></tr>
          <tr><td><code>barColor</code></td><td><code>string | null</code></td><td>—</td><td>Non</td><td>Couleur de la barre (si bar=true).</td></tr>
          <tr><td><code>inverted</code></td><td><code>boolean</code></td><td>false</td><td>Non</td><td>Fond sombre, texte blanc.</td></tr>
          <tr><td><code>invertedBackground</code></td><td><code>string | null</code></td><td>—</td><td>Non</td><td>Couleur de fond quand inverted=true.</td></tr>
          <tr><td><code>logoUrl</code></td><td><code>string | null</code></td><td>—</td><td>Non</td><td>URL logo (affiché seulement si level=1).</td></tr>
          <tr><td><code>onLogoClick</code></td><td><code>() =&gt; void</code></td><td>—</td><td>Non</td><td>Clic sur le logo.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={'bpm.titleBpm("Dashboard Production")'} language="python" />
      <CodeBlock code={'bpm.titleBpm("Section", level=2)'} language="python" />
      <CodeBlock code={'bpm.titleBpm("Encadré", level=3, bar=True)'} language="python" />
      <CodeBlock code={'bpm.titleBpm("Badge", inverted=True)'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
