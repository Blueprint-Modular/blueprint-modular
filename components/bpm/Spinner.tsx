"use client";

import React from "react";
import "./Spinner.css";

export type SpinnerSize = "small" | "medium" | "large";
export type SpinnerVariant =
  | "circle"
  | "dot"
  | "wheel"
  | "pulse"
  | "bars"
  | "dualRing"
  | "dotsRing"
  | "isoBlocks"
  | "modularRings"
  | "hexSegments"
  | "modularGrid";

export interface SpinnerProps {
  text?: string;
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  /** Utilise la couleur texte (gris) au lieu de l'accent pour homogénéiser avec flèches/icônes neutres */
  neutral?: boolean;
  className?: string;
}

const sizeMap = { small: "w-5 h-5 border-2", medium: "w-8 h-8 border-2", large: "w-10 h-10 border-4" };
const wheelSizeMap = { small: "w-5 h-5 border-[3px]", medium: "w-8 h-8 border-[4px]", large: "w-10 h-10 border-[5px]" };

const accentColor = (neutral: boolean) =>
  neutral ? "var(--bpm-text-secondary)" : "var(--bpm-accent)";

export function Spinner({
  text = "Chargement...",
  size = "medium",
  variant = "circle",
  neutral = false,
  className = "",
}: SpinnerProps) {
  const content = (
    <>
      {text && (
        <span className="bpm-spinner-text text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          {text}
        </span>
      )}
    </>
  );

  if (variant === "dot") {
    return (
      <div className={`bpm-spinner-container inline-flex flex-col items-center gap-2 ${className}`}>
        <div className={`bpm-spinner-dots bpm-spinner-dots--${size} ${neutral ? "bpm-spinner-dots--neutral" : ""}`} aria-hidden>
          <span className="bpm-spinner-dot" />
          <span className="bpm-spinner-dot" />
          <span className="bpm-spinner-dot" />
        </div>
        {content}
      </div>
    );
  }

  if (variant === "wheel") {
    return (
      <div className={`bpm-spinner-container inline-flex flex-col items-center gap-2 ${className}`}>
        <div
          className={`bpm-spinner bpm-spinner-wheel rounded-full border-solid border-t-transparent animate-spin ${wheelSizeMap[size]}`}
          style={{
            borderColor: "var(--bpm-border)",
            borderTopColor: accentColor(neutral),
          }}
          aria-hidden
        />
        {content}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={`bpm-spinner-container inline-flex flex-col items-center gap-2 ${className}`}>
        <div
          className={`bpm-spinner-pulse bpm-spinner-pulse--${size}`}
          style={{ background: accentColor(neutral) }}
          aria-hidden
        />
        {content}
      </div>
    );
  }

  if (variant === "bars") {
    return (
      <div className={`bpm-spinner-container inline-flex flex-col items-center gap-2 ${className}`}>
        <div className={`bpm-spinner-bars bpm-spinner-bars--${size}`} aria-hidden>
          <span className="bpm-spinner-bar" style={{ background: accentColor(neutral) }} />
          <span className="bpm-spinner-bar" style={{ background: accentColor(neutral) }} />
          <span className="bpm-spinner-bar" style={{ background: accentColor(neutral) }} />
          <span className="bpm-spinner-bar" style={{ background: accentColor(neutral) }} />
        </div>
        {content}
      </div>
    );
  }

  if (variant === "dualRing") {
    const color = accentColor(neutral);
    return (
      <div className={`bpm-spinner-container inline-flex flex-col items-center gap-2 ${className}`}>
        <div className={`bpm-spinner-dual-ring bpm-spinner-dual-ring--${size}`} aria-hidden>
          <div
            className="bpm-spinner-dual-ring-outer rounded-full border-solid border-2 border-transparent animate-spin"
            style={{ borderTopColor: color, borderRightColor: color }}
          />
          <div
            className="bpm-spinner-dual-ring-inner rounded-full border-solid border-2 border-transparent animate-spin"
            style={{ borderBottomColor: color, borderLeftColor: color }}
          />
        </div>
        {content}
      </div>
    );
  }

  if (variant === "dotsRing") {
    const color = accentColor(neutral);
    return (
      <div className={`bpm-spinner-container inline-flex flex-col items-center gap-2 ${className}`}>
        <div className={`bpm-spinner-dots-ring bpm-spinner-dots-ring--${size}`} aria-hidden>
          <span className="bpm-spinner-dots-ring-dot" style={{ background: color }} />
          <span className="bpm-spinner-dots-ring-dot" style={{ background: color }} />
          <span className="bpm-spinner-dots-ring-dot" style={{ background: color }} />
        </div>
        {content}
      </div>
    );
  }

  if (variant === "isoBlocks") {
    return (
      <div className={`bpm-spinner-container inline-flex flex-col items-center gap-2 ${className}`}>
        <div className={`bpm-spinner-iso-blocks bpm-spinner-iso-blocks--${size}`} aria-hidden>
          <div className="bpm-spinner-iso-block">
            <div className="bpm-spinner-iso-top" />
            <div className="bpm-spinner-iso-left" />
            <div className="bpm-spinner-iso-right" />
          </div>
          <div className="bpm-spinner-iso-block">
            <div className="bpm-spinner-iso-top" />
            <div className="bpm-spinner-iso-left" />
            <div className="bpm-spinner-iso-right" />
          </div>
          <div className="bpm-spinner-iso-block">
            <div className="bpm-spinner-iso-top" />
            <div className="bpm-spinner-iso-left" />
            <div className="bpm-spinner-iso-right" />
          </div>
        </div>
        {content}
      </div>
    );
  }

  if (variant === "modularRings") {
    return (
      <div className={`bpm-spinner-container inline-flex flex-col items-center gap-2 ${className}`}>
        <div className={`bpm-spinner-modular-rings bpm-spinner-modular-rings--${size}`} aria-hidden>
          <div className="bpm-spinner-mring bpm-spinner-mring-1" />
          <div className="bpm-spinner-mring bpm-spinner-mring-2" />
          <div className="bpm-spinner-mring bpm-spinner-mring-3" />
          <div className="bpm-spinner-mring-dot" />
        </div>
        {content}
      </div>
    );
  }

  if (variant === "hexSegments") {
    return (
      <div className={`bpm-spinner-container inline-flex flex-col items-center gap-2 ${className}`}>
        <div className={`bpm-spinner-hex-segments bpm-spinner-hex-segments--${size}`} aria-hidden>
          <div className="bpm-spinner-hseg bpm-spinner-hseg-1" />
          <div className="bpm-spinner-hseg bpm-spinner-hseg-2" />
          <div className="bpm-spinner-hseg bpm-spinner-hseg-3" />
          <div className="bpm-spinner-hseg bpm-spinner-hseg-4" />
          <div className="bpm-spinner-hseg bpm-spinner-hseg-5" />
          <div className="bpm-spinner-hseg bpm-spinner-hseg-6" />
        </div>
        {content}
      </div>
    );
  }

  if (variant === "modularGrid") {
    return (
      <div className={`bpm-spinner-container inline-flex flex-col items-center gap-2 ${className}`}>
        <div className={`bpm-spinner-modular-grid bpm-spinner-modular-grid--${size}`} aria-hidden>
          <div className="bpm-spinner-grid-cell bpm-spinner-grid-cell--d1" />
          <div className="bpm-spinner-grid-cell bpm-spinner-grid-cell--d2" />
          <div className="bpm-spinner-grid-cell bpm-spinner-grid-cell--empty" />
          <div className="bpm-spinner-grid-cell bpm-spinner-grid-cell--d4" />
          <div className="bpm-spinner-grid-cell bpm-spinner-grid-cell--d5" />
          <div className="bpm-spinner-grid-cell bpm-spinner-grid-cell--d6" />
          <div className="bpm-spinner-grid-cell bpm-spinner-grid-cell--empty" />
          <div className="bpm-spinner-grid-cell bpm-spinner-grid-cell--d8" />
          <div className="bpm-spinner-grid-cell bpm-spinner-grid-cell--d9" />
        </div>
        {content}
      </div>
    );
  }

  /* circle (défaut) */
  return (
    <div className={`bpm-spinner-container inline-flex flex-col items-center gap-2 ${className}`}>
      <div
        className={`bpm-spinner rounded-full border-solid border-t-transparent animate-spin ${sizeMap[size]}`}
        style={{
          borderColor: "var(--bpm-border)",
          borderTopColor: accentColor(neutral),
        }}
        aria-hidden
      />
      {content}
    </div>
  );
}
