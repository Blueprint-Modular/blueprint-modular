"use client";

import { useState } from "react";
import Link from "next/link";
import { ModelSelector, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

const DEMO_MODELS = [
  { id: "gpt-4o", label: "GPT-4o", provider: "OpenAI", capabilities: ["chat", "vision"], contextWindow: 128000 },
  { id: "claude-3", label: "Claude 3", provider: "Anthropic", capabilities: ["chat"], contextWindow: 200000 },
];

export default function DocModelSelectorPage() {
  const [selected, setSelected] = useState("gpt-4o");
  const [showCapabilities, setShowCapabilities] = useState(true);

  const pythonCode = `bpm.modelSelector(\n  models=${JSON.stringify(DEMO_MODELS)},\n  selected="${selected}",\n  onChange=set_selected${!showCapabilities ? ",\n  show_capabilities=False" : ""}\n)`;
  const { prev, next } = getPrevNext("modelselector");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.modelSelector</div>
        <h1>bpm.modelSelector</h1>
        <p className="doc-description">Sélecteur de modèle IA (par fournisseur, capacités).</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">IA & Spécialisés</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <ModelSelector
            models={DEMO_MODELS}
            selected={selected}
            onChange={setSelected}
            showCapabilities={showCapabilities}
          />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>selected</label>
            <select value={selected} onChange={(e) => setSelected(e.target.value)}>
              {DEMO_MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>showCapabilities</label>
            <select value={showCapabilities ? "true" : "false"} onChange={(e) => setShowCapabilities(e.target.value === "true")}>
              <option value="true">true</option>
              <option value="false">false</option>
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
          <tr><td><code>models</code></td><td><code>ModelOption[]</code></td><td>—</td><td>Oui</td><td>Liste des modèles (id, label, provider, capabilities?, contextWindow?).</td></tr>
          <tr><td><code>selected</code></td><td><code>string</code></td><td>—</td><td>Oui</td><td>ID du modèle sélectionné.</td></tr>
          <tr><td><code>onChange</code></td><td><code>(modelId: string) =&gt; void</code></td><td>—</td><td>Oui</td><td>Callback au changement de modèle.</td></tr>
          <tr><td><code>showCapabilities</code></td><td><code>boolean</code></td><td>true</td><td>Non</td><td>Afficher les badges de capacités.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={"models = [{\"id\": \"gpt-4o\", \"label\": \"GPT-4o\", \"provider\": \"OpenAI\"}]\nbpm.modelSelector(models=models, selected=current, onChange=set_current)"} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
