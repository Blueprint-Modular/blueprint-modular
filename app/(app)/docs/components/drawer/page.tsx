"use client";

import { useState } from "react";
import Link from "next/link";
import { Drawer, Button, Text, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

export default function DocDrawerPage() {
  const [open, setOpen] = useState(false);
  const [side, setSide] = useState<"left" | "right">("right");
  const { prev, next } = getPrevNext("drawer");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">Composants</Link> → bpm.drawer
        </div>
        <h1>bpm.drawer</h1>
        <p className="doc-description">
          Tiroir / panneau latéral pour détail, formulaire ou filtres. S&apos;ouvre en overlay avec fond assombri.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Mise en page</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container mt-6">
        <div className="sandbox-preview">
          <Button variant="primary" onClick={() => setOpen(true)}>Ouvrir le tiroir</Button>
          <Drawer open={open} onClose={() => setOpen(false)} title="Détail" side={side} width={360}>
            <Text>Contenu du tiroir : formulaire, détail d&apos;un élément, filtres, etc. Fermez avec le bouton ou Échap.</Text>
          </Drawer>
        </div>
        <div className="sandbox-controls mt-3">
          <div className="sandbox-control-group">
            <label>side</label>
            <select value={side} onChange={(e) => setSide(e.target.value as "left" | "right")}>
              <option value="right">right</option>
              <option value="left">left</option>
            </select>
          </div>
        </div>
        <div className="sandbox-code mt-3">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button type="button" onClick={() => navigator.clipboard.writeText('bpm.drawer(open=..., on_close=..., title="Détail", side="right")')}>
              Copier
            </button>
          </div>
          <pre><code>{'bpm.drawer(open=..., on_close=..., title="Détail", side="right")'}</code></pre>
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
            <td><code>children</code></td>
            <td><code>ReactNode</code></td>
            <td>—</td>
            <td>Oui</td>
            <td>Contenu du tiroir.</td>
          </tr>
          <tr>
            <td><code>open</code></td>
            <td><code>boolean</code></td>
            <td>—</td>
            <td>Oui</td>
            <td>Contrôle l&apos;affichage (ouvert/fermé).</td>
          </tr>
          <tr>
            <td><code>onClose</code></td>
            <td><code>() =&gt; void</code></td>
            <td>—</td>
            <td>Oui</td>
            <td>Callback à la fermeture (clic fond ou bouton).</td>
          </tr>
          <tr>
            <td><code>title</code></td>
            <td><code>string | ReactNode</code></td>
            <td>—</td>
            <td>Non</td>
            <td>Titre affiché dans l&apos;en-tête du tiroir.</td>
          </tr>
          <tr>
            <td><code>side</code></td>
            <td><code>&quot;left&quot; | &quot;right&quot;</code></td>
            <td>right</td>
            <td>Non</td>
            <td>Côté d&apos;ouverture du panneau.</td>
          </tr>
          <tr>
            <td><code>width</code></td>
            <td><code>number | string</code></td>
            <td>360</td>
            <td>Non</td>
            <td>Largeur en px ou valeur CSS.</td>
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
      <CodeBlock code={'bpm.drawer(open=show, on_close=lambda: set_show(False), title="Filtres")'} language="python" />
      <CodeBlock code={'bpm.drawer(open=open, on_close=on_close, title="Détail", side="left", width=400)'} language="python" />

      <nav className="doc-pagination mt-12">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
