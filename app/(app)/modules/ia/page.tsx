import Link from "next/link";
import { AIChat } from "@/components/AIChat/AIChat";

export default function IAPage() {
  return (
    <div style={{ height: "calc(100vh - 64px)", display: "flex", flexDirection: "column" }}>
      <div className="doc-page-header" style={{ flexShrink: 0 }}>
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → Module IA</div>
        <h1>Module IA</h1>
        <p className="doc-description">
          Assistant conversationnel : Claude, GPT, Gemini ou Grok. Utilisez @claude, @gpt dans le chat pour choisir le modèle.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Module</span>
          <span className="doc-reading-time">⏱ 1 min</span>
        </div>
      </div>
      <div style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
        <AIChat />
      </div>
    </div>
  );
}
