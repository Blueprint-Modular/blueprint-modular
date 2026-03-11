"use client";

import React from "react";

export interface BarcodeProps {
  value: string;
  format?: "EAN13" | "CODE128";
  height?: number;
  width?: number;
  lineColor?: string;
  background?: string;
  className?: string;
}

export function Barcode({
  value,
  format = "CODE128",
  height = 60,
  width = 2,
  lineColor = "var(--bpm-text-primary)",
  background = "transparent",
  className = "",
}: BarcodeProps) {
  if (!value) {
    return (
      <div className={"bpm-barcode " + className} style={{ height, background: "var(--bpm-bg-secondary)", borderRadius: "var(--bpm-radius)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--bpm-text-secondary)", fontSize: "var(--bpm-font-size-sm)" }}>
        Pas de valeur
      </div>
    );
  }
  const barWidth = width;
  const bars = value.split("").slice(0, 16).flatMap((_, i) => {
    const code = value.charCodeAt(i % value.length) % 4;
    return [1, 1 + code, 1];
  });
  const totalWidth = bars.reduce((a, b) => a + b, 0) * barWidth;

  return (
    <div className={"bpm-barcode " + className} style={{ background, padding: 8, borderRadius: "var(--bpm-radius)", display: "inline-block" }}>
      <svg width={totalWidth} height={height} xmlns="http://www.w3.org/2000/svg">
        {bars.map((w, i) => {
          const x = bars.slice(0, i).reduce((a, b) => a + b, 0) * barWidth;
          return <rect key={i} x={x} y={0} width={w * barWidth} height={height} fill={i % 2 === 0 ? lineColor : "transparent"} />;
        })}
      </svg>
      <div style={{ fontSize: "var(--bpm-font-size-sm)", textAlign: "center", marginTop: 4, color: "var(--bpm-text-secondary)" }}>{value}</div>
    </div>
  );
}
