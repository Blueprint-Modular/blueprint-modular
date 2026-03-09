"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";

export interface MarkdownProps {
  /** Contenu Markdown. Utilisez `---` sur une ligne pour une ligne horizontale (hr). */
  text: string;
  className?: string;
}

/**
 * @component bpm.markdown
 * @description Affiche du contenu formaté en Markdown (titres, listes, gras, code) pour notices et documentation métier.
 * @example
 * bpm.markdown({ text: "## Procédure\n\n1. Valider le devis\n2. Envoyer au client." })
 * @props
 * - text (string) — Contenu Markdown (utiliser `---` pour une ligne horizontale).
 * - className (string, optionnel) — Classes CSS.
 * @usage Notices, FAQ, procédures, documentation produit.
 * @context PARENT: bpm.panel | bpm.card | bpm.tabs. ASSOCIATED: bpm.title, bpm.codeBlock. FORBIDDEN: aucun.
 */
export function Markdown({ text, className = "" }: MarkdownProps) {
  return (
    <div
      className={`bpm-markdown ${className}`.trim()}
      style={{ color: "var(--bpm-text-primary)" }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          hr: () => (
            <hr
              className="bpm-markdown-hr my-4 border-0 border-t"
              style={{ borderColor: "var(--bpm-border)" }}
            />
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
