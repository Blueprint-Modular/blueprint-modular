"use client";

import Link from "next/link";
import { AIChat } from "@/components/AIChat/AIChat";
import { useAIHeader } from "@/contexts/AIHeaderContext";

const ASSISTANT_NAME = "Assistant";

export default function IAPage() {
  const ctx = useAIHeader();

  return (
    <div
      className="ia-page-full-height"
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      <div id="documentation" className="doc-page-header" style={{ flexShrink: 0 }}>
        <div>
          <div className="doc-breadcrumb">
            <Link href="/modules">Modules</Link> → IA
          </div>
          <h1 style={{ margin: 0 }}>{ASSISTANT_NAME}</h1>
          <p className="doc-description" style={{ margin: "0.25rem 0 0" }}>
            Assistant conversationnel. Contexte Wiki et Documents.
          </p>
          <div className="doc-meta" style={{ marginTop: 4 }}>
            <span className="doc-badge doc-badge-category">Qwen</span>
            <span className="doc-reading-time">⏱ 1 min</span>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflow: "hidden", minHeight: 0, display: "flex", flexDirection: "column" }}>
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
