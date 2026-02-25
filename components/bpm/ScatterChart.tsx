"use client";

import React, { useMemo } from "react";

export interface ScatterChartDatum {
  x: number;
  y: number;
}

export interface ScatterChartProps {
  data: ScatterChartDatum[];
  width?: number;
  height?: number;
  color?: string;
  radius?: number;
  className?: string;
}

export function ScatterChart({ data, width = 400, height = 200, color = "var(--bpm-accent-cyan)", radius = 4, className = "" }: ScatterChartProps) {
  const points = useMemo(() => {
    if (!data.length) return [];
    const xs = data.map((d) => d.x);
    const ys = data.map((d) => d.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const pad = 20;
    const w = width - pad * 2;
    const h = height - pad * 2;
    return data.map((d) => ({
      cx: pad + ((d.x - minX) / rangeX) * w,
      cy: height - pad - ((d.y - minY) / rangeY) * h,
    }));
  }, [data, width, height]);

  if (!data.length) return <div className={"bpm-scatter-chart w-full max-w-full " + className} style={{ aspectRatio: `${width}/${height}`, maxWidth: width, background: "var(--bpm-bg-secondary)", borderRadius: 8 }} />;
  return (
    <div className="w-full max-w-full overflow-hidden" style={{ aspectRatio: `${width}/${height}` }}>
      <svg viewBox={`0 0 ${width} ${height}`} className={"bpm-scatter-chart " + className} style={{ width: "100%", height: "auto" }} preserveAspectRatio="xMidYMid meet">
        {points.map((p, i) => (
          <circle key={i} cx={p.cx} cy={p.cy} r={radius} fill={color} />
        ))}
      </svg>
    </div>
  );
}
