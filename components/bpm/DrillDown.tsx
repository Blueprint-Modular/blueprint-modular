"use client";

import React, { useMemo } from "react";

export type DrillDownLevel<T extends Record<string, unknown>> = {
  key: string;
  label: string;
  columns: { key: keyof T; label: string }[];
  items: T[];
};

export type DrillDownProps<T extends Record<string, unknown>> = {
  levels: DrillDownLevel<T>[];
  currentLevel: number;
  onDrill: (item: T, nextLevel: number) => void;
  onBack: () => void;
  breadcrumbs?: boolean;
};

export function DrillDown<T extends Record<string, unknown>>({
  levels,
  currentLevel,
  onDrill,
  onBack,
  breadcrumbs = true,
}: DrillDownProps<T>) {
  const safeLevel = Math.min(Math.max(0, currentLevel), Math.max(0, levels.length - 1));
  const level = levels[safeLevel];

  const trail = useMemo(() => levels.slice(0, safeLevel + 1), [levels, safeLevel]);

  const canBack = safeLevel > 0;
  const canDrill = safeLevel < levels.length - 1;

  if (!level) {
    return (
      <div style={{ fontSize: 13, color: "var(--bpm-text-secondary)", padding: 16 }}>No levels configured.</div>
    );
  }

  return (
    <div
      style={{
        border: "1px solid var(--bpm-border)",
        borderRadius: "var(--bpm-radius)",
        background: "var(--bpm-surface)",
        color: "var(--bpm-text-primary)",
        overflow: "hidden",
      }}
    >
      <style>
        {`
          @keyframes bpm-drilldown-slide {
            from {
              opacity: 0;
              transform: translateX(14px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          .bpm-drilldown-panel {
            animation: bpm-drilldown-slide 0.28s ease-out;
          }
        `}
      </style>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 8,
          padding: "10px 12px",
          borderBottom: "1px solid var(--bpm-border)",
          background: "var(--bpm-bg-secondary, var(--bpm-surface))",
        }}
      >
        <button
          type="button"
          disabled={!canBack}
          onClick={onBack}
          style={{
            padding: "6px 12px",
            fontSize: 12,
            borderRadius: "var(--bpm-radius-sm)",
            border: "1px solid var(--bpm-border)",
            background: canBack ? "var(--bpm-surface)" : "color-mix(in srgb, var(--bpm-border) 20%, var(--bpm-surface))",
            color: "var(--bpm-text-primary)",
            cursor: canBack ? "pointer" : "not-allowed",
            opacity: canBack ? 1 : 0.65,
          }}
        >
          Back
        </button>
        {breadcrumbs && (
          <nav style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, fontSize: 12 }}>
            {trail.map((l, i) => (
              <React.Fragment key={l.key}>
                {i > 0 && (
                  <span style={{ color: "var(--bpm-text-secondary)" }} aria-hidden>
                    /
                  </span>
                )}
                <span
                  style={{
                    fontWeight: i === safeLevel ? 600 : 400,
                    color: i === safeLevel ? "var(--bpm-text-primary)" : "var(--bpm-text-secondary)",
                  }}
                >
                  {l.label}
                </span>
              </React.Fragment>
            ))}
          </nav>
        )}
      </div>

      <div className="bpm-drilldown-panel" key={level.key}>
        <div style={{ padding: "8px 12px", fontSize: 12, color: "var(--bpm-text-secondary)" }}>
          {level.items.length} {level.items.length === 1 ? "row" : "rows"}
        </div>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13,
            }}
          >
            <thead>
              <tr style={{ background: "var(--bpm-bg-secondary, var(--bpm-surface))" }}>
                {level.columns.map((c) => (
                  <th
                    key={String(c.key)}
                    style={{
                      textAlign: "left",
                      padding: "10px 12px",
                      borderBottom: "1px solid var(--bpm-border)",
                      fontWeight: 600,
                      color: "var(--bpm-text-secondary)",
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {level.items.map((item, rowIdx) => (
                <tr
                  key={rowIdx}
                  onClick={() => {
                    if (canDrill) onDrill(item, safeLevel + 1);
                  }}
                  onKeyDown={(e) => {
                    if (canDrill && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      onDrill(item, safeLevel + 1);
                    }
                  }}
                  tabIndex={canDrill ? 0 : undefined}
                  role={canDrill ? "button" : undefined}
                  style={{
                    borderBottom: "1px solid var(--bpm-border)",
                    cursor: canDrill ? "pointer" : "default",
                  }}
                >
                  {level.columns.map((c) => (
                    <td key={String(c.key)} style={{ padding: "10px 12px", verticalAlign: "middle" }}>
                      {String(item[c.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
