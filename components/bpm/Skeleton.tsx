"use client";

import React from "react";

export type SkeletonVariant = "rectangular" | "circular" | "text";

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
  className?: string;
}

export function Skeleton({
  variant = "rectangular",
  width,
  height,
  className = "",
}: SkeletonProps) {
  const style: React.CSSProperties = {};
  if (width != null) style.width = typeof width === "number" ? `${width}px` : width;
  if (height != null) style.height = typeof height === "number" ? `${height}px` : height;
  return (
    <span
      className={`bpm-skeleton inline-block animate-pulse ${variant === "circular" ? "rounded-full" : "rounded"} ${className}`.trim()}
      style={{
        ...style,
        background: "var(--bpm-bg-secondary)",
      }}
      aria-hidden
    />
  );
}
