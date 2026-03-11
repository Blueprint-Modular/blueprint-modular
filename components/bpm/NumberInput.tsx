"use client";

import React, { useState, useEffect } from "react";

export interface NumberInputProps {
  label?: string;
  value?: number | null;
  onChange?: (value: number | null) => void;
  min?: number | null;
  max?: number | null;
  step?: number;
  disabled?: boolean;
  help?: string | null;
  placeholder?: string;
}

export function NumberInput({
  label,
  value,
  onChange,
  min = null,
  max = null,
  step = 1,
  disabled = false,
  help = null,
  placeholder = "",
}: NumberInputProps) {
  const [displayString, setDisplayString] = useState(() =>
    value !== undefined && value != null ? String(value) : ""
  );
  const isControlled = value !== undefined;

  useEffect(() => {
    if (!isControlled) return;
    setDisplayString(value != null ? String(value) : "");
  }, [isControlled, value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    const allowed = /^[-+]?(\d*\.?\d*|\.\d*)(e[-+]?\d*)?$/i;
    if (v !== "" && !allowed.test(v)) return;
    setDisplayString(v);
    const num = v === "" ? null : parseFloat(v);
    if (onChange && !disabled) onChange(Number.isNaN(num as number) ? null : num);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "var(--bpm-border)";
    e.target.style.boxShadow = "none";
    let val: number | null = displayString === "" ? null : parseFloat(displayString);
    if (val != null && !Number.isNaN(val)) {
      if (min != null && val < min) val = min;
      if (max != null && val > max) val = max;
    }
    const normalized = val != null ? String(val) : "";
    setDisplayString(normalized);
    if (onChange && !disabled) onChange(val);
  };

  return (
    <div className="bpm-number-input-container">
      {label && (
        <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
          {label}
          {help && <span className="ml-1 opacity-70" title={help}>ⓘ</span>}
        </label>
      )}
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        className="w-full px-3 py-2 rounded-lg border text-sm min-h-[40px]"
        style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)", color: "var(--bpm-text-primary)", minHeight: 40, boxSizing: "border-box" }}
        value={displayString}
        onChange={handleChange}
        onFocus={(e) => {
          e.target.style.outline = "none";
          e.target.style.borderColor = "var(--bpm-accent)";
          e.target.style.boxShadow = "var(--bpm-focus-ring)";
        }}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
      />
    </div>
  );
}
