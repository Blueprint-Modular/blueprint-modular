"use client";

import React from "react";

export type RadioOption = string | { value: string; label?: string };

export interface RadioGroupProps {
  name?: string;
  label?: string;
  options?: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  layout?: "vertical" | "horizontal";
  className?: string;
}

function getOptValue(opt: RadioOption): string {
  return typeof opt === "string" ? opt : opt.value;
}
function getOptLabel(opt: RadioOption): string {
  return typeof opt === "string" ? opt : opt.label ?? opt.value;
}

export function RadioGroup({
  name,
  label,
  options = [],
  value,
  onChange,
  disabled = false,
  layout = "vertical",
  className = "",
}: RadioGroupProps) {
  return (
    <div
      className={`bpm-radiogroup-wrap ${layout === "horizontal" ? "flex flex-wrap gap-4" : "flex flex-col gap-2"} ${className}`.trim()}
      role="radiogroup"
      aria-label={label ?? name}
    >
      {label && (
        <span className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
          {label}
        </span>
      )}
      <div className="flex flex-col gap-2">
        {options.map((opt) => {
          const optValue = getOptValue(opt);
          const optLabel = getOptLabel(opt);
          const checked = value === optValue;
          return (
            <label
              key={optValue}
              className={`inline-flex items-center gap-2 cursor-pointer select-none ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <input
                type="radio"
                name={name}
                value={optValue}
                checked={checked}
                onChange={() => onChange?.(optValue)}
                disabled={disabled}
                className="accent-[var(--bpm-accent)]"
              />
              <span className="text-sm" style={{ color: "var(--bpm-text-primary)" }}>{optLabel}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
