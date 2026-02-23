"use client";

import React from "react";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "password" | "number" | "search";
  disabled?: boolean;
  className?: string;
}

export function Input({
  label,
  value = "",
  onChange,
  placeholder = "",
  type = "text",
  disabled = false,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className={`bpm-input-wrap ${className}`.trim()}>
      {label && (
        <label
          className="bpm-input-label block text-sm font-medium mb-1"
          style={{ color: "var(--bpm-text-primary)" }}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        className="bpm-input w-full px-3 py-2 rounded-lg border text-sm"
        style={{
          borderColor: "var(--bpm-border)",
          background: "var(--bpm-bg-primary)",
          color: "var(--bpm-text-primary)",
        }}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        {...props}
      />
    </div>
  );
}
