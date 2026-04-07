"use client";

import React, { useMemo } from "react";

export interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

/**
 * Anneau de progression SVG avec transition sur le segment rempli.
 */
export function ProgressRing({
  value,
  max = 100,
  size = 72,
  strokeWidth = 8,
  className = "",
}: ProgressRingProps) {
  const r = useMemo(() => (size - strokeWidth) / 2, [size, strokeWidth]);
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, max <= 0 ? 0 : value / max));
  const dash = c * (1 - pct);

  return (
    <svg width={size} height={size} className={className} viewBox={`0 0 ${size} ${size}`} aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} role="progressbar">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--bpm-border)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--bpm-accent)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${c}`}
        strokeDashoffset={dash}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{
          transition: "stroke-dashoffset 0.45s ease",
        }}
      />
    </svg>
  );
}
