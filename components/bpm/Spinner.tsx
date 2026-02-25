"use client";

import React from "react";
import "./Spinner.css";

export type SpinnerSize = "small" | "medium" | "large";
export type SpinnerVariant = "circle" | "dot";

export interface SpinnerProps {
  text?: string;
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  /** Utilise la couleur texte (gris) au lieu de l'accent pour homogénéiser avec flèches/icônes neutres */
  neutral?: boolean;
  className?: string;
}

const sizeMap = { small: "w-5 h-5 border-2", medium: "w-8 h-8 border-2", large: "w-10 h-10 border-4" };

export function Spinner({
  text = "Chargement...",
  size = "medium",
  variant = "circle",
  neutral = false,
  className = "",
}: SpinnerProps) {
  if (variant === "dot") {
    return (
      <div className={`bpm-spinner-container inline-flex flex-col items-center gap-2 ${className}`}>
        <div
          className={`bpm-spinner-dots bpm-spinner-dots--${size}`}
          aria-hidden
        >
          <span className="bpm-spinner-dot" />
          <span className="bpm-spinner-dot" />
          <span className="bpm-spinner-dot" />
        </div>
        {text && (
          <span className="bpm-spinner-text text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
            {text}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`bpm-spinner-container inline-flex flex-col items-center gap-2 ${className}`}
    >
      <div
        className={`bpm-spinner rounded-full border-solid border-t-transparent animate-spin ${sizeMap[size]}`}
        style={{
          borderColor: "var(--bpm-border)",
          borderTopColor: neutral ? "var(--bpm-text-secondary)" : "var(--bpm-accent)",
        }}
      />
      {text && (
        <span className="bpm-spinner-text text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          {text}
        </span>
      )}
    </div>
  );
}
