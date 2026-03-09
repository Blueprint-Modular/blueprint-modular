"use client";

import React, { useId } from "react";
import "./LoadingBar.css";

export type LoadingBarVariant =
  | "sweep"
  | "blocks"
  | "iso"
  | "stacked"
  | "arc"
  | "dots";

export interface LoadingBarProps {
  /** Variant visuel (sweep, blocks, iso, stacked, arc, dots). */
  variant?: LoadingBarVariant;
  /** Pour les barres déterminées (ex. iso) : 0–100. Non fourni = indéterminé. */
  value?: number;
  /** Hauteur : thin (6px), default (8px), thick (12px). */
  size?: "thin" | "default" | "thick";
  /** Désactive l'animation (utile pour screenshots ou prefers-reduced-motion). */
  animated?: boolean;
  className?: string;
  /** Accessibilité : label du progressbar. */
  "aria-label"?: string;
}

const BLOCK_COUNT = 12;
const DOT_COUNT = 14;

/**
 * @component bpm.loadingBar
 * @description Barre de progression horizontale (déterminée ou indéterminée) pour chargement de tâches.
 * @example
 * bpm.loadingBar({ variant: "sweep", value: 65, size: "default" })
 * @props
 * - variant (string, optionnel) — Style (sweep, blocks, iso…). Default: 'sweep'.
 * - value (number, optionnel) — 0–100 pour barre déterminée. Omit = indéterminé.
 * - size ('thin' | 'default' | 'thick', optionnel) — Hauteur. Default: 'default'.
 * - animated (boolean, optionnel) — Animation. Default: true.
 * - className (string, optionnel) — Classes CSS.
 * - aria-label (string, optionnel) — Accessibilité.
 * @usage Import en cours, génération de rapport, upload fichier.
 * @context PARENT: bpm.panel | page directe. ASSOCIATED: bpm.spinner, bpm.progress. FORBIDDEN: aucun.
 */
export function LoadingBar({
  variant = "sweep",
  value,
  size = "default",
  animated = true,
  className = "",
  "aria-label": ariaLabel,
}: LoadingBarProps) {
  const uniqueId = useId().replace(/:/g, "-");
  const pct = value != null ? Math.min(100, Math.max(0, value)) : null;
  const isDeterminate = pct != null && variant === "iso";
  const role = isDeterminate ? "progressbar" : "status";
  const ariaProps = isDeterminate
    ? { "aria-valuenow": pct, "aria-valuemin": 0, "aria-valuemax": 100 }
    : { "aria-label": ariaLabel ?? "Chargement en cours" };

  const wrapClass = `bpm-loadingbar bpm-loadingbar--${variant} bpm-loadingbar--${size} ${animated ? "" : "bpm-loadingbar--static"} ${className}`.trim();

  if (variant === "sweep") {
    return (
      <div className={wrapClass} role={role} {...ariaProps} aria-hidden={!ariaLabel && !isDeterminate}>
        <div className="bpm-loadingbar-sweep-track">
          <div className="bpm-loadingbar-sweep-fill" />
          <div className="bpm-loadingbar-sweep-glow" />
        </div>
      </div>
    );
  }

  if (variant === "blocks") {
    return (
      <div className={wrapClass} role={role} {...ariaProps} aria-hidden={!ariaLabel && !isDeterminate}>
        <div className="bpm-loadingbar-blocks-track">
          {Array.from({ length: BLOCK_COUNT }, (_, i) => (
            <div key={i} className="bpm-loadingbar-block-seg" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      </div>
    );
  }

  if (variant === "iso") {
    const widthStyle = isDeterminate ? { width: `${pct}%` } : undefined;
    return (
      <div className={wrapClass} role={role} {...ariaProps} aria-hidden={!ariaLabel && !isDeterminate}>
        <div className="bpm-loadingbar-iso-wrap" data-indeterminate={!isDeterminate ? "true" : undefined}>
          <div className="bpm-loadingbar-iso-top" style={widthStyle} />
          <div className="bpm-loadingbar-iso-track">
            <div className="bpm-loadingbar-iso-fill" style={widthStyle} />
          </div>
          <div className="bpm-loadingbar-iso-side" style={widthStyle} />
        </div>
      </div>
    );
  }

  if (variant === "stacked") {
    return (
      <div className={wrapClass} role={role} {...ariaProps} aria-hidden={!ariaLabel && !isDeterminate}>
        <div className="bpm-loadingbar-stacked-wrap">
          <div className="bpm-loadingbar-stacked-track">
            <div className="bpm-loadingbar-stacked-fill bpm-loadingbar-stacked-fill--1" />
          </div>
          <div className="bpm-loadingbar-stacked-track">
            <div className="bpm-loadingbar-stacked-fill bpm-loadingbar-stacked-fill--2" />
          </div>
          <div className="bpm-loadingbar-stacked-track">
            <div className="bpm-loadingbar-stacked-fill bpm-loadingbar-stacked-fill--3" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "arc") {
    const gradId = `bpm-loadingbar-arc-grad-${uniqueId}`;
    const grad2Id = `bpm-loadingbar-arc-grad2-${uniqueId}`;
    return (
      <div className={wrapClass} role={role} {...ariaProps} aria-hidden={!ariaLabel && !isDeterminate}>
        <div className="bpm-loadingbar-arc-wrap">
          <svg className="bpm-loadingbar-arc-svg" viewBox="0 0 600 28" aria-hidden>
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--bpm-accent, #1264C8)" />
                <stop offset="40%" stopColor="var(--bpm-accent-light, #18A0FB)" />
                <stop offset="70%" stopColor="#00C6FB" />
                <stop offset="100%" stopColor="var(--bpm-accent-cyan, #00E0C5)" />
              </linearGradient>
              <linearGradient id={grad2Id} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--bpm-accent, #1264C8)" stopOpacity={0.15} />
                <stop offset="100%" stopColor="var(--bpm-accent-cyan, #00E0C5)" stopOpacity={0.15} />
              </linearGradient>
            </defs>
            <rect x={0} y={10} width={600} height={8} rx={4} fill={`url(#${grad2Id})`} />
            <rect x={0} y={10} width={140} height={8} rx={4} fill={`url(#${gradId})`} opacity={0.9} className="bpm-loadingbar-arc-rect bpm-loadingbar-arc-rect--1" />
            <rect x={0} y={10} width={100} height={8} rx={4} fill={`url(#${gradId})`} opacity={0.6} className="bpm-loadingbar-arc-rect bpm-loadingbar-arc-rect--2" />
            <rect x={0} y={10} width={60} height={8} rx={4} fill={`url(#${gradId})`} opacity={0.35} className="bpm-loadingbar-arc-rect bpm-loadingbar-arc-rect--3" />
          </svg>
        </div>
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className={wrapClass} role={role} {...ariaProps} aria-hidden={!ariaLabel && !isDeterminate}>
        <div className="bpm-loadingbar-dots-track">
          {Array.from({ length: DOT_COUNT }, (_, i) => (
            <div key={i} className="bpm-loadingbar-dot" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      </div>
    );
  }

  return null;
}
