"use client";

import React, { useMemo } from "react";export interface LineChartDatum {
  x: number | string;
  y: number;
}

export interface LineChartProps {
  data: LineChartDatum[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export function LineChart(p: LineChartProps) {
  const { data, width = 400, height = 200, color = "var(--bpm-accent-cyan)", className = "" } = p;
  const path = useMemo(() => {
    if (!data.length) return "";
    const xs = data.map((d, i) => (typeof d.x === "number" ? d.x : Number(d.x) || i));
    const ys = data.map((d) => d.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const pad = 10;
    const w = width - pad * 2;
    const h = height - pad * 2;
    const xScale = (v: number) => pad + ((v - minX) / rangeX) * w;
    const yScale = (v: number) => height - pad - ((v - minY) / rangeY) * h;
    return "M" + data.map((_, i) => xScale(xs[i]) + "," + yScale(ys[i])).join("L");
  }, [data, width, height]);
  if (!data.length) return <div className={"bpm-line-chart " + className} style={{ width, height, background: "var(--bpm-bg-secondary)", borderRadius: 8 }} />;
  return (
    <svg width={width} height={height} className={"bpm-line-chart " + className} style={{ overflow: "visible" }}>
      <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}