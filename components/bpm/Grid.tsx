"use client";

import React from "react";

export interface GridProps {
  cols?: number | { xs?: number; sm?: number; md?: number; lg?: number };
  gap?: number | string;
  className?: string;
  children?: React.ReactNode;
}

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
    gap: gapVal,
    gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
  };
  return (
    <div className={`bpm-grid grid ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}
