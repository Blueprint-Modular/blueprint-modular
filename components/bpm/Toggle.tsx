"use client";

import React from "react";

export interface ToggleProps {
  label?: React.ReactNode;
  value?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * @component bpm.toggle
 * @description Interrupteur on/off pour activer ou désactiver une option (notifications, mode maintenance).
 * @example
 * bpm.toggle({ label: "Notifications email", value: true, onChange: (v) => setNotif(v) })
 * @props
 * - label (ReactNode, optionnel) — Libellé à côté du toggle.
 * - value (boolean, optionnel) — État coché. Default: false.
 * - onChange (function, optionnel) — Callback (checked: boolean).
 * - disabled (boolean, optionnel) — Désactive le toggle. Default: false.
 * - className (string, optionnel) — Classes CSS.
 * @usage Paramètres utilisateur, options de module, activation de fonctionnalité.
 * @context PARENT: bpm.panel | bpm.modal | bpm.card. ASSOCIATED: bpm.input, bpm.button. FORBIDDEN: aucun.
 */
export function Toggle({
  label,
  value = false,
  onChange,
  disabled = false,
  className = "",
}: ToggleProps) {
  return (
    <label
      className={`bpm-toggle-wrap inline-flex items-center gap-2 cursor-pointer select-none ${
        disabled ? "opacity-60 cursor-not-allowed" : ""
      } ${className}`.trim()}
    >
      <span
        className="bpm-toggle-track relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors"
        style={{
          backgroundColor: value ? "var(--bpm-accent)" : "var(--bpm-border)",
        }}
      >
        <input
          type="checkbox"
          className="sr-only"
          role="switch"
          checked={value}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
        />
        <span
          className="bpm-toggle-thumb pointer-events-none absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
          style={{ transform: value ? "translateX(1.25rem)" : "translateX(0)" }}
        />
      </span>
      {label != null && (
        <span className="bpm-toggle-label text-sm" style={{ color: "var(--bpm-text-primary)" }}>
          {label}
        </span>
      )}
    </label>
  );
}
