"use client";

import React, { useMemo } from "react";

export type SparklineTrend = "up" | "down" | "flat";

export interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  trend?: SparklineTrend;
  className?: string;
}

const trendColor: Record<SparklineTrend, string> = {
  up: "var(--bpm-success)",
  down: "var(--bpm-error)",
  flat: "var(--bpm-text-secondary)",
};

/**
 * Courbe SVG compacte avec couleur selon la tendance.
 */
export function Sparkline({
  values,
  width = 120,
  height = 36,
  trend = "flat",
  className = "",
}: SparklineProps) {
  const points = useMemo(() => {
    if (!values.length) return "";
    const min = Math.min(...values);
    const max = Math.max(...values);
    const r = max - min || 1;
    const pad = 2;
    const w = width - pad * 2;
    const h = height - pad * 2;
    return values
      .map((v, i) => {
        const x = pad + (i / Math.max(1, values.length - 1)) * w;
        const y = pad + h - ((v - min) / r) * h;
        return `${x},${y}`;
      })
      .join(" ");
  }, [values, width, height]);

  const stroke = trendColor[trend];

  if (!values.length) {
    return (
      <svg width={width} height={height} className={className} aria-hidden>
        <line x1={2} y1={height / 2} x2={width - 2} y2={height / 2} stroke="var(--bpm-border)" strokeWidth={1} />
      </svg>
    );
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden
      style={{ display: "block" }}
    >
      <polyline fill="none" stroke={stroke} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}
