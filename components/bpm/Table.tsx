"use client";

import React, { useState, useMemo } from "react";
import type { MetricValueLocale } from "./Metric";

export interface TableColumn {
  key: string;
  label: React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
  /** Décimales pour cette colonne (surcharge valueDecimals du tableau). */
  decimals?: number;
  /** Si true, l'en-tête de colonne ne passe pas à la ligne (whitespace-nowrap). */
  noWrap?: boolean;
}

export interface TableProps {
  columns: TableColumn[];
  data: Record<string, unknown>[];
  striped?: boolean;
  hover?: boolean;
  onRowClick?: (row: Record<string, unknown>) => void;
  defaultSortColumn?: string | null;
  defaultSortDirection?: "asc" | "desc";
  name?: string | null;
  keyColumn?: string | null;
  className?: string;
  /** Locale pour formater les nombres (ex. "fr-FR", "en-US"). */
  valueLocale?: MetricValueLocale;
  /** Nombre de décimales par défaut pour les cellules numériques. */
  valueDecimals?: number;
  /** Séparateur de milliers (true = 1 000,50). */
  valueGrouping?: boolean;
  /** Largeur minimale du tableau en px (déclenche le scroll horizontal dans le wrapper si conteneur plus étroit). Non défini = pas de min-width. */
  minWidth?: number;
}

function getSortValue(val: unknown): string | number {
  if (val == null) return "";
  if (typeof val === "object" && val !== null && "value" in val) {
    return parseFloat((val as { value: unknown }).value as string) ?? "";
  }
  const num = parseFloat(String(val));
  if (!Number.isNaN(num) && isFinite(num)) return num;
  return String(val).toLowerCase();
}

/** Alignement par défaut : nombre → droite, sinon gauche. Surchargeable via col.align. */
function getColumnAlign(
  col: TableColumn,
  data: Record<string, unknown>[]
): "left" | "center" | "right" {
  if (col.align) return col.align;
  const val = data[0]?.[col.key];
  if (val != null && typeof val === "number" && Number.isFinite(val)) return "right";
  if (val != null && typeof val === "string" && /^-?\d+([.,]\d+)?\s*%?$/.test(val.trim())) return "right";
  return "left";
}

function isNumericValue(val: unknown): val is number {
  if (val == null) return false;
  if (typeof val === "number" && Number.isFinite(val)) return true;
  if (typeof val === "string" && /^-?\d+([.,]\d+)?\s*%?$/.test(val.trim())) return true;
  return false;
}

function toNumber(val: unknown): number {
  if (typeof val === "number") return val;
  return parseFloat(String(val).replace(",", ".")) || 0;
}

export function Table({
  columns,
  data = [],
  striped = true,
  hover = true,
  onRowClick,
  defaultSortColumn = null,
  defaultSortDirection = "asc",
  name = null,
  keyColumn = null,
  className = "",
  valueLocale = "fr-FR",
  valueDecimals = 0,
  valueGrouping = true,
  minWidth,
}: TableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(defaultSortColumn);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(defaultSortDirection);

  const locale = valueLocale ?? "fr-FR";
  const formatNumber = (n: number, decimals: number) =>
    n.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: valueGrouping,
    });

  const formatCellValue = (val: unknown, col: TableColumn): React.ReactNode => {
    if (val == null) return "—";
    if (isNumericValue(val)) {
      const num = toNumber(val);
      const decimals = col.decimals ?? valueDecimals;
      return formatNumber(num, decimals);
    }
    return String(val);
  };

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const sortedData = useMemo(() => {
    if (!sortColumn) return data;
    return [...data].sort((a, b) => {
      const aVal = getSortValue(a[sortColumn]);
      const bVal = getSortValue(b[sortColumn]);
      const aNum = typeof aVal === "number" ? aVal : 0;
      const bNum = typeof bVal === "number" ? bVal : 0;
      const bothNum = typeof aVal === "number" && typeof bVal === "number";
      if (bothNum) {
        return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
      }
      const aStr = String(aVal);
      const bStr = String(bVal);
      return sortDirection === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [data, sortColumn, sortDirection]);

  const tableMinWidthStyle = minWidth != null ? { minWidth: `${minWidth}px` } : undefined;

  return (
    <div
      className={`bpm-table-wrapper overflow-auto max-h-[calc(100vh-350px)] rounded-lg border ${className}`}
      style={{
        borderColor: "var(--bpm-border)",
        backgroundColor: "var(--bpm-surface)",
      }}
      data-name={name ?? undefined}
      data-key-column={keyColumn ?? undefined}
    >
      <div className="bpm-table-container w-full" style={tableMinWidthStyle}>
        <table
          className={`bpm-table w-full border-collapse ${
            striped ? "bpm-table-striped" : ""
          } ${hover ? "bpm-table-hover" : ""          } ${onRowClick ? "bpm-table-clickable" : ""}`}
          style={tableMinWidthStyle}
        >
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  className={`bpm-table-th px-4 py-3 text-sm font-medium border ${col.noWrap ? "bpm-table-th--nowrap" : ""} ${
                    sortColumn === col.key
                      ? `bpm-table-sorted bpm-table-sorted-${sortDirection}`
                      : ""
                  } ${col.className ?? ""}`}
                  style={{
                    textAlign: getColumnAlign(col, data),
                    cursor: col.key ? "pointer" : "default",
                    backgroundColor: "var(--bpm-bg-secondary)",
                    borderColor: "var(--bpm-border)",
                    color: "var(--bpm-text-secondary)",
                  }}
                  onClick={() => col.key && handleSort(col.key)}
                >
                  <span className="flex items-center gap-2">
                    {col.label}
                    {sortColumn === col.key && (
                      <span className="bpm-table-sort-indicator" aria-hidden>
                        {sortDirection === "asc" ? " ↑" : " ↓"}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, rowIdx) => (
              <tr
                key={keyColumn && row[keyColumn] != null ? String(row[keyColumn]) : rowIdx}
                onClick={() => onRowClick?.(row)}
                className="bpm-table-tr border"
                style={{
                  cursor: onRowClick ? "pointer" : "default",
                  borderColor: "var(--bpm-border)",
                  color: "var(--bpm-text-primary)",
                }}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={col.key || colIdx}
                    className={`px-4 py-3 text-sm border ${col.className ?? ""}`}
                    style={{
                      textAlign: getColumnAlign(col, data),
                      borderColor: "var(--bpm-border)",
                    }}
                  >
                    {col.render
                      ? col.render(row[col.key], row)
                      : formatCellValue(row[col.key], col)}
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
