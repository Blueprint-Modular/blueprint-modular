"use client";

import React, { useMemo } from "react";

export interface AreaChartDatum {
  x: number | string;
  y: number;
}

export interface AreaChartProps {
  data: AreaChartDatum[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

/**
 * @component bpm.areaChart
 * @description Graphique en aire SVG simple pour visualiser une série temporelle ou une distribution.
 * @example
 * bpm.areaChart({ data: [{ x: 1, y: 10 }, { x: 2, y: 25 }], color: "var(--bpm-success)" })
 *
 * @param {object} props
 * @param {AreaChartDatum[]} props.data - Données du graphique [{x, y}]. Obligatoire.
 * @param {number} [props.width=400] - Largeur du graphique. Optionnel.
 * @param {number} [props.height=200] - Hauteur du graphique. Optionnel.
 * @param {string} [props.color="var(--bpm-accent)"] - Couleur de l'aire. Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 *
 * @associated bpm.lineChart, bpm.barChart, bpm.plotlyChart
 */
export function AreaChart(p: AreaChartProps) {
  const { data, width = 400, height = 200, color = "var(--bpm-accent)", className = "" } = p;
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
    const pts = data.map((_, i) => xScale(xs[i]) + "," + yScale(ys[i]));
    const line = "M" + pts.join("L");
    const lastX = xScale(xs[xs.length - 1]);
    const firstX = xScale(xs[0]);
    const bottom = height - pad;
    return line + "L" + lastX + "," + bottom + "L" + firstX + "," + bottom + "Z";
  }, [data, width, height]);
  if (!data.length) return <div className={"bpm-area-chart w-full max-w-full " + className} style={{ aspectRatio: `${width}/${height}`, maxWidth: width, background: "var(--bpm-bg-secondary)", borderRadius: "var(--bpm-radius)" }} />;
  return (
    <div className="w-full max-w-full overflow-hidden" style={{ aspectRatio: `${width}/${height}` }}>
      <svg viewBox={`0 0 ${width} ${height}`} className={"bpm-area-chart " + className} style={{ width: "100%", height: "auto" }} preserveAspectRatio="xMidYMid meet">
        <path d={path} fill={color} fillOpacity={0.3} stroke={color} strokeWidth={1.5} />
      </svg>
    </div>
  );
}
