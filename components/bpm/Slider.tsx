"use client";

import React from "react";

export interface SliderProps {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  label,
  disabled = false,
  className = "",
}: SliderProps) {
  const v = value ?? min;
  return (
    <div className={`bpm-slider-wrap ${className}`.trim()}>
      {label && (
        <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
          {label}
        </label>
      )}
      <div className="flex items-center gap-3">
        <input
          type="range"
          className="bpm-slider flex-1 accent-[var(--bpm-accent)]"
          min={min}
          max={max}
          step={step}
          value={v}
          onChange={(e) => onChange?.(parseFloat(e.target.value))}
          disabled={disabled}
        />
        <span className="bpm-slider-value text-sm tabular-nums w-8" style={{ color: "var(--bpm-text-secondary)" }}>
          {v}
        </span>
      </div>
    </div>
  );
}
