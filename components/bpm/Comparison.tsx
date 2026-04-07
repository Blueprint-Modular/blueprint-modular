"use client";

import React, { useMemo } from "react";

export interface ComparisonProps {
  items: Record<string, unknown>[];
  dimensions: string[];
  labels?: Record<string, string>;
  highlightBest?: boolean;
  className?: string;
}

function toNum(v: unknown): number | null {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) return Number(v);
  return null;
}

export function Comparison({
  items,
  dimensions,
  labels,
  highlightBest = true,
  className = "",
}: ComparisonProps) {
  const best = useMemo(() => {
    const m = new Map<string, number>();
    if (!highlightBest) return m;
    for (const d of dimensions) {
      let max = -Infinity;
      let maxI = -1;
      items.forEach((it, i) => {
        const n = toNum(it[d]);
        if (n != null && n > max) {
          max = n;
          maxI = i;
        }
      });
      if (maxI >= 0) m.set(d, maxI);
    }
    return m;
  }, [items, dimensions, highlightBest]);

  return (
    <div className={className} style={{ overflow: "auto" }}>
      <table
        style={{
          borderCollapse: "collapse",
          width: "100%",
          fontSize: "var(--bpm-font-size-base)",
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                textAlign: "left",
                padding: "10px 12px",
                borderBottom: "2px solid var(--bpm-border-strong)",
                color: "var(--bpm-text-secondary)",
                background: "var(--bpm-bg-tertiary)",
              }}
            >
              #
            </th>
            {dimensions.map((d) => (
              <th
                key={d}
                style={{
                  textAlign: "right",
                  padding: "10px 12px",
                  borderBottom: "2px solid var(--bpm-border-strong)",
                  color: "var(--bpm-text-secondary)",
                  background: "var(--bpm-bg-tertiary)",
                }}
              >
                {labels?.[d] ?? d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((it, rowI) => (
            <tr key={rowI}>
              <td
                style={{
                  padding: "10px 12px",
                  borderBottom: "1px solid var(--bpm-border)",
                  color: "var(--bpm-text-primary)",
                  fontWeight: 600,
                }}
              >
                {rowI + 1}
              </td>
              {dimensions.map((d) => {
                const raw = it[d];
                const n = toNum(raw);
                const isBest = highlightBest && best.get(d) === rowI && n != null;
                return (
                  <td
                    key={d}
                    style={{
                      padding: "10px 12px",
                      borderBottom: "1px solid var(--bpm-border)",
                      textAlign: "right",
                      background: isBest ? "var(--bpm-success-soft)" : "transparent",
                      color: isBest ? "var(--bpm-success-text)" : "var(--bpm-text-primary)",
                      fontWeight: isBest ? 700 : 400,
                    }}
                  >
                    {n != null ? String(raw) : String(raw ?? "—")}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
