"use client";

import React from "react";

export interface TextProps {
  children: React.ReactNode;
  /** Style inline comme st.text (monospace). */
  mono?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * @component bpm.text
 * @description Affiche un paragraphe ou bloc de texte dans une page ou un formulaire (équivalent st.write / st.text).
 * @example
 * bpm.text({ children: "Chiffre d'affaires Q3 : 1,2 M€." })
 * @props
 * - children (ReactNode) — Contenu texte à afficher.
 * - mono (boolean, optionnel) — Police monospace. Default: false.
 * - className (string, optionnel) — Classes CSS.
 * - style (object, optionnel) — Styles inline.
 * @usage Corps de texte dans rapports, fiches produit, messages d'aide.
 * @context
 * PARENT: bpm.panel | bpm.card | bpm.modal.
 * ASSOCIATED: bpm.caption, bpm.markdown, bpm.title.
 * FORBIDDEN: aucun.
 */
export function Text({ children, mono = false, className = "", style = {} }: TextProps) {
  return (
    <span
      className={`bpm-text ${mono ? "font-mono text-sm" : ""} ${className}`.trim()}
      style={{ color: "var(--bpm-text-primary)", ...style }}
    >
      {children}
    </span>
  );
}
