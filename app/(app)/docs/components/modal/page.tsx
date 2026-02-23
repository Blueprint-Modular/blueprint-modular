"use client";

import { useState } from "react";
import Link from "next/link";
import { Modal, Button, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

type ModalSize = "small" | "medium" | "large";

export default function DocModalPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("Titre de la modal");
  const [size, setSize] = useState<ModalSize>("medium");

  const pythonCode = `bpm.modal(
  title="${title.replace(/"/g, '\\"')}",
  size="${size}",
  content=my_content_component,
)`;

  const { prev, next } = getPrevNext("modal");

  return (
    <div className="max-w-4xl">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs">Documentation</Link> → <Link href="/docs/components">Composants</Link> → bpm.modal</div>
        <h1>bpm.modal</h1>
        <p className="doc-description">
          Fenêtre modale pour afficher du contenu par-dessus la page.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Utilitaires</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Button onClick={() => setIsOpen(true)}>Ouvrir la modal</Button>
          <Modal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title={title}
            size={size}
            showCloseButton
          >
            <p style={{ color: "var(--bpm-text-primary)" }}>
              Contenu de la modal. Fermez avec le bouton ou Échap.
            </p>
          </Modal>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="sandbox-control-group">
            <label>size</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value as ModalSize)}
            >
              <option value="small">small</option>
              <option value="medium">medium</option>
              <option value="large">large</option>
            </select>
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(pythonCode)}
            >
              Copier
            </button>
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
            <td><code>isOpen</code></td>
            <td><code>boolean</code></td>
            <td>—</td>
            <td>Oui</td>
            <td>Contrôle la visibilité de la modal.</td>
          </tr>
          <tr>
            <td><code>onClose</code></td>
            <td><code>() =&gt; void</code></td>
            <td>—</td>
            <td>Oui</td>
            <td>Callback à la fermeture (bouton ou Échap).</td>
          </tr>
          <tr>
            <td><code>title</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>Non</td>
            <td>Titre affiché dans l’en-tête.</td>
          </tr>
          <tr>
            <td><code>size</code></td>
            <td><code>&#39;small&#39; | &#39;medium&#39; | &#39;large&#39;</code></td>
            <td><code>&#39;medium&#39;</code></td>
            <td>Non</td>
            <td>Largeur max de la modal.</td>
          </tr>
          <tr>
            <td><code>showCloseButton</code></td>
            <td><code>boolean</code></td>
            <td><code>true</code></td>
            <td>Non</td>
            <td>Affiche le bouton de fermeture.</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock
        code={`if bpm.button("Confirmer"):
    bpm.modal(title="Confirmé", content="Action enregistrée.", on_close=refresh)`}
        language="python"
      />
      <CodeBlock
        code={`bpm.modal(
  title="Détails",
  size="large",
  content=bpm.panel(bpm.table(df)),
)`}
        language="python"
      />

      <nav className="doc-pagination">
        {prev ? (
          <Link href={`/docs/components/${prev}`}>← bpm.{prev}</Link>
        ) : <span />}
        {next ? (
          <Link href={`/docs/components/${next}`}>bpm.{next} →</Link>
        ) : <span />}
      </nav>
    </div>
  );
}
