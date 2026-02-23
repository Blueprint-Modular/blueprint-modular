"use client";

import { useState } from "react";
import Link from "next/link";
import { Message, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

type MessageType = "info" | "success" | "warning" | "error";

export default function DocMessagePage() {
  const [type, setType] = useState<MessageType>("info");
  const [content, setContent] = useState("Votre modification a bien été enregistrée.");

  const escapedContent = content.replace(/"/g, '\\"');
  const pythonCode = `bpm.message(type="${type}", content="${escapedContent}")`;
  const { prev, next } = getPrevNext("message");

  return (
    <div className="max-w-4xl">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">Documentation → Composants → bpm.message</div>
        <h1>bpm.message</h1>
        <p className="doc-description">Bandeau avec type info, success, warning ou error.</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Feedback</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Message type={type}>{content}</Message>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>type</label>
            <select value={type} onChange={(e) => setType(e.target.value as MessageType)}>
              <option value="info">info</option>
              <option value="success">success</option>
              <option value="warning">warning</option>
              <option value="error">error</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>Contenu</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="w-full p-2 border rounded text-sm bg-[var(--bpm-surface)] text-[var(--bpm-text-primary)] border-[var(--bpm-border)]"
            />
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
          <tr>
            <td><code>type</code></td>
            <td><code>info | success | warning | error</code></td>
            <td><code>info</code></td>
            <td>Non</td>
            <td>Style du message.</td>
          </tr>
          <tr>
            <td><code>children</code></td>
            <td><code>ReactNode</code></td>
            <td>—</td>
            <td>Oui</td>
            <td>Contenu du message.</td>
          </tr>
          <tr>
            <td><code>className</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>Non</td>
            <td>Classes CSS.</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={'bpm.message(type="success", content="Sauvegarde OK.")'} language="python" />
      <CodeBlock code={'bpm.message(type="warning", content="Action irreversible.")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
