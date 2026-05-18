"use client";

import React from "react";

export type ChipVariant = "default" | "primary" | "outline";

export interface ChipProps {
  label: React.ReactNode;
  onDelete?: () => void;
  onClick?: () => void;
  variant?: ChipVariant;
  disabled?: boolean;
  className?: string;
}

/**
 * @component bpm.chip
 * @description Étiquette interactive avec label et bouton de suppression optionnel pour tags ou filtres actifs.
 * @example
 * bpm.chip({ label: "React", variant: "primary", onDelete: () => removeTag("React") })
 *
 * @param {object} props
 * @param {ReactNode} props.label - Texte ou contenu du chip. Obligatoire.
 * @param {function} [props.onDelete] - Callback pour supprimer le chip. Optionnel.
 * @param {function} [props.onClick] - Callback au clic sur le chip. Optionnel.
 * @param {"default"|"primary"|"outline"} [props.variant="default"] - Style du chip. Optionnel.
 * @param {boolean} [props.disabled=false] - Désactive les interactions. Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 *
 * @parent bpm.filterPanel, bpm.form
 * @associated bpm.badge, bpm.tag
 */
export function Chip({
  label,
  onDelete,
  onClick,
  variant = "default",
  disabled = false,
  className = "",
}: ChipProps) {
  const isClickable = Boolean(onClick && !disabled);
  return (
    <span
      className={`bpm-chip inline-flex items-center gap-1 px-2.5 py-1 font-medium ${
        isClickable ? "cursor-pointer" : ""
      } ${disabled ? "opacity-60" : ""} ${className}`.trim()}
      style={{
        background: variant === "primary" ? "var(--bpm-accent)" : "var(--bpm-bg-secondary)",
        color: variant === "primary" ? "var(--bpm-accent-contrast)" : "var(--bpm-text)",
        border: variant === "outline" ? "1px solid var(--bpm-border)" : "none",
        borderRadius: "var(--bpm-radius)",
        fontSize: "var(--bpm-font-size-sm)",
      }}
      role={onDelete ? "button" : undefined}
      onClick={disabled ? undefined : onClick}
    >
      <span className="bpm-chip-label">{label}</span>
      {onDelete && !disabled && (
        <button
          type="button"
          className="bpm-chip-delete ml-0.5 w-4 h-4 flex items-center justify-center rounded-full hover:bg-black/10 border-0 cursor-pointer"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          aria-label="Retirer"
        >
          ×
        </button>
      )}
    </span>
  );
}
