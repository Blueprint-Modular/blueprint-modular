"use client";

import React, { useMemo } from "react";

export type LiveGaugeSize = "sm" | "md" | "lg";

export interface LiveGaugeProps {
  value: number;
  min?: number;
  max?: number;
  warningAbove?: number;
  criticalAbove?: number;
  size?: LiveGaugeSize;
  label?: string;
  className?: string;
}

const sizeMap: Record<LiveGaugeSize, { w: number; h: number; stroke: number }> = {
  sm: { w: 160, h: 96, stroke: 10 },
  md: { w: 220, h: 128, stroke: 12 },
  lg: { w: 280, h: 160, stroke: 14 },
};

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/**
 * Jauge demi-cercle avec aiguille et zones seuil (normal / avertissement / critique).
 */
export function LiveGauge({
  value,
  min = 0,
  max = 100,
  warningAbove,
  criticalAbove,
  size = "md",
  label,
  className = "",
}: LiveGaugeProps) {
  const { w, h, stroke } = sizeMap[size];
  const cx = w / 2;
  const cy = h - 4;
  const r = Math.min(w * 0.42, (h - 8) * 0.9);

  const t = useMemo(() => {
    if (max <= min) return 0;
    return Math.min(1, Math.max(0, (value - min) / (max - min)));
  }, [value, min, max]);

  const angleFor = (v: number) => {
    if (max <= min) return 180;
    const x = Math.min(1, Math.max(0, (v - min) / (max - min)));
    return 180 + x * 180;
  };

  const needleAngle = angleFor(value);
  const pN = polar(cx, cy, r * 0.9, needleAngle);

  const arcPath = (a0: number, a1: number) => {
    const p0 = polar(cx, cy, r, a0);
    const p1 = polar(cx, cy, r, a1);
    const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
    return `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${large} 1 ${p1.x} ${p1.y}`;
  };

  const lo = warningAbove != null && criticalAbove != null ? Math.min(warningAbove, criticalAbove) : null;
  const hi = warningAbove != null && criticalAbove != null ? Math.max(warningAbove, criticalAbove) : null;

  return (
    <div className={className} style={{ display: "inline-flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-label={label ?? "Gauge"}>
        <path d={arcPath(180, 360)} fill="none" stroke="var(--bpm-border)" strokeWidth={stroke} strokeLinecap="round" opacity={0.45} />
        {lo != null && hi != null && max > min ? (
          <>
            <path d={arcPath(180, angleFor(lo))} fill="none" stroke="var(--bpm-success)" strokeWidth={stroke} strokeLinecap="round" opacity={0.85} />
            <path d={arcPath(angleFor(lo), angleFor(hi))} fill="none" stroke="var(--bpm-warning)" strokeWidth={stroke} strokeLinecap="round" opacity={0.9} />
            <path d={arcPath(angleFor(hi), 360)} fill="none" stroke="var(--bpm-error)" strokeWidth={stroke} strokeLinecap="round" />
          </>
        ) : (
          <path
            d={arcPath(180, 180 + t * 180)}
            fill="none"
            stroke="var(--bpm-accent)"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
        )}
        <line
          x1={cx}
          y1={cy}
          x2={pN.x}
          y2={pN.y}
          stroke="var(--bpm-text-primary)"
          strokeWidth={2.5}
          strokeLinecap="round"
          style={{ transition: "stroke 0.2s ease" }}
        />
        <circle cx={cx} cy={cy} r={5} fill="var(--bpm-surface)" stroke="var(--bpm-border)" strokeWidth={1.5} />
      </svg>
      {label ? <span style={{ fontSize: 12, color: "var(--bpm-text-secondary)", marginTop: 2 }}>{label}</span> : null}
      <span style={{ fontSize: 18, fontWeight: 600, color: "var(--bpm-text-primary)" }}>{value}</span>
    </div>
  );
}
