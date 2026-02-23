"use client";

import React from "react";

export interface PanelProps {
  variant?: "info" | "success" | "warning" | "error";
  title?: string | null;
  icon?: string | null | false;
  /** Couleur inversée : fond sombre, texte blanc (style zone type Executive Summary). */
  inverted?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const variantBorder: Record<string, string> = {
  info: "var(--bpm-accent-cyan)",
  success: "var(--bpm-accent-mint)",
  warning: "#f59e0b",
  error: "#ef4444",
};

export function Panel({
  variant = "info",
  title = null,
  icon = null,
  inverted = false,
  children,
  className = "",
}: PanelProps) {
  const iconChar = icon ?? (variant === "error" || variant === "warning" ? "!" : "i");
  const borderColor = variantBorder[variant] ?? variantBorder.info;

  return (
    <div
      className={`rounded-lg border-l-4 p-4 ${inverted ? "bpm-panel-inverted" : ""} ${className}`}
      style={{
        background: inverted ? undefined : "var(--bpm-bg-secondary)",
        borderColor,
        color: inverted ? undefined : "var(--bpm-text-primary)",
      }}
      role="region"
      aria-label={title ?? `Panneau ${variant}`}
    >
      {(title || icon !== false) && (
        <div className="flex items-center gap-2 mb-2">
          <span
            className="flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold"
            style={{ background: borderColor, color: "#fff" }}
          >
            {icon ?? iconChar}
          </span>
          {title && <span className="font-semibold">{title}</span>}
        </div>
      )}
      {children && <div>{children}</div>}
    </div>
  );
}
