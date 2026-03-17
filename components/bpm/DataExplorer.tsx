"use client";

import React, { useMemo, useState } from "react";
import { Input } from "./Input";
import { Button } from "./Button";
import { Pagination } from "./Pagination";

export interface ColumnDef {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "badge";
  sortable?: boolean;
  filterable?: boolean;
}

export interface DataExplorerProps {
  data: Record<string, unknown>[];
  columns?: ColumnDef[];
  title?: string;
  searchable?: boolean;
  exportable?: boolean;
  pageSize?: number;
  className?: string;
}

function inferColumns(data: Record<string, unknown>[]): ColumnDef[] {
  if (data.length === 0) return [];
  const keys = Object.keys(data[0]);
  return keys.map((key) => {
    const val = data[0][key];
    let type: ColumnDef["type"] = "text";
    if (typeof val === "number") type = "number";
    else if (val instanceof Date || (typeof val === "string" && /^\d{4}-\d{2}-\d{2}/.test(val)))
      type = "date";
    return { key, label: key, type, sortable: true, filterable: true };
  });
}

function formatCell(value: unknown, type: ColumnDef["type"]): React.ReactNode {
  if (value == null) return "—";
  if (type === "date") {
    const d = value instanceof Date ? value : new Date(String(value));
    return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString("fr-FR");
  }
  if (type === "number") return Number(value).toLocaleString("fr-FR");
  if (type === "badge")
    return (
      <span
        style={{
          display: "inline-block",
          padding: "2px 8px",
          borderRadius: "var(--bpm-radius-sm)",
          background: "var(--bpm-bg-tertiary)",
          fontSize: "var(--bpm-font-size-sm)",
        }}
      >
        {String(value)}
      </span>
    );
  return String(value);
}

export function DataExplorer({
  data,
  columns: columnsProp,
  title,
  searchable = true,
  exportable = false,
  pageSize = 20,
  className = "",
}: DataExplorerProps) {
  const columns = useMemo(
    () => columnsProp ?? inferColumns(data),
    [columnsProp, data]
  );
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = data;
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter((row) =>
        Object.values(row).some((v) => String(v ?? "").toLowerCase().includes(s))
      );
    }
    if (sortKey) {
      list = [...list].sort((a, b) => {
        const va = a[sortKey];
        const vb = b[sortKey];
        const cmp =
          typeof va === "number" && typeof vb === "number"
            ? va - vb
            : String(va ?? "").localeCompare(String(vb ?? ""));
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return list;
  }, [data, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const handleExportCsv = () => {
    const headers = columns.map((c) => c.label).join(";");
    const rows = paginated.map((row) =>
      columns.map((c) => {
        const v = row[c.key];
        const s = v == null ? "" : String(v);
        return s.includes(";") ? `"${s.replace(/"/g, '""')}"` : s;
      }).join(";")
    );
    const blob = new Blob(["\uFEFF" + [headers, ...rows].join("\r\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={className ? `bpm-data-explorer ${className}`.trim() : "bpm-data-explorer"}
      style={{
        border: "1px solid var(--bpm-border)",
        borderRadius: "var(--bpm-radius-md)",
        overflow: "hidden",
        background: "var(--bpm-bg-primary)",
      }}
    >
      {(title || searchable || exportable) && (
        <div
          className="bpm-data-explorer-toolbar"
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 12,
            padding: "12px 12px",
            borderBottom: "1px solid var(--bpm-border)",
            background: "var(--bpm-bg-secondary)",
          }}
        >
          {title && (
            <h3 style={{ margin: 0, fontSize: "var(--bpm-font-size-lg)", fontWeight: 600, color: "var(--bpm-text)" }}>
              {title}
            </h3>
          )}
          {searchable && (
            <Input
              value={search}
              onChange={setSearch}
              placeholder="Rechercher..."
              type="search"
            />
          )}
          {exportable && (
            <Button type="button" variant="outline" size="small" onClick={handleExportCsv}>
              Exporter CSV
            </Button>
          )}
        </div>
      )}
      <div
        className="bpm-data-explorer-table-wrap"
        style={{
          overflowX: "auto",
          paddingLeft: 12,
          paddingRight: 12,
          paddingBottom: 0,
          paddingTop: 0,
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "var(--bpm-font-size-base)",
            color: "var(--bpm-text-primary)",
          }}
        >
          <thead>
            <tr style={{ background: "var(--bpm-bg-secondary)" }}>
              {columns.map((col, colIndex) => (
                <th
                  key={col.key}
                  style={{
                    padding: "10px 12px",
                    paddingLeft: colIndex === 0 ? 0 : 12,
                    textAlign: "left",
                    borderBottom: "1px solid var(--bpm-border)",
                    fontWeight: 600,
                  }}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSortKey(col.key);
                        setSortDir((d) => (sortKey === col.key && d === "asc" ? "desc" : "asc"));
                      }}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "var(--bpm-text-primary)",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      {col.label} {sortKey === col.key ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((row, i) => (
              <tr
                key={i}
                style={{
                  borderBottom: "1px solid var(--bpm-border)",
                }}
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={col.key}
                    style={{
                      padding: "10px 12px",
                      paddingLeft: colIndex === 0 ? 0 : 12,
                    }}
                  >
                    {formatCell(row[col.key], col.type)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div style={{ padding: 12, borderTop: "1px solid var(--bpm-border)" }}>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            pageSize={pageSize}
            totalItems={filtered.length}
          />
        </div>
      )}
    </div>
  );
}
