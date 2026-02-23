"use client";

import React from "react";

function toInputValue(date: Date | string | null | undefined): string {
  if (!date) return "";
  if (date instanceof Date) return date.toISOString().split("T")[0];
  return String(date).split("T")[0];
}

export interface DateInputProps {
  label?: string;
  value?: Date | string | null;
  onChange?: (value: Date | null) => void;
  disabled?: boolean;
  help?: string | null;
  min?: Date | string | null;
  max?: Date | string | null;
}

export function DateInput({
  label,
  value,
  onChange,
  disabled = false,
  help = null,
  min = null,
  max = null,
}: DateInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange && !disabled) {
      const v = e.target.value;
      onChange(v ? new Date(v) : null);
    }
  };

  return (
    <div className="bpm-date-input-container">
      {label && (
        <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
          {label}
          {help && <span className="ml-1 opacity-70" title={help}>ⓘ</span>}
        </label>
      )}
      <input
        type="date"
        className="w-full px-3 py-2 rounded-lg border text-sm"
        style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)", color: "var(--bpm-text-primary)" }}
        value={toInputValue(value)}
        onChange={handleChange}
        disabled={disabled}
        min={toInputValue(min) || undefined}
        max={toInputValue(max) || undefined}
      />
    </div>
  );
}
