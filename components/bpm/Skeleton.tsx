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
  /** Contrôle le rayon des bords (ignoré si variant === "circular"). */
  rounded?: SkeletonRounded;
}

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
  rounded = "md",
}: SkeletonProps) {
  const style: React.CSSProperties = {};
  if (width != null) style.width = typeof width === "number" ? `${width}px` : width;
  if (height != null) style.height = typeof height === "number" ? `${height}px` : height;
  const roundClass = variant === "circular" ? "rounded-full" : roundedClass[rounded];
  return (
    <span
      className={`bpm-skeleton inline-block ${animated ? "animate-pulse" : ""} ${roundClass} ${className}`.trim()}
      style={{
        ...style,
        background: "var(--bpm-skeleton-bg, var(--bpm-bg-secondary))",
      }}
      aria-hidden
    />
  );
}
