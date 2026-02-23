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
