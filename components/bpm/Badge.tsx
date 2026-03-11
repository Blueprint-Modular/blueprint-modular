"use client";

import React from "react";

export type BadgeVariant = "default" | "primary" | "success" | "warning" | "error";

export interface BadgeProps {
  /** PARENT: bpm.table (colonne statut) | bpm.metric | bpm.card. INTERDIT: texte long >20 chars — utiliser bpm.chip. ASSOCIÉ: bpm.table, bpm.metric, bpm.statusBox. */
  children: React.ReactNode;
  /** Style / couleur du badge. Valeurs : 'default' | 'primary' | 'success' | 'warning' | 'error'. Default: 'default'. */
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  default: {
    background: "var(--bpm-bg-secondary)",
    color: "var(--bpm-text-primary)",
    border: "1px solid var(--bpm-border)",
  },
  primary: {
    background: "var(--bpm-accent-cyan)",
    color: "var(--bpm-accent-contrast)",
    border: "none",
  },
  success: {
    background: "rgba(69,208,158,0.2)",
    color: "#0d6b2c",
    border: "1px solid var(--bpm-accent-mint)",
  },
  warning: {
    background: "rgba(245,158,11,0.15)",
    color: "#8a5a00",
    border: "1px solid #f59e0b",
  },
  error: {
    background: "rgba(239,68,68,0.15)",
    color: "#b30d0d",
    border: "1px solid #ef4444",
  },
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`bpm-badge bpm-badge-${variant} inline-block text-xs font-medium px-2 py-0.5 rounded-md ${className}`.trim()}
      style={variantStyles[variant]}
    >
      {children}
    </span>
  );
}
