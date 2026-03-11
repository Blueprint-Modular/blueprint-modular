"use client";

import { useState } from "react";
import Link from "next/link";
import { ConfirmModal, Button, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

type VariantOption = "danger" | "warning" | "info";

export default function DocConfirmModalPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("Confirmer la suppression");
  const [message, setMessage] = useState("Cette action est irréversible.");
  const [variant, setVariant] = useState<VariantOption>("danger");

  const pyTitle = title.replace(/"/g, '\\"');
  const pyMessage = message.replace(/"/g, '\\"');
  const pythonCode = `bpm.confirmModal(is_open=${isOpen}, on_confirm=fn, on_cancel=fn, title="${pyTitle}", message="${pyMessage}"${variant !== "danger" ? `, variant="${variant}"` : ""})`;
  const { prev, next } = getPrevNext("confirmmodal");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.confirmModal</div>
        <h1>bpm.confirmModal</h1>
        <p className="doc-description">Modal de confirmation pour actions destructives (danger, warning, info).</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Mise en page</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Button onClick={() => setIsOpen(true)}>Ouvrir la confirmation</Button>
          <ConfirmModal
            isOpen={isOpen}
            onConfirm={() => setIsOpen(false)}
            onCancel={() => setIsOpen(false)}
            title={title}
            message={message}
            variant={variant}
          />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>message</label>
            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>variant</label>
            <select value={variant} onChange={(e) => setVariant(e.target.value as VariantOption)}>
              <option value="danger">danger</option>
              <option value="warning">warning</option>
              <option value="info">info</option>
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
          <tr><td><code>isOpen</code></td><td><code>boolean</code></td><td>—</td><td>Oui</td><td>Contrôle l&apos;affichage de la modal.</td></tr>
          <tr><td><code>onConfirm</code></td><td><code>() =&gt; void</code></td><td>—</td><td>Oui</td><td>Callback au clic Confirmer.</td></tr>
          <tr><td><code>onCancel</code></td><td><code>() =&gt; void</code></td><td>—</td><td>Oui</td><td>Callback Annuler / Escape.</td></tr>
          <tr><td><code>title</code></td><td><code>string</code></td><td>—</td><td>Oui</td><td>Titre de la modal.</td></tr>
          <tr><td><code>message</code></td><td><code>string</code></td><td>—</td><td>Oui</td><td>Message principal.</td></tr>
          <tr><td><code>variant</code></td><td><code>danger | warning | info</code></td><td>danger</td><td>Non</td><td>Style du bouton confirmer.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={'bpm.confirmModal(is_open=True, on_confirm=fn, on_cancel=fn, title="Supprimer ?", message="Definitive.")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
