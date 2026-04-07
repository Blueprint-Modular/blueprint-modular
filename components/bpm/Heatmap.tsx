"use client";

import React, { useCallback, useMemo, useState } from "react";

export interface HeatmapProps {
  data: number[][];
  xLabels: string[];
  yLabels: string[];
  colorScale: { min: string; max: string };
  valueMin?: number;
  valueMax?: number;
  showValues?: boolean;
  onCellClick?: (row: number, col: number, value: number) => void;
  className?: string;
}

function clamp01(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t;
}

/**
 * Grille de valeurs avec dégradé de couleur, infobulle et clic optionnel.
 */
export function Heatmap({
  data,
  xLabels,
  yLabels,
  colorScale,
  valueMin: vminIn,
  valueMax: vmaxIn,
  showValues = false,
  onCellClick,
  className = "",
}: HeatmapProps) {
  const { minV, maxV } = useMemo(() => {
    const flat = data.flat();
    const lo = vminIn ?? (flat.length ? Math.min(...flat) : 0);
    const hi = vmaxIn ?? (flat.length ? Math.max(...flat) : 1);
    return { minV: lo, maxV: hi === lo ? lo + 1 : hi };
  }, [data, vminIn, vmaxIn]);

  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null);

  const cellColor = useCallback(
    (v: number) => {
      const t = clamp01((v - minV) / (maxV - minV));
      const p = Math.round(t * 100);
      return `color-mix(in srgb, ${colorScale.max} ${p}%, ${colorScale.min})`;
    },
    [colorScale.max, colorScale.min, minV, maxV]
  );

  const rows = data.length;
  const cols = rows > 0 ? Math.max(...data.map((r) => r.length)) : 0;

  return (
    <div className={className} style={{ position: "relative", display: "inline-block" }}>
      <div style={{ overflow: "auto", maxWidth: "100%" }}>
        <table style={{ borderCollapse: "separate", borderSpacing: 2, fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ width: 8 }} />
              {Array.from({ length: cols }, (_, j) => (
                <th
                  key={j}
                  style={{
                    padding: "4px 6px",
                    color: "var(--bpm-text-secondary)",
                    fontWeight: 500,
                    textAlign: "center",
                  }}
                >
                  {xLabels[j] ?? ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                <th
                  style={{
                    padding: "4px 8px 4px 0",
                    textAlign: "right",
                    color: "var(--bpm-text-secondary)",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                  }}
                >
                  {yLabels[i] ?? ""}
                </th>
                {Array.from({ length: cols }, (_, j) => {
                  const v = row[j];
                  const num = v ?? NaN;
                  const bg = Number.isFinite(num) ? cellColor(num) : "var(--bpm-bg-secondary)";
                  return (
                    <td key={j}>
                      <button
                        type="button"
                        disabled={!Number.isFinite(num) || !onCellClick}
                        onClick={() => Number.isFinite(num) && onCellClick?.(i, j, num)}
                        onMouseEnter={(e) => {
                          if (!Number.isFinite(num)) return;
                          const r = e.currentTarget.getBoundingClientRect();
                          setTip({
                            x: r.left + r.width / 2,
                            y: r.top,
                            text: `${xLabels[j] ?? j} × ${yLabels[i] ?? i}: ${num}`,
                          });
                        }}
                        onMouseLeave={() => setTip(null)}
                        style={{
                          width: 44,
                          height: 32,
                          border: "1px solid var(--bpm-border)",
                          borderRadius: "var(--bpm-radius-sm)",
                          background: bg,
                          color: "var(--bpm-text-primary)",
                          cursor: onCellClick && Number.isFinite(num) ? "pointer" : "default",
                          fontSize: 10,
                          padding: 0,
                          margin: 0,
                        }}
                      >
                        {showValues && Number.isFinite(num) ? String(num) : ""}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {tip ? (
        <div
          role="tooltip"
          style={{
            position: "fixed",
            left: tip.x,
            top: tip.y - 8,
            transform: "translate(-50%, -100%)",
            pointerEvents: "none",
            zIndex: 50,
            padding: "6px 10px",
            borderRadius: "var(--bpm-radius-sm)",
            background: "var(--bpm-text-primary)",
            color: "var(--bpm-surface)",
            fontSize: 11,
            boxShadow: "var(--bpm-shadow-sm)",
            whiteSpace: "nowrap",
          }}
        >
          {tip.text}
        </div>
      ) : null}
    </div>
  );
}
