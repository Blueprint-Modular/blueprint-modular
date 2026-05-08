"use client";

import React from "react";

export interface ColumnProps {
  /** Nombre de colonnes (1, 2, 3, 4, etc.). */
  columns?: number;
  /** Espacement entre les colonnes (CSS, ex. "1rem", 16). */
  gap?: number | string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * @component bpm.column
 * @description Conteneur en grille pour organiser le contenu en colonnes avec espacement configurable.
 * @example
 * bpm.column({ columns: 3, gap: "1rem", children: [<Card />, <Card />, <Card />] })
 *
 * @param {object} props
 * @param {number} [props.columns=2] - Nombre de colonnes (1 à 12). Optionnel.
 * @param {number|string} [props.gap="1rem"] - Espacement entre colonnes. Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 * @param {ReactNode} [props.children] - Contenu des colonnes. Optionnel.
 *
 * @associated bpm.grid, bpm.container, bpm.row
 */
export function Column({
  columns = 2,
  gap = "1rem",
  className = "",
  children,
}: ColumnProps) {
  const n = Math.max(1, Math.min(12, columns));
  const gapVal = typeof gap === "number" ? `${gap}px` : gap;
  const style: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
    gap: gapVal,
  };
  return (
    <div className={`bpm-column ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}
