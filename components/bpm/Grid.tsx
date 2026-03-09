"use client";

import React from "react";

export interface GridProps {
  cols?: number | { xs?: number; sm?: number; md?: number; lg?: number };
  gap?: number | string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * @component bpm.grid
 * @description Grille responsive pour aligner des cartes, métriques ou champs (layout dashboard).
 * @example
 * bpm.grid({ cols: 3, gap: 16, children: <> ... </> })
 * @props
 * - cols (number | object, optionnel) — Nombre de colonnes ou breakpoints. Default: 1.
 * - gap (number | string, optionnel) — Espacement entre cellules. Default: '1rem'.
 * - children (ReactNode, optionnel) — Contenu des cellules.
 * - className (string, optionnel) — Classes CSS.
 * @usage Dashboard KPIs, grille de cartes produit, formulaire multi-colonnes.
 * @context
 * PARENT: bpm.panel | bpm.tabs (contenu onglet) | page directe.
 * ASSOCIATED: bpm.metric, bpm.card, bpm.column.
 * FORBIDDEN: aucun.
 */
export function Grid({
  cols = 1,
  gap = "1rem",
  className = "",
  children,
}: GridProps) {
  const gapVal = typeof gap === "number" ? `${gap}px` : gap;
  const isObj = typeof cols === "object" && cols !== null;
  const n = isObj ? 1 : (cols as number);
  const style: React.CSSProperties = {
    display: "grid",
    gap: gapVal,
    gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
  };
  return (
    <div className={`bpm-grid grid ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}
