"use client";

import React from "react";

export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * @component bpm.container
 * @description Conteneur de mise en page pour centrer et limiter la largeur du contenu (pages, formulaires).
 * @example
 * bpm.container({ children: "..." })
 * @props
 * - children (ReactNode) — Contenu.
 * - className (string, optionnel) — Classes CSS.
 * - style (object, optionnel) — Styles inline.
 * @usage Wrapper de page, zone principale formulaire.
 * @context
 * PARENT: page directe | layout.
 * ASSOCIATED: bpm.panel, bpm.grid, bpm.title.
 * FORBIDDEN: aucun.
 */
export function Container({ children, className = "", style = {} }: ContainerProps) {
  return <div className={"bpm-container " + className} style={style}>{children}</div>;
}
