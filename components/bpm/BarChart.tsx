"use client";

import React, { useMemo } from "react";

export interface BarChartDatum {
  x: number | string;
  y: number;
}

export interface BarChartProps {
  data: BarChartDatum[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export function BarChart(p: BarChartProps) {
  const { data, width = 400, height = 200, color = "var(--bpm-accent-cyan)", className = "" } = p;
  const bars = useMemo(() => {
    if (!data.length) return [];
    const ys = data.map((d) => d.y);
    const maxY = Math.max(...ys, 1);
    const pad = 20;
    const barW = Math.max(2, (width - pad * 2) / data.length - 4);
    const h = height - pad * 2;
    return data.map((d, i) => ({
      x: pad + i * ((width - pad * 2) / data.length) + 2,
      w: barW,
      h: (d.y / maxY) * h,
      y: height - pad - (d.y / maxY) * h,
    }));
  }, [data, width, height]);
  if (!data.length) {
    return <div className={"bpm-bar-chart w-full max-w-full " + className} style={{ aspectRatio: `${width}/${height}`, maxWidth: width, background: "var(--bpm-bg-secondary)", borderRadius: 8 }} />;
  }
  return (
    <div className="w-full max-w-full overflow-hidden" style={{ aspectRatio: `${width}/${height}` }}>
      <svg viewBox={`0 0 ${width} ${height}`} className={"bpm-bar-chart " + className} style={{ width: "100%", height: "auto" }} preserveAspectRatio="xMidYMid meet">
        {bars.map((b, i) => (
          <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} fill={color} rx={2} />
        ))}
      </svg>
    </div>
  );
}
