"use client";

import React, { useMemo, useState, useEffect } from "react";

export interface ExplorerAnalyticsColumn {
  key: string;
  label: string;
  type: "string" | "number" | "date" | "enum";
  enumValues?: string[];
}

export interface DataExplorerAnalyticsProps {
  mode: "analytics";
  data: Record<string, unknown>[];
  columns: ExplorerAnalyticsColumn[];
  chartConfig?: { type: "bar" | "line" | "pie"; xKey: string; yKey: string };
  onFilter?: (filtered: Record<string, unknown>[]) => void;
  className?: string;
}

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function DataExplorerAnalytics({
  data,
  columns,
  chartConfig,
  onFilter,
  className = "",
}: Omit<DataExplorerAnalyticsProps, "mode">) {
  const [filters, setFilters] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    return data.filter((row) =>
      columns.every((col) => {
        const f = filters[col.key];
        if (!f || f === "") return true;
        const val = row[col.key];
        if (col.type === "enum" || col.type === "string") return String(val ?? "") === f;
        if (col.type === "number") {
          const [a, b] = f.split(":").map((x) => parseFloat(x));
          const n = num(val);
          if (!Number.isNaN(a) && !Number.isNaN(b)) return n >= a && n <= b;
          return String(val) === f;
        }
        if (col.type === "date") return String(val ?? "").slice(0, 10) === f.slice(0, 10);
        return true;
      })
    );
  }, [data, columns, filters]);

  useEffect(() => {
    onFilter?.(filtered);
  }, [filtered, onFilter]);

  const chartPoints = useMemo(() => {
    if (!chartConfig) return null;
    const { xKey, yKey, type } = chartConfig;
    const map = new Map<string, number>();
    for (const row of filtered) {
      const x = String(row[xKey] ?? "");
      map.set(x, (map.get(x) ?? 0) + num(row[yKey]));
    }
    return { entries: [...map.entries()], type };
  }, [chartConfig, filtered]);

  return (
    <div
      className={`bpm-data-explorer-analytics ${className}`.trim()}
      style={{
        border: "1px solid var(--bpm-border)",
        borderRadius: "var(--bpm-radius)",
        background: "var(--bpm-surface)",
        padding: 12,
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        {columns.map((col) => (
          <div key={col.key} style={{ minWidth: 140 }}>
            <label style={{ fontSize: 11, color: "var(--bpm-text-secondary)", display: "block", marginBottom: 4 }}>
              {col.label}
            </label>
            {col.type === "enum" && col.enumValues ? (
              <select
                value={filters[col.key] ?? ""}
                onChange={(e) => setFilters((p) => ({ ...p, [col.key]: e.target.value }))}
                style={{
                  width: "100%",
                  padding: 8,
                  border: "1px solid var(--bpm-border)",
                  borderRadius: "var(--bpm-radius-sm)",
                  background: "var(--bpm-surface)",
                  color: "var(--bpm-text-primary)",
                }}
              >
                <option value="">Tous</option>
                {col.enumValues.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            ) : col.type === "number" ? (
              <input
                type="text"
                placeholder="min:max"
                value={filters[col.key] ?? ""}
                onChange={(e) => setFilters((p) => ({ ...p, [col.key]: e.target.value }))}
                style={{
                  width: "100%",
                  padding: 8,
                  border: "1px solid var(--bpm-border)",
                  borderRadius: "var(--bpm-radius-sm)",
                  background: "var(--bpm-surface)",
                  color: "var(--bpm-text-primary)",
                }}
              />
            ) : col.type === "date" ? (
              <input
                type="date"
                value={filters[col.key] ?? ""}
                onChange={(e) => setFilters((p) => ({ ...p, [col.key]: e.target.value }))}
                style={{
                  width: "100%",
                  padding: 8,
                  border: "1px solid var(--bpm-border)",
                  borderRadius: "var(--bpm-radius-sm)",
                }}
              />
            ) : (
              <input
                type="text"
                value={filters[col.key] ?? ""}
                onChange={(e) => setFilters((p) => ({ ...p, [col.key]: e.target.value }))}
                style={{
                  width: "100%",
                  padding: 8,
                  border: "1px solid var(--bpm-border)",
                  borderRadius: "var(--bpm-radius-sm)",
                  background: "var(--bpm-surface)",
                  color: "var(--bpm-text-primary)",
                }}
              />
            )}
          </div>
        ))}
      </div>
      <p style={{ fontSize: 13, color: "var(--bpm-text-secondary)", margin: "0 0 12px" }}>
        {filtered.length} / {data.length} enregistrements
      </p>
      {chartPoints && chartPoints.entries.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {chartPoints.type === "bar" && (
            <svg width="100%" height={160} viewBox="0 0 400 160" preserveAspectRatio="none" role="img" aria-label="Graphique">
              {chartPoints.entries.map(([label, val], i) => {
                const max = Math.max(...chartPoints.entries.map(([, v]) => v), 1);
                const w = 400 / chartPoints.entries.length - 4;
                const h = (val / max) * 120;
                const x = i * (400 / chartPoints.entries.length) + 2;
                return (
                  <rect
                    key={label}
                    x={x}
                    y={140 - h}
                    width={w}
                    height={h}
                    fill="var(--bpm-accent)"
                    opacity={0.85}
                  />
                );
              })}
            </svg>
          )}
          {chartPoints.type === "line" && (
            <svg width="100%" height={160} viewBox="0 0 400 160" role="img" aria-label="Graphique">
              <polyline
                fill="none"
                stroke="var(--bpm-accent)"
                strokeWidth={2}
                points={chartPoints.entries
                  .map(([_, val], i) => {
                    const max = Math.max(...chartPoints.entries.map(([, v]) => v), 1);
                    const x = (i / Math.max(chartPoints.entries.length - 1, 1)) * 380 + 10;
                    const y = 140 - (val / max) * 120;
                    return `${x},${y}`;
                  })
                  .join(" ")}
              />
            </svg>
          )}
          {chartPoints.type === "pie" && (
            <svg width={160} height={160} viewBox="-1 -1 2 2" role="img" aria-label="Camembert">
              {(() => {
                const total = chartPoints.entries.reduce((s, [, v]) => s + v, 0) || 1;
                let acc = 0;
                return chartPoints.entries.map(([label, val], i) => {
                  const start = acc;
                  acc += val / total;
                  const end = acc;
                  const large = end - start > 0.5 ? 1 : 0;
                  const x1 = Math.cos(2 * Math.PI * start);
                  const y1 = Math.sin(2 * Math.PI * start);
                  const x2 = Math.cos(2 * Math.PI * end);
                  const y2 = Math.sin(2 * Math.PI * end);
                  const d = `M 0 0 L ${x1} ${y1} A 1 1 0 ${large} 1 ${x2} ${y2} Z`;
                  return <path key={label} d={d} fill="var(--bpm-accent)" opacity={0.35 + (i % 5) * 0.12} />;
                });
              })()}
            </svg>
          )}
        </div>
      )}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} style={{ textAlign: "left", padding: 8, borderBottom: "1px solid var(--bpm-border)" }}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 200).map((row, i) => (
              <tr key={i}>
                {columns.map((c) => (
                  <td key={c.key} style={{ padding: 8, borderBottom: "1px solid var(--bpm-border)" }}>
                    {String(row[c.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
