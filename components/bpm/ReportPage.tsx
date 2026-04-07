"use client";

import React from "react";
import { LineChart } from "./LineChart";

export type ReportSection =
  | { type: "heading"; text: string; level?: 1 | 2 | 3 }
  | { type: "text"; content: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "chart"; title?: string; data: { timestamp: number; value: number }[] }
  | { type: "kpi"; label: string; value: string; hint?: string }
  | { type: "divider" };

export interface ReportPageProps {
  title: string;
  subtitle?: string;
  date?: string;
  logo?: React.ReactNode;
  sections: ReportSection[];
  exportable?: boolean;
  className?: string;
}

/**
 * Page de rapport structurée par sections ; impression via window.print dans un gestionnaire de clic.
 */
export function ReportPage({
  title,
  subtitle,
  date,
  logo,
  sections,
  exportable = true,
  className = "",
}: ReportPageProps) {
  const headingSize = (level: 1 | 2 | 3 | undefined) =>
    level === 1 ? 22 : level === 3 ? 16 : 18;

  return (
    <article
      className={`bpm-report-page ${className}`.trim()}
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: 24,
        background: "var(--bpm-surface)",
        color: "var(--bpm-text-primary)",
        border: "1px solid var(--bpm-border)",
        borderRadius: "var(--bpm-radius)",
      }}
    >
      <header style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>{title}</h1>
          {subtitle ? <p style={{ margin: "8px 0 0", color: "var(--bpm-text-secondary)", fontSize: 15 }}>{subtitle}</p> : null}
          {date ? <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--bpm-text-secondary)" }}>{date}</p> : null}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
          {logo}
          {exportable ? (
            <button
              type="button"
              onClick={() => {
                window.print();
              }}
              style={{
                padding: "8px 14px",
                borderRadius: "var(--bpm-radius-sm)",
                border: "1px solid var(--bpm-border)",
                background: "var(--bpm-accent)",
                color: "var(--bpm-surface)",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Imprimer / PDF
            </button>
          ) : null}
        </div>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {sections.map((s, i) => {
          if (s.type === "heading") {
            const lv = s.level ?? 2;
            return (
              <div
                key={i}
                style={{
                  fontSize: headingSize(lv),
                  fontWeight: 700,
                  borderBottom: lv <= 2 ? "1px solid var(--bpm-border)" : undefined,
                  paddingBottom: lv <= 2 ? 6 : 0,
                }}
              >
                {s.text}
              </div>
            );
          }
          if (s.type === "text") {
            return (
              <p key={i} style={{ margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.55, fontSize: 14 }}>
                {s.content}
              </p>
            );
          }
          if (s.type === "divider") {
            return <hr key={i} style={{ border: "none", borderTop: "1px solid var(--bpm-border)", margin: "8px 0" }} />;
          }
          if (s.type === "kpi") {
            return (
              <div
                key={i}
                style={{
                  display: "inline-flex",
                  flexDirection: "column",
                  padding: "12px 16px",
                  borderRadius: "var(--bpm-radius-sm)",
                  border: "1px solid var(--bpm-border)",
                  background: "var(--bpm-bg-secondary, var(--bpm-surface))",
                  minWidth: 160,
                }}
              >
                <span style={{ fontSize: 12, color: "var(--bpm-text-secondary)" }}>{s.label}</span>
                <span style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{s.value}</span>
                {s.hint ? <span style={{ fontSize: 11, color: "var(--bpm-text-secondary)", marginTop: 4 }}>{s.hint}</span> : null}
              </div>
            );
          }
          if (s.type === "table") {
            return (
              <div key={i} style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr>
                      {s.headers.map((h, j) => (
                        <th
                          key={j}
                          style={{
                            textAlign: "left",
                            padding: "8px 10px",
                            borderBottom: "2px solid var(--bpm-border)",
                            color: "var(--bpm-text-secondary)",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {s.rows.map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => (
                          <td
                            key={ci}
                            style={{
                              padding: "8px 10px",
                              borderBottom: "1px solid var(--bpm-border)",
                            }}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
          if (s.type === "chart") {
            const chartData = s.data.map((d, idx) => ({ x: idx, y: d.value }));
            return (
              <div key={i}>
                {s.title ? <div style={{ fontWeight: 600, marginBottom: 8 }}>{s.title}</div> : null}
                <LineChart data={chartData} width={560} height={200} />
              </div>
            );
          }
          return null;
        })}
      </div>
    </article>
  );
}
