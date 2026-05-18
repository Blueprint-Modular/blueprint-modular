"use client";

import React from "react";

/**
 * @component bpm.html
 * @description Affiche du HTML brut. À utiliser uniquement avec du contenu de confiance ou préalablement sanitisé.
 * @example
 * bpm.html({ html: "<p>Contenu <strong>HTML</strong></p>" })
 *
 * @param {object} props
 * @param {string} props.html - Contenu HTML brut à afficher. Obligatoire.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 * @param {React.CSSProperties} [props.style={}] - Styles inline additionnels. Optionnel.
 */
export interface HtmlProps {
  /** HTML brut à afficher (équivalent st.html). À n'utiliser qu'avec du contenu de confiance ou sanitized. */
  html: string;
  className?: string;
  style?: React.CSSProperties;
}

export function Html({ html, className = "", style = {} }: HtmlProps) {
  return (
    <div
      className={"bpm-html " + className}
      style={{ color: "var(--bpm-text-primary)", ...style }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
