"use client";

import React, { useState } from "react";

export interface ExpanderProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

/**
 * @component bpm.expander
 * @description Bloc dépliable avec titre pour masquer/afficher du contenu (détails, annexes).
 * @example
 * bpm.expander({ title: "Détails techniques", defaultExpanded: false, children: "..." })
 * @props
 * - title (ReactNode) — Titre du bloc (visible quand replié).
 * - children (ReactNode) — Contenu dépliable.
 * - defaultExpanded (boolean, optionnel) — Ouvert au montage. Default: false.
 * - className (string, optionnel) — Classes CSS.
 * @usage Détails commande, annexes contrat, section technique.
 * @context PARENT: bpm.panel | bpm.card. ASSOCIATED: bpm.accordion, bpm.table. FORBIDDEN: aucun.
 */
export function Expander({
  title,
  children,
  defaultExpanded = false,
  className = "",
}: ExpanderProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`bpm-expander border rounded-lg overflow-hidden ${className}`.trim()} style={{ borderColor: "var(--bpm-border)" }}>
      <button
        type="button"
        className={`bpm-expander-header w-full flex items-center gap-2 px-4 py-3 text-left text-sm font-medium border-0 cursor-pointer transition-colors ${
          isExpanded ? "bpm-expander-open" : "bpm-expander-closed"
        }`}
        style={{
          background: "var(--bpm-bg-secondary)",
          color: "var(--bpm-text-primary)",
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="bpm-expander-icon flex-shrink-0" style={{ color: "var(--bpm-text-secondary)" }}>
          {isExpanded ? "▾" : "▸"}
        </span>
        <span className="bpm-expander-title">{title}</span>
      </button>
      {isExpanded && (
        <div className="bpm-expander-content px-4 py-3 border-t" style={{ borderColor: "var(--bpm-border)", color: "var(--bpm-text-primary)" }}>
          {children}
        </div>
      )}
    </div>
  );
}
