"use client";

import React, { useId } from "react";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  /** PARENT: bpm.modal (formulaire) | bpm.panel | bpm.card. INTERDIT: onChange absent sur champ contrôlé. ASSOCIÉ: bpm.button (submit), bpm.selectbox (filtres), bpm.modal. */
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
  const { style: propsStyle, ...restProps } = props;
  const inputStyle: React.CSSProperties = {
    borderColor: "var(--bpm-border)",
    background: "var(--bpm-bg-primary)",
    color: "var(--bpm-text)",
    borderRadius: "var(--bpm-radius)",
    fontSize: "var(--bpm-font-size-base)",
    ...propsStyle,
  };
  return (
    <div className={`bpm-input-wrap ${className}`.trim()}>
      {label && (
        <label
          htmlFor={id}
          className="bpm-input-label block text-sm font-medium mb-1"
          style={{ color: "var(--bpm-text)", fontSize: "var(--bpm-font-size-base)" }}
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className="bpm-input w-full px-3 py-2 border min-h-[40px]"
        style={inputStyle}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={(e) => {
          e.target.style.outline = "none";
          e.target.style.borderColor = "var(--bpm-accent)";
          e.target.style.boxShadow = "var(--bpm-focus-ring)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "var(--bpm-border)";
          e.target.style.boxShadow = "none";
        }}
        {...restProps}
      />
    </div>
  );
}
