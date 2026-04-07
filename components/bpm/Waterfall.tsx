"use client";

import React, { useMemo } from "react";

export interface WaterfallDatum {
  label: string;
  value: number;
  type?: "start" | "delta" | "total";
}

export interface WaterfallProps {
  data: WaterfallDatum[];
  width?: number;
  height?: number;
  className?: string;
}

export function Waterfall({
  data,
  width = 480,
  height = 260,
  className = "",
}: WaterfallProps) {
  const { bars, connectors, scale } = useMemo(() => {
    const pad = { l: 48, r: 16, t: 16, b: 36 };
    const innerW = width - pad.l - pad.r;
    const innerH = height - pad.t - pad.b;
    if (data.length === 0) {
      return {
        bars: [] as { x: number; y: number; w: number; h: number; label: string; fill: string }[],
        connectors: [] as { x1: number; y1: number; x2: number; y2: number }[],
        scale: { pad, innerH, minY: 0, span: 1 },
      };
    }
    let y = 0;
    const steps: { label: string; y0: number; y1: number; kind: string }[] = [];
    for (const d of data) {
      const v = d.value;
      const y1 = y + v;
      steps.push({
        label: d.label,
        y0: y,
        y1,
        kind: d.type ?? "delta",
      });
      y = y1;
    }
    const minY = Math.min(0, ...steps.map((s) => Math.min(s.y0, s.y1)));
    const maxY = Math.max(0, ...steps.map((s) => Math.max(s.y0, s.y1)));
    const span = maxY - minY || 1;
    const scaleY = (val: number) => pad.t + innerH - ((val - minY) / span) * innerH;

    const bw = innerW / Math.max(1, data.length);
    const bars = steps.map((s, i) => {
      const x = pad.l + i * bw + bw * 0.12;
      const wBar = bw * 0.76;
      const top = scaleY(Math.max(s.y0, s.y1));
      const bot = scaleY(Math.min(s.y0, s.y1));
      return {
        x,
        y: top,
        w: wBar,
        h: Math.max(2, bot - top),
        label: s.label,
        fill:
          s.kind === "total"
            ? "var(--bpm-accent)"
            : s.y1 >= s.y0
              ? "var(--bpm-success-soft)"
              : "var(--bpm-error-soft)",
      };
    });

    const connectors: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i < steps.length - 1; i++) {
      const s = steps[i];
      const xMid = pad.l + (i + 1) * bw - bw * 0.12;
      const yEnd = scaleY(s.y1);
      connectors.push({
        x1: xMid,
        y1: yEnd,
        x2: pad.l + (i + 1) * bw + bw * 0.12,
        y2: yEnd,
      });
    }

    return { bars, connectors, scale: { pad, innerH, minY, span } };
  }, [data, width, height]);

  return (
    <svg
      width={width}
      height={height}
      className={className}
      style={{ background: "var(--bpm-bg-secondary)", borderRadius: "var(--bpm-radius)" }}
      role="img"
      aria-label="Waterfall"
    >
      <line
        x1={scale.pad.l}
        y1={height - scale.pad.b}
        x2={width - scale.pad.r}
        y2={height - scale.pad.b}
        stroke="var(--bpm-border-strong)"
      />
      {connectors.map((c, i) => (
        <line
          key={i}
          x1={c.x1}
          y1={c.y1}
          x2={c.x2}
          y2={c.y2}
          stroke="var(--bpm-text-muted)"
          strokeWidth={1}
          strokeDasharray="4 3"
        />
      ))}
      {bars.map((b, i) => (
        <g key={i}>
          <rect
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            fill={b.fill}
            stroke="var(--bpm-border-strong)"
            strokeWidth={1}
          />
          <text
            x={b.x + b.w / 2}
            y={height - 8}
            textAnchor="middle"
            fontSize={11}
            fill="var(--bpm-text-secondary)"
          >
            {b.label.length > 10 ? b.label.slice(0, 9) + "…" : b.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
