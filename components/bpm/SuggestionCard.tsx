"use client";

import React from "react";

export interface SuggestionCardProps {
  title: string;
  description: string;
  confidence?: number;
  icon?: string;
  actions: { label: string; onClick: () => void; variant?: "primary" | "secondary" }[];
  dismissable?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function SuggestionCard({
  title,
  description,
  confidence,
  icon,
  actions,
  dismissable,
  onDismiss,
  className = "",
}: SuggestionCardProps) {
  return (
    <div
      className={`bpm-suggestion-card ${className}`.trim()}
      style={{
        position: "relative",
        border: "1px solid var(--bpm-border)",
        borderLeft: "3px solid var(--bpm-accent)",
        borderRadius: "var(--bpm-radius)",
        padding: "14px 16px",
        background: "var(--bpm-surface)",
        boxShadow: "var(--bpm-shadow-sm)",
      }}
    >
      {dismissable && onDismiss && (
        <button
          type="button"
          aria-label="Fermer"
          onClick={onDismiss}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: 18,
            color: "var(--bpm-text-secondary)",
          }}
        >
          ×
        </button>
      )}
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        {icon && (
          <span className="material-symbols-outlined" aria-hidden style={{ fontSize: 22, color: "var(--bpm-accent)" }}>
            {icon}
          </span>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: "var(--bpm-text-primary)" }}>{title}</div>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--bpm-text-secondary)" }}>{description}</p>
          {confidence != null && (
            <div style={{ marginTop: 10 }}>
              <div style={{ height: 4, borderRadius: 2, background: "var(--bpm-border)", overflow: "hidden" }}>
                <div style={{ width: `${Math.min(100, Math.max(0, confidence))}%`, height: "100%", background: "var(--bpm-accent)" }} />
              </div>
              <span style={{ fontSize: 11, color: "var(--bpm-text-secondary)" }}>{confidence}% confiance</span>
            </div>
          )}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
        {actions.map((a, i) => (
          <button
            key={i}
            type="button"
            onClick={a.onClick}
            style={{
              padding: "6px 12px",
              fontSize: 13,
              borderRadius: "var(--bpm-radius-sm)",
              border: a.variant === "primary" ? "none" : "1px solid var(--bpm-border)",
              background: a.variant === "primary" ? "var(--bpm-accent)" : "transparent",
              color: a.variant === "primary" ? "var(--bpm-accent-contrast)" : "var(--bpm-text-primary)",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
