"use client";

import React from "react";

export type SkeletonVariant = "rectangular" | "circular" | "text";

export type SkeletonRounded = "sm" | "md" | "lg" | "full";

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
  className?: string;
  /** Désactive l'animation pulse (utile pour screenshots, tests, prefers-reduced-motion). */
  animated?: boolean;
  /** Animation shimmer (dégradé balayant) en alternative au pulse. */
  shimmer?: boolean;
  /** Contrôle le rayon des bords (ignoré si variant === "circular"). */
  rounded?: SkeletonRounded;
}

/**
 * @component bpm.skeleton
 * @description Placeholder anime (rectangles, cercles) pendant le chargement de contenu pour eviter layout shift.
 * @example
 * bpm.skeleton({ width: 200, height: 20, variant: "text" })
 * @props
 * - variant ('rectangular' | 'circular' | 'text', optionnel) — Forme. Default: 'rectangular'.
 * - width (number | string, optionnel) — Largeur.
 * - height (number | string, optionnel) — Hauteur.
 * - className (string, optionnel) — Classes CSS.
 * - animated (boolean, optionnel) — Animation pulse. Default: true.
 * - shimmer (boolean, optionnel) — Animation shimmer. Default: false.
 * - rounded ('sm' | 'md' | 'lg' | 'full', optionnel) — Bords arrondis. Default: 'md'.
 * @usage Chargement liste, fiche produit, tableau.
 * @context PARENT: bpm.panel | bpm.card. ASSOCIATED: bpm.spinner, bpm.table. FORBIDDEN: aucun.
 */
const roundedClass: Record<SkeletonRounded, string> = {
  sm: "rounded-sm",
  md: "rounded",
  lg: "rounded-lg",
  full: "rounded-full",
};

export function Skeleton({
  variant = "rectangular",
  width,
  height,
  className = "",
  animated = true,
  shimmer = false,
  rounded = "md",
}: SkeletonProps) {
  const style: React.CSSProperties = { maxWidth: "100%" };
  if (width != null) style.width = typeof width === "number" ? `${width}px` : width;
  if (height != null) style.height = typeof height === "number" ? `${height}px` : height;
  const roundClass = variant === "circular" ? "rounded-full" : roundedClass[rounded];
  const animationClass = shimmer ? "bpm-skeleton--shimmer" : animated ? "animate-pulse" : "";
  return (
    <span
      className={`bpm-skeleton block ${animationClass} ${roundClass} ${className}`.trim()}
      style={{
        ...style,
        background: "var(--bpm-skeleton-bg, var(--bpm-bg-secondary))",
      }}
      aria-hidden
    />
  );
}
