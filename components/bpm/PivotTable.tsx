"use client";

import React, { useMemo, useState } from "react";

export type PivotAgg = "sum" | "avg" | "count" | "min" | "max";

export interface PivotTableProps {
  data: Record<string, unknown>[];
  rowKey: string;
  colKey: string;
  valueKey: string;
  agg?: PivotAgg;
  className?: string;
}

function num(v: unknown): number | null {
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) return Number(v);
  return null;
}

function aggregate(values: number[], agg: PivotAgg): number {
  if (values.length === 0) return 0;
  switch (agg) {
    case "count":
      return values.length;
    case "sum":
      return values.reduce((a, b) => a + b, 0);
    case "avg":
      return values.reduce((a, b) => a + b, 0) / values.length;
    case "min":
      return Math.min(...values);
    case "max":
      return Math.max(...values);
    default:
      return 0;
  }
}

export function PivotTable({
  data,
  rowKey,
  colKey,
  valueKey,
  agg = "sum",
  className = "",
}: PivotTableProps) {
  const [sortRowDim, setSortRowDim] = useState<"row" | "none">("none");
  const [sortColDim, setSortColDim] = useState<"col" | "none">("none");

  const { rows, cols, matrix, rowTotals, colTotals, grand } = useMemo(() => {
    const rowSet = new Set<string>();
    const colSet = new Set<string>();
    const buckets = new Map<string, Map<string, number[]>>();

    for (const row of data) {
      const rk = String(row[rowKey] ?? "");
      const ck = String(row[colKey] ?? "");
      const n = num(row[valueKey]);
      rowSet.add(rk);
      colSet.add(ck);
      if (!buckets.has(rk)) buckets.set(rk, new Map());
      const m = buckets.get(rk)!;
      if (!m.has(ck)) m.set(ck, []);
      if (n != null) m.get(ck)!.push(n);
      else if (agg === "count") m.get(ck)!.push(0);
    }

    let rowArr = Array.from(rowSet);
    let colArr = Array.from(colSet);

    const mat = new Map<string, Map<string, number>>();
    for (const r of rowArr) {
      mat.set(r, new Map());
      for (const c of colArr) {
        const vals = buckets.get(r)?.get(c) ?? [];
        mat.get(r)!.set(c, aggregate(vals, agg));
      }
    }

    const rowTotals = new Map<string, number>();
    for (const r of rowArr) {
      const all: number[] = [];
      for (const c of colArr) {
        all.push(...(buckets.get(r)?.get(c) ?? []));
      }
      rowTotals.set(r, aggregate(all, agg));
    }

    const colTotals = new Map<string, number>();
    for (const c of colArr) {
      const all: number[] = [];
      for (const r of rowArr) {
        all.push(...(buckets.get(r)?.get(c) ?? []));
      }
      colTotals.set(c, aggregate(all, agg));
    }

    const allGrand: number[] = [];
    for (const r of rowArr) {
      for (const c of colArr) {
        allGrand.push(...(buckets.get(r)?.get(c) ?? []));
      }
    }
    const grand = aggregate(allGrand, agg);

    if (sortRowDim === "row") {
      rowArr = [...rowArr].sort((a, b) => (rowTotals.get(b) ?? 0) - (rowTotals.get(a) ?? 0));
    }
    if (sortColDim === "col") {
      colArr = [...colArr].sort((a, b) => (colTotals.get(b) ?? 0) - (colTotals.get(a) ?? 0));
    }

    return {
      rows: rowArr,
      cols: colArr,
      matrix: mat,
      rowTotals,
      colTotals,
      grand,
    };
  }, [data, rowKey, colKey, valueKey, agg, sortRowDim, sortColDim]);

  const maxCell = useMemo(() => {
    let m = 0;
    for (const r of rows) {
      for (const c of cols) {
        const v = Math.abs(matrix.get(r)?.get(c) ?? 0);
        if (v > m) m = v;
      }
    }
    return m || 1;
  }, [rows, cols, matrix]);

  const heat = (v: number) => {
    const t = maxCell > 0 ? Math.min(1, Math.abs(v) / maxCell) : 0;
    return `color-mix(in srgb, var(--bpm-accent-soft) ${Math.round(t * 100)}%, transparent)`;
  };

  const thStyle: React.CSSProperties = {
    padding: "8px 10px",
    borderBottom: "2px solid var(--bpm-border-strong)",
    fontSize: 12,
    textAlign: "left",
    color: "var(--bpm-text-secondary)",
    background: "var(--bpm-bg-tertiary)",
    cursor: "pointer",
    userSelect: "none",
  };

  return (
    <div className={className} style={{ overflow: "auto" }}>
      <table
        style={{
          borderCollapse: "collapse",
          width: "100%",
          fontSize: "var(--bpm-font-size-base)",
          color: "var(--bpm-text-primary)",
        }}
      >
        <thead>
          <tr>
            <th style={thStyle} onClick={() => setSortRowDim((s) => (s === "row" ? "none" : "row"))}>
              {rowKey}
              {sortRowDim === "row" ? " ▼" : ""}
            </th>
            {cols.map((c) => (
              <th
                key={c}
                style={thStyle}
                onClick={() => setSortColDim((s) => (s === "col" ? "none" : "col"))}
              >
                {c}
                {sortColDim === "col" ? " ▼" : ""}
              </th>
            ))}
            <th style={{ ...thStyle, cursor: "default" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r}>
              <td
                style={{
                  padding: "8px 10px",
                  borderBottom: "1px solid var(--bpm-border)",
                  fontWeight: 600,
                  background: "var(--bpm-surface-raised)",
                }}
              >
                {r}
              </td>
              {cols.map((c) => {
                const v = matrix.get(r)?.get(c) ?? 0;
                return (
                  <td
                    key={c}
                    style={{
                      padding: "8px 10px",
                      borderBottom: "1px solid var(--bpm-border)",
                      background: heat(v),
                      textAlign: "right",
                    }}
                  >
                    {agg === "avg" ? v.toFixed(2) : String(v)}
                  </td>
                );
              })}
              <td
                style={{
                  padding: "8px 10px",
                  borderBottom: "1px solid var(--bpm-border)",
                  fontWeight: 600,
                  textAlign: "right",
                  background: "var(--bpm-accent-light)",
                }}
              >
                {agg === "avg" ? rowTotals.get(r)!.toFixed(2) : rowTotals.get(r)}
              </td>
            </tr>
          ))}
          <tr>
            <td
              style={{
                padding: "8px 10px",
                fontWeight: 700,
                background: "var(--bpm-bg-tertiary)",
              }}
            >
              Total
            </td>
            {cols.map((c) => (
              <td
                key={c}
                style={{
                  padding: "8px 10px",
                  fontWeight: 700,
                  textAlign: "right",
                  background: "var(--bpm-bg-tertiary)",
                }}
              >
                {agg === "avg" ? colTotals.get(c)!.toFixed(2) : colTotals.get(c)}
              </td>
            ))}
            <td
              style={{
                padding: "8px 10px",
                fontWeight: 700,
                textAlign: "right",
                background: "var(--bpm-accent)",
                color: "var(--bpm-accent-contrast)",
              }}
            >
              {agg === "avg" ? grand.toFixed(2) : grand}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
