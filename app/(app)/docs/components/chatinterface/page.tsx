"use client";

import { useState } from "react";
import Link from "next/link";
import { ChatInterface, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import type { ChatMessage } from "@/components/bpm";

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: "1", role: "user", content: "Bonjour !" },
  { id: "2", role: "assistant", content: "Bonjour, comment puis-je vous aider ?" },
];

export default function DocChatInterfacePage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [placeholder, setPlaceholder] = useState("Écrivez votre message...");
  const [systemContext, setSystemContext] = useState("");
  const [height, setHeight] = useState("100%");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = (content: string) => {
    const userMsg: ChatMessage = { id: String(Date.now()), role: "user", content };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: String(Date.now() + 1), role: "assistant", content: "Réponse simulée à : " + content },
      ]);
      setIsLoading(false);
    }, 500);
  };

  const pyPlaceholder = placeholder !== "Écrivez votre message..." ? `, placeholder="${placeholder.replace(/"/g, '\\"')}"` : "";
  const pySystemContext = systemContext.trim() ? `, systemContext="${systemContext.trim().replace(/"/g, '\\"')}"` : "";
  const pyHeight = height !== "100%" ? `, height="${height.replace(/"/g, '\\"')}"` : "";
  const pyLoading = isLoading ? ", isLoading=True" : "";
  const pythonCode = `bpm.chatInterface(messages=msgs, onSend=handle_send${pyPlaceholder}${pySystemContext}${pyHeight}${pyLoading})`;
  const { prev, next } = getPrevNext("chatinterface");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.chatInterface</div>
        <h1>bpm.chatInterface</h1>
        <p className="doc-description">Interface de chat (messages, saisie, streaming).</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">IA &amp; Spécialisés</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview" style={{ height: 340 }}>
          <ChatInterface
            messages={messages}
            onSend={handleSend}
            placeholder={placeholder}
            systemContext={systemContext.trim() || undefined}
            height={height}
            isLoading={isLoading}
          />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>placeholder</label>
            <input type="text" value={placeholder} onChange={(e) => setPlaceholder(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>systemContext</label>
            <input type="text" value={systemContext} onChange={(e) => setSystemContext(e.target.value)} placeholder="Contexte système (optionnel)" />
          </div>
          <div className="sandbox-control-group">
            <label>height</label>
            <input type="text" value={height} onChange={(e) => setHeight(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>isLoading</label>
            <select value={isLoading ? "true" : "false"} onChange={(e) => setIsLoading(e.target.value === "true")}>
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
          <tr><td><code>messages</code></td><td><code>ChatMessage[]</code></td><td>—</td><td>Oui</td><td>Liste des messages (id, role, content, timestamp?).</td></tr>
          <tr><td><code>onSend</code></td><td><code>(content: string) =&gt; void</code></td><td>—</td><td>Oui</td><td>Envoi d&apos;un message utilisateur.</td></tr>
          <tr><td><code>isLoading</code></td><td><code>boolean</code></td><td>false</td><td>Non</td><td>Affiche un indicateur de chargement (réponse en cours).</td></tr>
          <tr><td><code>placeholder</code></td><td><code>string</code></td><td>&quot;Écrivez votre message...&quot;</td><td>Non</td><td>Placeholder du champ de saisie.</td></tr>
          <tr><td><code>systemContext</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Contexte système affiché en haut si défini.</td></tr>
          <tr><td><code>height</code></td><td><code>string</code></td><td>100%</td><td>Non</td><td>Hauteur du conteneur.</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Classes CSS.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={'bpm.chatInterface(messages=msgs, onSend=send_message)'} language="python" />
      <CodeBlock code={'bpm.chatInterface(messages=msgs, onSend=send_message, isLoading=loading)'} language="python" />
      <CodeBlock code={'bpm.chatInterface(messages=msgs, onSend=send_message, systemContext="Assistant support client")'} language="python" />
      <CodeBlock code={'bpm.chatInterface(messages=msgs, onSend=send_message, placeholder="Posez votre question...", height="400px")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
