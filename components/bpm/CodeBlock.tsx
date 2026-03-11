"use client";

import React, { useState } from "react";

export interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

/**
 * @component bpm.codeBlock
 * @description Affiche un bloc de code avec coloration syntaxique et bouton Copier pour documentation technique ou procédures.
 * @example
 * bpm.codeBlock({ code: "npm install @blueprint-modular/core", language: "bash" })
 * @props
 * - code (string) — Contenu du bloc de code.
 * - language (string, optionnel) — Langage pour coloration (bash, json, typescript…). Default: 'text'.
 * - className (string, optionnel) — Classes CSS.
 * @usage Documentation API, procédures d'installation, exemples de requêtes.
 * @context PARENT: bpm.panel | bpm.card. ASSOCIATED: bpm.markdown, bpm.title. FORBIDDEN: aucun.
 */
export function CodeBlock({ code, language = "text", className = "" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre
        className={`p-4 rounded-lg overflow-x-auto text-sm ${className}`}
        style={{
          background: "var(--bpm-code-bg)",
          border: "1px solid var(--bpm-border)",
          color: "var(--bpm-text-primary)",
        }}
      >
        <code>{code}</code>
      </pre>
      <button
        type="button"
        onClick={copy}
        className="absolute top-2 right-2 px-2 py-1.5 rounded-lg text-sm font-medium opacity-80 group-hover:opacity-100"
        style={{ background: "var(--bpm-accent)", color: "var(--bpm-accent-contrast)" }}
      >
        {copied ? "Copié" : "Copier"}
      </button>
    </div>
  );
}
