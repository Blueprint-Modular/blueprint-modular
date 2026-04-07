"use client";

import React, { useMemo } from "react";

export type AlarmSeverity = "critical" | "high" | "medium" | "low" | "info";

export interface Alarm {
  id: string;
  title: string;
  message?: string;
  severity: AlarmSeverity;
  timestamp: number;
  acknowledged?: boolean;
}

export interface AlarmPanelProps {
  alarms: Alarm[];
  onAcknowledge?: (id: string) => void;
  onDismiss?: (id: string) => void;
  className?: string;
}

const order: Record<AlarmSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};

const sevColor: Record<AlarmSeverity, string> = {
  critical: "var(--bpm-error)",
  high: "color-mix(in srgb, var(--bpm-error) 70%, var(--bpm-warning))",
  medium: "var(--bpm-warning)",
  low: "var(--bpm-text-secondary)",
  info: "var(--bpm-accent)",
};

/**
 * Liste d’alarmes triée par gravité, accusé réception, suppression et clignotement pour le critique.
 */
export function AlarmPanel({ alarms, onAcknowledge, onDismiss, className = "" }: AlarmPanelProps) {
  const sorted = useMemo(
    () => [...alarms].sort((a, b) => order[a.severity] - order[b.severity] || b.timestamp - a.timestamp),
    [alarms]
  );

  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <style>{`
        @keyframes bpm-alarm-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
        .bpm-alarm-critical {
          animation: bpm-alarm-blink 1.1s ease-in-out infinite;
        }
      `}</style>
      {sorted.length === 0 ? (
        <div style={{ padding: 16, color: "var(--bpm-text-secondary)", fontSize: 13 }}>Aucune alarme</div>
      ) : (
        sorted.map((a) => (
          <div
            key={a.id}
            className={a.severity === "critical" && !a.acknowledged ? "bpm-alarm-critical" : undefined}
            style={{
              borderRadius: "var(--bpm-radius-sm)",
              border: "1px solid var(--bpm-border)",
              background: "var(--bpm-surface)",
              padding: "10px 12px",
              borderLeft: `4px solid ${sevColor[a.severity]}`,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 600, color: "var(--bpm-text-primary)", fontSize: 14 }}>{a.title}</div>
                {a.message ? <div style={{ fontSize: 12, color: "var(--bpm-text-secondary)", marginTop: 4 }}>{a.message}</div> : null}
                <div style={{ fontSize: 11, color: "var(--bpm-text-secondary)", marginTop: 6 }}>
                  {a.severity} · {new Date(a.timestamp).toLocaleString()}
                  {a.acknowledged ? " · Accusée" : ""}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
                {!a.acknowledged && onAcknowledge ? (
                  <button
                    type="button"
                    onClick={() => onAcknowledge(a.id)}
                    style={{
                      fontSize: 11,
                      padding: "4px 8px",
                      borderRadius: "var(--bpm-radius-sm)",
                      border: "1px solid var(--bpm-border)",
                      background: "var(--bpm-bg-secondary, var(--bpm-surface))",
                      color: "var(--bpm-text-primary)",
                      cursor: "pointer",
                    }}
                  >
                    Accuser
                  </button>
                ) : null}
                {onDismiss ? (
                  <button
                    type="button"
                    onClick={() => onDismiss(a.id)}
                    style={{
                      fontSize: 11,
                      padding: "4px 8px",
                      borderRadius: "var(--bpm-radius-sm)",
                      border: "1px solid var(--bpm-border)",
                      background: "transparent",
                      color: "var(--bpm-text-secondary)",
                      cursor: "pointer",
                    }}
                  >
                    Fermer
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
