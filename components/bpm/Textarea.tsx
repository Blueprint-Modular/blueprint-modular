"use client";

import React from "react";

export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange"> {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  /** Couleur inversée : fond sombre, texte blanc (style zone type PJ). */
  inverted?: boolean;
  className?: string;
}

/**
 * @component bpm.textarea
 * @description Champ de saisie multiligne pour commentaires, description, notes métier.
 * @example
 * bpm.textarea({ label: "Commentaire", value: comment, onChange: setComment, rows: 4 })
 * @props
 * - label (string, optionnel) — Libellé au-dessus du champ.
 * - value (string, optionnel) — Valeur contrôlée.
 * - onChange (function, optionnel) — Callback (value: string).
 * - placeholder (string, optionnel) — Texte indicatif.
 * - rows (number, optionnel) — Nombre de lignes visibles. Default: 4.
 * - disabled (boolean, optionnel) — Désactive le champ. Default: false.
 * - inverted (boolean, optionnel) — Fond sombre. Default: false.
 * - className (string, optionnel) — Classes CSS.
 * @usage Commentaire de commande, description produit, notes internes.
 * @context PARENT: bpm.modal | bpm.panel | bpm.card. ASSOCIATED: bpm.input, bpm.button. FORBIDDEN: onChange absent si value contrôlé.
 */
export function Textarea({
  label,
  value = "",
  onChange,
  placeholder = "",
  rows = 4,
  disabled = false,
  inverted = false,
  className = "",
  ...props
}: TextareaProps) {
  return (
    <div className={`bpm-textarea-wrap ${inverted ? "bpm-textarea-inverted" : ""} ${className}`.trim()}>
      {label && (
        <label
          className="bpm-textarea-label block text-sm font-medium mb-1"
          style={!inverted ? { color: "var(--bpm-text-primary)" } : undefined}
        >
          {label}
        </label>
      )}
      <textarea
        className="bpm-textarea w-full px-3 py-2 rounded-lg border text-sm resize-y"
        style={
          inverted
            ? undefined
            : {
                borderColor: "var(--bpm-border)",
                background: "var(--bpm-bg-primary)",
                color: "var(--bpm-text-primary)",
              }
        }
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        onFocus={(e) => {
          e.target.style.outline = "none";
          e.target.style.borderColor = "var(--bpm-accent)";
          e.target.style.boxShadow = "0 0 0 2px var(--bpm-accent-alpha, rgba(0,163,226,0.2))";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "var(--bpm-border)";
          e.target.style.boxShadow = "none";
        }}
        {...props}
      />
    </div>
  );
}
