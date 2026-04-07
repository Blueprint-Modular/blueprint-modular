"use client";

import React, { useMemo } from "react";

export interface PredictiveChartProps {
  historical: { x: number; y: number }[];
  predicted: { x: number; y: number }[];
  confidenceUpper?: { x: number; y: number }[];
  confidenceLower?: { x: number; y: number }[];
  todayX?: number;
  width?: number;
  height?: number;
  className?: string;
}

function pathLine(pts: { x: number; y: number }[], sx: (x: number) => number, sy: (y: number) => number) {
  if (pts.length === 0) return "";
  return pts
    .map((p, i) => `${i === 0 ? "M" : "L"} ${sx(p.x)} ${sy(p.y)}`)
    .join(" ");
}

export function PredictiveChart({
  historical,
  predicted,
  confidenceUpper,
  confidenceLower,
  todayX,
  width = 520,
  height = 220,
  className = "",
}: PredictiveChartProps) {
  const pad = { l: 36, r: 16, t: 12, b: 28 };
  const innerW = width - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;

  const { sx, sy } = useMemo(() => {
    const all = [...historical, ...predicted, ...(confidenceUpper ?? []), ...(confidenceLower ?? [])];
    const xs = all.map((p) => p.x);
    const ys = all.map((p) => p.y);
    const minX = Math.min(...xs, 0);
    const maxX = Math.max(...xs, 1);
    const minY = Math.min(...ys, 0);
    const maxY = Math.max(...ys, 1);
    const dx = maxX - minX || 1;
    const dy = maxY - minY || 1;
    const sx = (x: number) => pad.l + ((x - minX) / dx) * innerW;
    const sy = (y: number) => pad.t + innerH - ((y - minY) / dy) * innerH;
    return { sx, sy };
  }, [historical, predicted, confidenceUpper, confidenceLower, innerW, innerH, pad.l, pad.t]);

  const histPath = pathLine(historical, sx, sy);
  const predPath = pathLine(predicted, sx, sy);

  let bandPath = "";
  if (
    confidenceUpper &&
    confidenceLower &&
    confidenceUpper.length === confidenceLower.length
  ) {
    const pts: string[] = [];
    confidenceUpper.forEach((p) => pts.push(`${sx(p.x)},${sy(p.y)}`));
    [...confidenceLower].reverse().forEach((p) => pts.push(`${sx(p.x)},${sy(p.y)}`));
    bandPath = `M ${pts.join(" L ")} Z`;
  }

  const tx = todayX != null ? sx(todayX) : null;

  return (
    <svg
      width={width}
      height={height}
      className={className}
      style={{ background: "var(--bpm-bg-secondary)", borderRadius: "var(--bpm-radius)" }}
      role="img"
      aria-label="Prévision"
    >
      <rect
        x={pad.l}
        y={pad.t}
        width={innerW}
        height={innerH}
        fill="var(--bpm-surface)"
        stroke="var(--bpm-border)"
      />
      {bandPath ? (
        <path d={bandPath} fill="var(--bpm-accent-soft)" stroke="none" opacity={0.85} />
      ) : null}
      {histPath ? (
        <path
          d={histPath}
          fill="none"
          stroke="var(--bpm-accent)"
          strokeWidth={2.5}
        />
      ) : null}
      {predPath ? (
        <path
          d={predPath}
          fill="none"
          stroke="var(--bpm-accent)"
          strokeWidth={2}
          strokeDasharray="6 4"
          opacity={0.95}
        />
      ) : null}
      {tx != null ? (
        <line
          x1={tx}
          y1={pad.t}
          x2={tx}
          y2={height - pad.b}
          stroke="var(--bpm-warning)"
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
      ) : null}
    </svg>
  );
}
