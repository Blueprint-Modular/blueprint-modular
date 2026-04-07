"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";

export interface ExportColumn<T> {
  key: keyof T & string;
  header: string;
}

export interface ExportButtonProps<T extends Record<string, unknown>> {
  data: T[] | (() => T[]);
  filename: string;
  formats?: ("csv" | "json")[];
  columns?: ExportColumn<T>[];
  csvDelimiter?: ";" | ",";
  csvBOM?: boolean;
  className?: string;
}

function escapeCsvCell(v: string, delimiter: string): string {
  const needs = v.includes(delimiter) || v.includes('"') || v.includes("\n") || v.includes("\r");
  let s = v.replace(/"/g, '""');
  return needs ? `"${s}"` : s;
}

function rowsToCsv<T extends Record<string, unknown>>(
  rows: T[],
  cols: ExportColumn<T>[],
  delimiter: string,
  bom: boolean
): string {
  const headers = cols.map((c) => escapeCsvCell(c.header, delimiter));
  const lines = [headers.join(delimiter)];
  for (const row of rows) {
    lines.push(
      cols
        .map((c) => {
          const raw = row[c.key];
          const s = raw == null ? "" : typeof raw === "object" ? JSON.stringify(raw) : String(raw);
          return escapeCsvCell(s, delimiter);
        })
        .join(delimiter)
    );
  }
  const body = lines.join("\r\n");
  return bom ? `\ufeff${body}` : body;
}

/**
 * Export CSV / JSON avec menu, BOM et séparateur configurable pour tableurs.
 */
export function ExportButton<T extends Record<string, unknown>>({
  data,
  filename,
  formats = ["csv", "json"],
  columns,
  csvDelimiter = ";",
  csvBOM = true,
  className = "",
}: ExportButtonProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const resolved = useCallback((): T[] => (typeof data === "function" ? data() : data), [data]);

  const inferredColumns = useMemo((): ExportColumn<T>[] => {
    const rows = resolved();
    if (columns?.length) return columns;
    if (!rows.length) return [];
    return Object.keys(rows[0]).map((k) => ({ key: k as keyof T & string, header: k }));
  }, [columns, resolved]);

  const download = useCallback(
    (kind: "csv" | "json") => {
      const rows = resolved();
      let blob: Blob;
      let ext: string;
      if (kind === "json") {
        ext = "json";
        blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json;charset=utf-8" });
      } else {
        ext = "csv";
        const text = rowsToCsv(rows, inferredColumns, csvDelimiter, csvBOM);
        blob = new Blob([text], { type: "text/csv;charset=utf-8" });
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename.replace(/\.[^.]+$/, "")}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      setOpen(false);
    },
    [csvBOM, csvDelimiter, filename, inferredColumns, resolved]
  );

  return (
    <div ref={containerRef} className={className} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          padding: "8px 12px",
          borderRadius: "var(--bpm-radius-sm)",
          border: "1px solid var(--bpm-border)",
          background: "var(--bpm-surface)",
          color: "var(--bpm-text-primary)",
          cursor: "pointer",
          fontSize: 13,
        }}
      >
        Exporter ▾
      </button>
      {open ? (
        <ul
          role="menu"
          style={{
            position: "absolute",
            right: 0,
            top: "100%",
            margin: "4px 0 0",
            padding: 4,
            listStyle: "none",
            minWidth: 140,
            zIndex: 40,
            borderRadius: "var(--bpm-radius-sm)",
            border: "1px solid var(--bpm-border)",
            background: "var(--bpm-surface)",
            boxShadow: "var(--bpm-shadow-sm)",
          }}
        >
          {formats.includes("csv") ? (
            <li role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => download("csv")}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "6px 10px",
                  border: "none",
                  background: "transparent",
                  color: "var(--bpm-text-primary)",
                  cursor: "pointer",
                  fontSize: 13,
                  borderRadius: "var(--bpm-radius-sm)",
                }}
              >
                CSV ({csvDelimiter === ";" ? "point-virgule" : "virgule"}
                {csvBOM ? ", BOM" : ""})
              </button>
            </li>
          ) : null}
          {formats.includes("json") ? (
            <li role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => download("json")}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "6px 10px",
                  border: "none",
                  background: "transparent",
                  color: "var(--bpm-text-primary)",
                  cursor: "pointer",
                  fontSize: 13,
                  borderRadius: "var(--bpm-radius-sm)",
                }}
              >
                JSON
              </button>
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
