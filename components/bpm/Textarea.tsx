"use client";

import React from "react";

export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange"> {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  className?: string;
}

export function Textarea({
  label,
  value = "",
  onChange,
  placeholder = "",
  rows = 4,
  disabled = false,
  className = "",
  ...props
}: TextareaProps) {
  return (
    <div className={`bpm-textarea-wrap ${className}`.trim()}>
      {label && (
        <label
          className="bpm-textarea-label block text-sm font-medium mb-1"
          style={{ color: "var(--bpm-text-primary)" }}
        >
          {label}
        </label>
      )}
      <textarea
        className="bpm-textarea w-full px-3 py-2 rounded-lg border text-sm resize-y"
        style={{
          borderColor: "var(--bpm-border)",
          background: "var(--bpm-bg-primary)",
          color: "var(--bpm-text-primary)",
        }}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        {...props}
      />
    </div>
  );
}
