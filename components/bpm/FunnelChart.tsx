"use client";

import React, { useMemo } from "react";

export interface FunnelStage {
  label: string;
  value: number;
}

export interface FunnelChartProps {
  stages: FunnelStage[];
  showPercentage?: boolean;
  horizontal?: boolean;
  className?: string;
}

/**
 * Entonnoir en trapèzes empilés (clip-path polygon), pourcentages optionnels.
 */
export function FunnelChart({
  stages,
  showPercentage = false,
  horizontal = false,
  className = "",
}: FunnelChartProps) {
  const { total, widthsPct } = useMemo(() => {
    const t = stages.reduce((s, x) => s + x.value, 0) || 1;
    const maxV = Math.max(...stages.map((s) => s.value), 1);
    const w = stages.map((s) => (s.value / maxV) * 100);
    return { total: t, widthsPct: w };
  }, [stages]);

  if (!stages.length) {
    return (
      <div className={className} style={{ padding: 16, color: "var(--bpm-text-secondary)", fontSize: 13 }}>
        Aucune donnée
      </div>
    );
  }

  if (horizontal) {
    return (
      <div
        className={className}
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          gap: 0,
          minHeight: 120,
          border: "1px solid var(--bpm-border)",
          borderRadius: "var(--bpm-radius)",
          overflow: "hidden",
          background: "var(--bpm-bg-secondary, var(--bpm-surface))",
        }}
      >
        {stages.map((stage, i) => {
          const wTop = widthsPct[i] ?? 0;
          const wBot = widthsPct[i + 1] ?? wTop * 0.85;
          const pct = Math.round((stage.value / total) * 1000) / 10;
          const poly = `0% ${50 - wTop / 2}%, 100% ${50 - wBot / 2}%, 100% ${50 + wBot / 2}%, 0% ${50 + wTop / 2}%`;
          return (
            <div
              key={i}
              style={{
                flex: stage.value,
                position: "relative",
                minWidth: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 4,
                  clipPath: `polygon(${poly})`,
                  background: `color-mix(in srgb, var(--bpm-accent) ${30 + (i * 50) / Math.max(1, stages.length)}%, var(--bpm-surface))`,
                  border: "1px solid var(--bpm-border)",
                }}
              />
              <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: 8, fontSize: 11, color: "var(--bpm-text-primary)" }}>
                <div style={{ fontWeight: 600 }}>{stage.label}</div>
                <div>{stage.value}</div>
                {showPercentage ? <div style={{ color: "var(--bpm-text-secondary)" }}>{pct}%</div> : null}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 0,
        width: "100%",
        maxWidth: 360,
        border: "1px solid var(--bpm-border)",
        borderRadius: "var(--bpm-radius)",
        overflow: "hidden",
        background: "var(--bpm-bg-secondary, var(--bpm-surface))",
      }}
    >
      {stages.map((stage, i) => {
        const wTop = widthsPct[i] ?? 0;
        const wBot = widthsPct[i + 1] ?? wTop * 0.75;
        const pct = Math.round((stage.value / total) * 1000) / 10;
        const poly = `${50 - wTop / 2}% 0%, ${50 + wTop / 2}% 0%, ${50 + wBot / 2}% 100%, ${50 - wBot / 2}% 100%`;
        return (
          <div
            key={i}
            style={{
              position: "relative",
              height: 56,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 2,
                clipPath: `polygon(${poly})`,
                background: `color-mix(in srgb, var(--bpm-accent) ${28 + (i * 55) / Math.max(1, stages.length)}%, var(--bpm-surface))`,
                borderBottom: i < stages.length - 1 ? "1px solid var(--bpm-border)" : undefined,
              }}
            />
            <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", fontSize: 12 }}>
              <span style={{ fontWeight: 600, color: "var(--bpm-text-primary)" }}>{stage.label}</span>
              <span style={{ color: "var(--bpm-text-secondary)" }}>
                {stage.value}
                {showPercentage ? ` (${pct}%)` : ""}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
