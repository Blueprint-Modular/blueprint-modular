"use client";

import React from "react";

export type ChipVariant = "default" | "primary" | "outline";

export interface ChipProps {
  label: React.ReactNode;
  onDelete?: () => void;
  onClick?: () => void;
  variant?: ChipVariant;
  disabled?: boolean;
  className?: string;
}

export function Chip({
  label,
  onDelete,
  onClick,
  variant = "default",
  disabled = false,
  className = "",
}: ChipProps) {
  const isClickable = Boolean(onClick && !disabled);
  return (
    <span
      className={`bpm-chip inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
        isClickable ? "cursor-pointer" : ""
      } ${disabled ? "opacity-60" : ""} ${className}`.trim()}
      style={{
        background: variant === "primary" ? "var(--bpm-accent)" : "var(--bpm-bg-secondary)",
        color: variant === "primary" ? "var(--bpm-accent-contrast)" : "var(--bpm-text-primary)",
        border: variant === "outline" ? "1px solid var(--bpm-border)" : "none",
      }}
      role={onDelete ? "button" : undefined}
      onClick={disabled ? undefined : onClick}
    >
      <span className="bpm-chip-label">{label}</span>
      {onDelete && !disabled && (
        <button
          type="button"
          className="bpm-chip-delete ml-0.5 w-4 h-4 flex items-center justify-center rounded-full hover:bg-black/10 border-0 cursor-pointer"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          aria-label="Retirer"
        >
          ×
        </button>
      )}
    </span>
  );
}
