"use client";

import React from "react";

export interface CaptionProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * @component bpm.caption
 * @description Légende ou texte secondaire sous un bloc (graphique, carte, champ) pour contexte métier.
 * @example
 * bpm.caption({ children: "Données CA 2024 — source DGFiP." })
 * @props
 * - children (ReactNode) — Texte de la légende.
 * - className (string, optionnel) — Classes CSS.
 * - style (object, optionnel) — Styles inline.
 * @usage Légendes de graphiques, sources de données, hints sous champs.
 * @context
 * PARENT: bpm.panel | bpm.card | bpm.plotlyChart.
 * ASSOCIATED: bpm.plotlyChart, bpm.table, bpm.image.
 * FORBIDDEN: aucun.
 */
export function Caption({ children, className = "", style = {} }: CaptionProps) {
  return (
    <p
      className={"bpm-caption text-sm " + className}
      style={{ color: "var(--bpm-text-secondary)", ...style }}
    >
      {children}
    </p>
  );
}
