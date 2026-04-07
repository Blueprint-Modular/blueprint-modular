"use client";

import React from "react";

export type SensorStatus = "ok" | "warning" | "error" | "offline";

export interface SensorReading {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  status: SensorStatus;
  detail?: string;
}

export interface SensorGridProps {
  sensors: SensorReading[];
  columns?: number;
  className?: string;
}

const statusStyle: Record<SensorStatus, { border: string; accent: string }> = {
  ok: { border: "var(--bpm-success)", accent: "color-mix(in srgb, var(--bpm-success) 18%, var(--bpm-surface))" },
  warning: { border: "var(--bpm-warning)", accent: "color-mix(in srgb, var(--bpm-warning) 18%, var(--bpm-surface))" },
  error: { border: "var(--bpm-error)", accent: "color-mix(in srgb, var(--bpm-error) 18%, var(--bpm-surface))" },
  offline: { border: "var(--bpm-border)", accent: "var(--bpm-bg-secondary, var(--bpm-surface))" },
};

/**
 * Grille de cartes capteur avec code couleur de statut.
 */
export function SensorGrid({ sensors, columns = 3, className = "" }: SensorGridProps) {
  return (
    <div
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: 12,
      }}
    >
      {sensors.map((s) => {
        const st = statusStyle[s.status];
        return (
          <div
            key={s.id}
            style={{
              borderRadius: "var(--bpm-radius)",
              border: `1px solid var(--bpm-border)`,
              borderLeft: `4px solid ${st.border}`,
              background: st.accent,
              padding: "12px 14px",
              minHeight: 88,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ fontSize: 12, color: "var(--bpm-text-secondary)", fontWeight: 500 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: "var(--bpm-text-primary)" }}>
              {s.value}
              {s.unit ? <span style={{ fontSize: 14, fontWeight: 500, color: "var(--bpm-text-secondary)", marginLeft: 4 }}>{s.unit}</span> : null}
            </div>
            {s.detail ? <div style={{ fontSize: 11, color: "var(--bpm-text-secondary)" }}>{s.detail}</div> : null}
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em", color: st.border }}>{s.status}</div>
          </div>
        );
      })}
    </div>
  );
}
