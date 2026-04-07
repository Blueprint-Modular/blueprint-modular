"use client";

import React from "react";

export type AnomalySeverity = "info" | "warning" | "critical";

export interface AnomalyAlertProps {
  title?: string;
  expected: string | number;
  actual: string | number;
  severity?: AnomalySeverity;
  className?: string;
  onDismiss?: () => void;
}

const SEV_BG: Record<AnomalySeverity, string> = {
  info: "var(--bpm-accent-soft)",
  warning: "var(--bpm-warning-soft)",
  critical: "var(--bpm-error-soft)",
};

const SEV_BORDER: Record<AnomalySeverity, string> = {
  info: "var(--bpm-accent-border)",
  warning: "var(--bpm-warning)",
  critical: "var(--bpm-error)",
};

const SEV_TEXT: Record<AnomalySeverity, string> = {
  info: "var(--bpm-text-primary)",
  warning: "var(--bpm-warning-text)",
  critical: "var(--bpm-error-text)",
};

export function AnomalyAlert({
  title = "Anomalie détectée",
  expected,
  actual,
  severity = "warning",
  className = "",
  onDismiss,
}: AnomalyAlertProps) {
  return (
    <div
      role="alert"
      className={className}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "12px 16px",
        borderRadius: "var(--bpm-radius)",
        border: `1px solid ${SEV_BORDER[severity]}`,
        background: SEV_BG[severity],
        color: SEV_TEXT[severity],
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 14, lineHeight: 1.5 }}>
          <span style={{ opacity: 0.9 }}>Attendu :</span>{" "}
          <strong>{expected}</strong>
          <span style={{ margin: "0 8px", opacity: 0.6 }}>·</span>
          <span style={{ opacity: 0.9 }}>Mesuré :</span>{" "}
          <strong>{actual}</strong>
        </div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Fermer"
          style={{
            border: "none",
            background: "transparent",
            color: "inherit",
            cursor: "pointer",
            fontSize: 18,
            lineHeight: 1,
            padding: 4,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
