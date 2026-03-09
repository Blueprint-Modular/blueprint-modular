"use client";

import React from "react";

export interface CheckboxProps {
  label?: React.ReactNode;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * @component bpm.checkbox
 * @description Case a cocher pour choix binaire (acceptation CGU, option activée).
 * @example
 * bpm.checkbox({ label: "J'accepte les conditions", checked: false, onChange: setAccepted })
 * @props
 * - label (ReactNode, optionnel) — Libelle a cote de la case.
 * - checked (boolean, optionnel) — Etat coché. Default: false.
 * - onChange (function, optionnel) — Callback (checked: boolean).
 * - disabled (boolean, optionnel) — Default: false.
 * - className (string, optionnel) — Classes CSS.
 * @usage CGU, options formulaire, filtres liste.
 * @context PARENT: bpm.modal | bpm.panel | bpm.card. ASSOCIATED: bpm.input, bpm.button. FORBIDDEN: aucun.
 */
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
