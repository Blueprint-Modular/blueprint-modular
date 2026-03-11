"use client";

import { useState } from "react";
import Link from "next/link";
import { PromptInput, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

export default function DocPromptInputPage() {
  const [value, setValue] = useState("");
  const [placeholder, setPlaceholder] = useState("Posez votre question...");
  const [showTokenCount, setShowTokenCount] = useState(false);

  const pyPlaceholder = placeholder !== "Écrivez votre message..." ? `, placeholder="${placeholder.replace(/"/g, '\\"')}"` : "";
  const pyToken = showTokenCount ? ", show_token_count=True" : "";
  const pythonCode = `bpm.promptInput(value=state_value, onChange=set_value, onSubmit=handle_submit${pyPlaceholder}${pyToken})`;
  const { prev, next } = getPrevNext("promptinput");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.promptInput</div>
        <h1>bpm.promptInput</h1>
        <p className="doc-description">Champ de saisie pour prompt IA (auto-resize, Cmd+Enter, tokens).</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">IA & Spécialisés</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <PromptInput
            value={value}
            onChange={setValue}
            onSubmit={() => setValue("")}
            placeholder={placeholder}
            showTokenCount={showTokenCount}
          />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>placeholder</label>
            <input type="text" value={placeholder} onChange={(e) => setPlaceholder(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>showTokenCount</label>
            <select value={showTokenCount ? "true" : "false"} onChange={(e) => setShowTokenCount(e.target.value === "true")}>
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
          <tr><td><code>value</code></td><td><code>string</code></td><td>—</td><td>Oui</td><td>Valeur contrôlée.</td></tr>
          <tr><td><code>onChange</code></td><td><code>(value: string) =&gt; void</code></td><td>—</td><td>Oui</td><td>Callback à chaque changement.</td></tr>
          <tr><td><code>onSubmit</code></td><td><code>(value: string) =&gt; void</code></td><td>—</td><td>Oui</td><td>Callback à l&apos;envoi (Cmd+Enter).</td></tr>
          <tr><td><code>placeholder</code></td><td><code>string</code></td><td>Écrivez votre message...</td><td>Non</td><td>Placeholder du textarea.</td></tr>
          <tr><td><code>showTokenCount</code></td><td><code>boolean</code></td><td>false</td><td>Non</td><td>Affiche indicateur de tokens.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={"bpm.promptInput(value=val, onChange=set_val, onSubmit=send)"} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
