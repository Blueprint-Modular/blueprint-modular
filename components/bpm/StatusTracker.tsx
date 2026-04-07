"use client";

import React from "react";

export interface StatusTrackerStage {
  label: string;
  status: "completed" | "current" | "pending" | "error";
  date?: string;
  actor?: string;
  description?: string;
}

export interface StatusTrackerProps {
  stages: StatusTrackerStage[];
  direction?: "horizontal" | "vertical";
  compact?: boolean;
  className?: string;
}

function formatStageDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const now = Date.now();
  const diffMs = now - d.getTime();
  const seven = 7 * 24 * 60 * 60 * 1000;
  if (diffMs >= 0 && diffMs < seven) {
    const sec = Math.floor(diffMs / 1000);
    if (sec < 60) return "à l'instant";
    const min = Math.floor(sec / 60);
    if (min < 60) return `il y a ${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `il y a ${h} h`;
    const days = Math.floor(h / 24);
    if (days === 1) return "hier";
    return `il y a ${days} j`;
  }
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * @component bpm.statusTracker
 * @description Historique réel d'un objet : étapes completed / current / pending / error.
 */
export function StatusTracker({
  stages,
  direction = "horizontal",
  compact = false,
  className = "",
}: StatusTrackerProps) {
  const n = stages.length;
  const completed = stages.filter((s) => s.status === "completed").length;
  const progress = n > 0 ? (completed / n) * 100 : 0;

  if (direction === "horizontal" && !compact) {
    return (
      <div className={`bpm-status-tracker ${className}`.trim()} role="region" aria-label="Suivi de statut">
        <div
          style={{
            height: 8,
            borderRadius: 999,
            background: "var(--bpm-border)",
            overflow: "hidden",
            marginBottom: 16,
          }}
        >
          <div style={{ height: "100%", width: `${progress}%`, background: "var(--bpm-accent)", transition: "width 0.25s ease" }} />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {stages.map((s, i) => (
            <div
              key={i}
              style={{
                flex: "1 1 160px",
                padding: 12,
                borderRadius: "var(--bpm-radius)",
                border: "1px solid var(--bpm-border)",
                background: "var(--bpm-surface)",
                boxShadow: "var(--bpm-shadow-sm)",
              }}
            >
              <div style={{ fontWeight: s.status === "current" ? 600 : 500, color: s.status === "error" ? "var(--bpm-error)" : "var(--bpm-text-primary)" }}>
                {s.label}
              </div>
              {s.date && <div style={{ fontSize: 12, color: "var(--bpm-text-secondary)", marginTop: 6 }}>{formatStageDate(s.date)}</div>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (direction === "horizontal" && compact) {
    return (
      <div className={`bpm-status-tracker ${className}`.trim()} role="region" aria-label="Suivi de statut">
        <div
          style={{
            height: 8,
            borderRadius: 999,
            background: "var(--bpm-border)",
            overflow: "hidden",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "var(--bpm-accent)",
              transition: "width 0.25s ease",
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          {stages.map((s, i) => (
            <div key={i} style={{ flex: "1 1 72px", textAlign: "center", minWidth: 64 }}>
              <div
                aria-hidden
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  margin: "0 auto 6px",
                  background:
                    s.status === "completed"
                      ? "var(--bpm-success)"
                      : s.status === "current"
                        ? "var(--bpm-accent)"
                        : s.status === "error"
                          ? "var(--bpm-error)"
                          : "transparent",
                  border:
                    s.status === "pending"
                      ? "2px dashed var(--bpm-border)"
                      : s.status === "current"
                        ? "2px solid var(--bpm-accent)"
                        : "none",
                }}
              />
              <div style={{ fontSize: 11, fontWeight: s.status === "current" ? 600 : 400, color: "var(--bpm-text-primary)" }}>
                {s.label}
              </div>
              {s.date && (
                <div style={{ fontSize: 10, color: "var(--bpm-text-secondary)", marginTop: 2 }}>{formatStageDate(s.date)}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bpm-status-tracker ${className}`.trim()} role="region" aria-label="Suivi de statut">
      <div
        style={{
          height: 8,
          borderRadius: 999,
          background: "var(--bpm-border)",
          overflow: "hidden",
          marginBottom: 20,
          maxWidth: direction === "vertical" ? 280 : undefined,
        }}
      >
        <div style={{ height: "100%", width: `${progress}%`, background: "var(--bpm-accent)", transition: "width 0.25s ease" }} />
      </div>
      <ol
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: direction === "vertical" ? "column" : "row",
          flexWrap: direction === "horizontal" ? "wrap" : undefined,
          gap: direction === "vertical" ? 12 : 16,
        }}
      >
        {stages.map((s, i) => (
          <li
            key={i}
            style={{
              flex: direction === "horizontal" ? "1 1 200px" : undefined,
              padding: 12,
              borderRadius: "var(--bpm-radius)",
              border: "1px solid var(--bpm-border)",
              background: "var(--bpm-surface)",
              boxShadow: "var(--bpm-shadow-sm)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span aria-hidden style={{ fontSize: 14 }}>
                {s.status === "completed" ? "✓" : s.status === "error" ? "✕" : s.status === "current" ? "●" : "○"}
              </span>
              <span style={{ fontWeight: s.status === "current" ? 600 : 500, color: s.status === "error" ? "var(--bpm-error)" : "var(--bpm-text-primary)" }}>
                {s.label}
              </span>
              {s.status === "current" && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: "color-mix(in srgb, var(--bpm-accent) 18%, transparent)",
                    color: "var(--bpm-accent)",
                  }}
                >
                  En cours
                </span>
              )}
            </div>
            {s.date && <div style={{ fontSize: 12, color: "var(--bpm-text-secondary)" }}>{formatStageDate(s.date)}</div>}
            {s.actor && <div style={{ fontSize: 12, color: "var(--bpm-text-secondary)", marginTop: 4 }}>{s.actor}</div>}
            {s.description && <div style={{ fontSize: 13, color: "var(--bpm-text-secondary)", marginTop: 8 }}>{s.description}</div>}
          </li>
        ))}
      </ol>
    </div>
  );
}
