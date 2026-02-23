"use client";

import React from "react";

export interface CheckboxProps {
  label?: React.ReactNode;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({
  label,
  checked = false,
  onChange,
  disabled = false,
  className = "",
}: CheckboxProps) {
  return (
    <label
      className={`bpm-checkbox-wrap inline-flex items-center gap-2 cursor-pointer select-none ${
        disabled ? "opacity-60 cursor-not-allowed" : ""
      } ${className}`.trim()}
    >
      <input
        type="checkbox"
        className="bpm-checkbox rounded border-gray-300 accent-[var(--bpm-accent)]"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={disabled}
      />
      {label != null && (
        <span className="text-sm" style={{ color: "var(--bpm-text-primary)" }}>{label}</span>
      )}
    </label>
  );
}
