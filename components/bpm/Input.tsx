"use client";

import React, { useId } from "react";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  /** Label affiché au-dessus du champ. */
  label?: string;
  /** Valeur contrôlée. */
  value?: string;
  /** Callback — reçoit la valeur string, pas un Event. Ex: (v) => setValue(v) */
  onChange?: (value: string) => void;
  placeholder?: string;
  /** Type HTML. Default: 'text'. */
  type?: "text" | "email" | "password" | "number" | "search" | "date";
  /** Désactive le champ. */
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
  id: idProp,
  ...props
}: InputProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  return (
    <div className={`bpm-input-wrap ${className}`.trim()}>
      {label && (
        <label
          htmlFor={id}
          className="bpm-input-label block text-sm font-medium mb-1"
          style={{ color: "var(--bpm-text-primary)" }}
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className="bpm-input w-full px-3 py-2 rounded-lg border text-sm min-h-[44px]"
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
