"use client";

import React, { useMemo } from "react";

export interface RadarChartProps {
  axes: string[];
  values: number[];
  max?: number;
  width?: number;
  height?: number;
  className?: string;
}

export function RadarChart({
  axes,
  values,
  max: maxIn,
  width = 320,
  height = 320,
  className = "",
}: RadarChartProps) {
  const cx = width / 2;
  const cy = height / 2;
  const R = Math.min(width, height) * 0.38;
  const n = axes.length;
  const max = maxIn ?? Math.max(1, ...values, 1);

  const pts = useMemo(() => {
    return values.map((v, i) => {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      const t = Math.min(1, Math.max(0, v / max));
      return {
        x: cx + R * t * Math.cos(a),
        y: cy + R * t * Math.sin(a),
        lx: cx + (R + 14) * Math.cos(a),
        ly: cy + (R + 14) * Math.sin(a),
        a,
      };
    });
  }, [values, n, cx, cy, R, max]);

  const poly = pts.map((p) => `${p.x},${p.y}`).join(" ");

  const rings = 4;

  return (
    <svg
      width={width}
      height={height}
      className={className}
      style={{ background: "var(--bpm-bg-secondary)", borderRadius: "var(--bpm-radius)" }}
      role="img"
      aria-label="Radar"
    >
      {Array.from({ length: rings }, (_, k) => {
        const rr = (R * (k + 1)) / rings;
        const ringPts = Array.from({ length: n }, (_, i) => {
          const a = (i / n) * Math.PI * 2 - Math.PI / 2;
          return `${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`;
        }).join(" ");
        return (
          <polygon
            key={k}
            points={ringPts}
            fill="none"
            stroke="var(--bpm-border)"
            strokeWidth={1}
          />
        );
      })}
      {axes.map((label, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        const x2 = cx + R * Math.cos(a);
        const y2 = cy + R * Math.sin(a);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x2}
            y2={y2}
            stroke="var(--bpm-border-strong)"
            strokeWidth={1}
          />
        );
      })}
      <polygon
        points={poly}
        fill="var(--bpm-accent-soft)"
        stroke="var(--bpm-accent)"
        strokeWidth={2}
      />
      {axes.map((label, i) => {
        const p = pts[i];
        return (
          <text
            key={`l-${i}`}
            x={p.lx}
            y={p.ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={11}
            fill="var(--bpm-text-primary)"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}
