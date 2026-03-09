"use client";
import React from "react";

export interface MetricRowProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * @component bpm.metricRow
 * @description Ligne horizontale de KPIs (bpm.metric) pour tableaux de bord et résumés chiffrés.
 * @example
 * bpm.metricRow({ children: <> {bpm.metric({ label: "CA", value: "142 500 €" })} {bpm.metric({ label: "Marge", value: "28%" })} </> })
 * @props
 * - children (ReactNode) — Un ou plusieurs bpm.metric.
 * - className (string, optionnel) — Classes CSS.
 * @usage Dashboard, résumé commande, indicateurs ligne de production.
 * @context PARENT: bpm.panel | bpm.tabs | page directe. ASSOCIATED: bpm.metric, bpm.grid. FORBIDDEN: div custom comme parent.
 */
export function MetricRow({ children, className = "" }: MetricRowProps) {
  return (
    <div
      className={"bpm-metric-row " + className}
      style={{
        display: "flex",
        gap: 16,
        overflowX: "auto",
        paddingBottom: 4,
        scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <style>{`.bpm-metric-row::-webkit-scrollbar { display: none; }`}</style>
      {React.Children.map(children, (child) => (
        <div style={{ minWidth: 180, flex: "0 0 auto" }}>
          {child}
        </div>
      ))}
    </div>
  );
}
