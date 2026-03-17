"use client";

import React, { useEffect, useRef } from "react";
import { Markdown } from "./Markdown";

export interface StreamingTextProps {
  /** Texte courant (s'allonge au fil du stream). */
  content: string;
  /** Affiche le curseur clignotant quand true. */
  isStreaming?: boolean;
  /** Passe le contenu dans bpm.markdown (défaut true). */
  renderMarkdown?: boolean;
  className?: string;
}

export function StreamingText({
  content,
  isStreaming = false,
  renderMarkdown = true,
  className = "",
}: StreamingTextProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [content]);

  return (
    <div
      className={className ? `bpm-streaming-text ${className}`.trim() : "bpm-streaming-text"}
      style={{
        position: "relative",
        color: "var(--bpm-text-primary)",
        width: "100%",
        minWidth: 0,
        overflowWrap: "break-word",
      }}
    >
      {content ? (
        renderMarkdown ? (
          <Markdown text={content} />
        ) : (
          <div style={{ whiteSpace: "pre-wrap", fontSize: "var(--bpm-font-size-base)", lineHeight: 1.6 }}>{content}</div>
        )
      ) : null}
      {isStreaming && (
        <span
          ref={endRef}
          aria-hidden
          style={{
            display: "inline-block",
            width: 2,
            height: "1em",
            marginLeft: 2,
            background: "var(--bpm-accent)",
            animation: "bpm-cursor-blink 1s step-end infinite",
            verticalAlign: "text-bottom",
          }}
        />
      )}
      <style>{`
        @keyframes bpm-cursor-blink {
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
