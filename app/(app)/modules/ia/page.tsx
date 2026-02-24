"use client";

import Link from "next/link";
import { AIChat } from "@/components/AIChat/AIChat";
import { useAIHeader } from "@/contexts/AIHeaderContext";

const ASSISTANT_NAME = "Assistant";

export default function IAPage() {
  const ctx = useAIHeader();

  return (
    <div style={{ height: "calc(100vh - 64px)", display: "flex", flexDirection: "column" }}>
      <div id="documentation" className="doc-page-header" style={{ flexShrink: 0 }}>
        <div>
          <div className="doc-breadcrumb">
            <Link href="/modules">Modules</Link> → IA
          </div>
          <h1 style={{ margin: 0 }}>{ASSISTANT_NAME}</h1>
          <p className="doc-description" style={{ margin: "0.25rem 0 0" }}>
            Assistant conversationnel (Ollama par défaut, Claude en fallback). Contexte Wiki et Documents. Ollama ⏱ 1 min) &gt; Voir exactement ce que l&apos;on a fait pour Oliver dans Portfolio Manager
          </p>
          <div className="doc-meta" style={{ marginTop: 4 }}>
            <span className="doc-badge doc-badge-category">Ollama</span>
            <span className="doc-reading-time">⏱ 1 min</span>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
        {ctx ? (
          <AIChat
            historyOpen={ctx.historyOpen}
            onCloseHistory={() => ctx.setHistoryOpen(false)}
            newDiscussionTrigger={ctx.newDiscussionTrigger}
            assistantName={ASSISTANT_NAME}
          />
        ) : (
          <AIChat assistantName={ASSISTANT_NAME} />
        )}
      </div>
    </div>
  );
}
