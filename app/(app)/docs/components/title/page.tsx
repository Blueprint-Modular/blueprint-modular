"use client";

import { useState } from "react";
import Link from "next/link";
import { Title, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

export default function DocTitlePage() {
  const [level, setLevel] = useState<1 | 2 | 3 | 4>(1);
  const [children, setChildren] = useState("Titre de la page");
  const [size, setSize] = useState<string>("");
  const [bold, setBold] = useState<string>(""); // "" = défaut niveau, "true", "false"
  const [color, setColor] = useState<string>("");
  const [bar, setBar] = useState(false);
  const [inverted, setInverted] = useState(false);

  const sizeProp = size.trim() || null;
  const boldProp = bold === "true" ? true : bold === "false" ? false : null;
  const colorProp = color.trim() || null;

  const pyLevel = `level=${level}`;
  const pyContent = `content="${children.replace(/"/g, '\\"')}"`;
  const pySize = sizeProp ? `, size="${sizeProp}"` : "";
  const pyBold = bold === "true" ? ", bold=True" : bold === "false" ? ", bold=False" : "";
  const pyColor = colorProp ? `, color="${colorProp.replace(/"/g, '\\"')}"` : "";
  const pyBar = bar ? ", bar=True" : "";
  const pyInverted = inverted ? ", inverted=True" : "";
  const pythonCode = `bpm.title(${pyLevel}, ${pyContent}${pySize}${pyBold}${pyColor}${pyBar}${pyInverted})`;
  const { prev, next } = getPrevNext("title");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.title</div>
        <h1>bpm.title</h1>
        <p className="doc-description">Titre avec niveaux 1 à 4 (h1–h4). Taille, gras et couleur paramétrables.</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Affichage de données</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>
      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Title
            level={level}
            size={sizeProp}
            bold={boldProp === null ? undefined : boldProp}
            color={colorProp}
            bar={bar}
            inverted={inverted}
          >
            {children}
          </Title>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>level</label>
            <select value={level} onChange={(e) => setLevel(Number(e.target.value) as 1 | 2 | 3 | 4)}>
              <option value={1}>1 (h1)</option>
              <option value={2}>2 (h2)</option>
              <option value={3}>3 (h3)</option>
              <option value={4}>4 (h4)</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>children</label>
            <input type="text" value={children} onChange={(e) => setChildren(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>size (optionnel)</label>
            <input
              type="text"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="ex. 1.5rem, 24px"
            />
          </div>
          <div className="sandbox-control-group">
            <label>bold (optionnel)</label>
            <select value={bold} onChange={(e) => setBold(e.target.value)}>
              <option value="">Défaut du niveau</option>
              <option value="true">Oui (700)</option>
              <option value="false">Non (400)</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>color (optionnel)</label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="ex. var(--bpm-text-primary), #333"
            />
          </div>
          <div className="sandbox-control-group">
            <label>bar (optionnel)</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={bar} onChange={(e) => setBar(e.target.checked)} />
              Barre verticale à gauche
            </label>
          </div>
          <div className="sandbox-control-group">
            <label>inverted (optionnel)</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={inverted} onChange={(e) => setInverted(e.target.checked)} />
              Couleur inversée (blanc sur noir)
            </label>
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header"><span>Python</span><button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>Copier</button></div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>
      <table className="props-table">
        <thead><tr><th>Prop</th><th>Type</th><th>Défaut</th><th>Requis</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>level</code></td><td><code>1|2|3|4</code></td><td>1</td><td>Non</td><td>Niveau (h1–h4). Définit taille et gras par défaut.</td></tr>
          <tr><td><code>children</code></td><td><code>ReactNode</code></td><td>—</td><td>Oui</td><td>Texte du titre.</td></tr>
          <tr><td><code>size</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Taille CSS (ex. 1.5rem, 24px). Surcharge le niveau.</td></tr>
          <tr><td><code>bold</code></td><td><code>boolean | number</code></td><td>—</td><td>Non</td><td>Gras : true=700, false=400, ou nombre. Surcharge le niveau.</td></tr>
          <tr><td><code>color</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Couleur CSS (ex. var(--bpm-text-primary), #333).</td></tr>
          <tr><td><code>bar</code></td><td><code>boolean</code></td><td>false</td><td>Non</td><td>Barre verticale sombre à gauche du titre (style en-tête de section).</td></tr>
          <tr><td><code>inverted</code></td><td><code>boolean</code></td><td>false</td><td>Non</td><td>Couleur inversée : fond sombre, texte blanc (style badge / scénario).</td></tr>
        </tbody>
      </table>
      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={'bpm.title(level=1, content="Tableau de bord")'} language="python" />
      <CodeBlock code={'bpm.title(level=2, content="Section")'} language="python" />
      <CodeBlock code={'bpm.title(level=3, content="Sous-titre", size="1.5rem", bold=True, color="var(--bpm-accent)")'} language="python" />
      <CodeBlock code={'bpm.title(level=2, content="Quel go-to-market ? 3 scénarios évalués", bar=True)'} language="python" />
      <CodeBlock code={'bpm.title(level=3, content="SCÉNARIO 2", inverted=True)'} language="python" />
      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
