"use client";

import { useState } from "react";
import Link from "next/link";
import { Toast, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

type ToastType = "info" | "success" | "warning" | "error";

export default function DocToastPage() {
  const [message, setMessage] = useState("Opération réussie.");
  const [type, setType] = useState<ToastType>("success");

  const escapedMessage = message.replace(/"/g, '\\"');
  const pyType = type !== "info" ? `, type="${type}"` : "";
  const pythonCode = `bpm.toast(message="${escapedMessage}"${pyType})`;
  const { prev, next } = getPrevNext("toast");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.toast</div>
        <h1>bpm.toast</h1>
        <p className="doc-description">Notification éphémère (success, error, info, warning). En app, utiliser ToastProvider + useToast() pour afficher.</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Feedback</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Toast
            id={1}
            message={message}
            type={type}
            title={null}
            pageName={null}
            pageIcon={null}
            onClose={() => {}}
          />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>message</label>
            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>type</label>
            <select value={type} onChange={(e) => setType(e.target.value as ToastType)}>
              <option value="info">info</option>
              <option value="success">success</option>
              <option value="warning">warning</option>
              <option value="error">error</option>
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
          <tr><td><code>message</code></td><td><code>string</code></td><td>—</td><td>Oui</td><td>Texte de la notification.</td></tr>
          <tr><td><code>type</code></td><td><code>info | success | warning | error</code></td><td>info</td><td>Non</td><td>Style et couleur du toast.</td></tr>
          <tr><td><code>title</code></td><td><code>string | null</code></td><td>null</td><td>Non</td><td>Titre optionnel.</td></tr>
          <tr><td><code>pageName</code></td><td><code>string | null</code></td><td>null</td><td>Non</td><td>Nom de page pour contexte.</td></tr>
          <tr><td><code>pageIcon</code></td><td><code>string | null</code></td><td>null</td><td>Non</td><td>Icône HTML pour la page.</td></tr>
          <tr><td><code>onClose</code></td><td><code>() =&gt; void</code></td><td>—</td><td>Oui</td><td>Callback à la fermeture.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={'bpm.toast("Sauvegarde effectuée.", type="success")'} language="python" />
      <CodeBlock code={'bpm.toast("Erreur réseau.", type="error")'} language="python" />
      <CodeBlock code={'bpm.toast("Vérifiez les champs.", type="warning")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
