"use client";

import React, { useState } from "react";

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
  const [local, setLocal] = useState("");
  const isControlled = value !== undefined;
  const displayValue = isControlled ? (value != null ? String(value) : "") : local;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (!isControlled) setLocal(v);
    const num = v === "" ? null : parseFloat(v);
    if (onChange && !disabled) onChange(Number.isNaN(num as number) ? null : num);
  };

  const handleBlur = () => {
    let val: number | null = displayValue === "" ? null : parseFloat(displayValue);
    if (val != null && !Number.isNaN(val)) {
      if (min != null && val < min) val = min;
      if (max != null && val > max) val = max;
    }
    if (!isControlled) setLocal(val != null ? String(val) : "");
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
        className="w-full px-3 py-2 rounded-lg border text-sm"
        style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)", color: "var(--bpm-text-primary)" }}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
      />
    </div>
  );
}
