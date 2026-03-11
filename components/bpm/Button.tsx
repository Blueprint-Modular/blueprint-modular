"use client";

import React from "react";

export interface ButtonProps {
  /** PARENT: partout — composant universel. INTERDIT: onClick absent sur variant primary. ASSOCIÉ: bpm.modal (déclencheur), bpm.input (submit formulaire), bpm.table (action ligne). */
  /** Contenu du bouton — obligatoire. */
  children: React.ReactNode;
  /** Handler clic. */
  onClick?: () => void;
  /** Style visuel. Default: 'primary'. */
  variant?: "primary" | "secondary" | "outline";
  /** Taille. Default: 'medium'. */
  size?: "small" | "medium" | "large";
  /** Désactive le bouton. */
  disabled?: boolean;
  type?: "button" | "submit";
  /** Bouton pleine largeur. */
  fullWidth?: boolean;
  className?: string;
}

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "medium",
  disabled = false,
  type = "button",
  fullWidth = false,
  className = "",
}: ButtonProps) {
  const isPrimary = variant === "primary";
  const sizeClass = size === "small" ? "px-3 py-2 text-sm" : size === "large" ? "px-6 py-3 text-lg" : "px-4 py-2";
  const minHeight = size === "small" ? 36 : size === "large" ? 48 : 40;

  return (
    <button
      type={type}
      className={`font-medium ${sizeClass} ${fullWidth ? "w-full" : ""} ${className}`}
      style={{
        background: isPrimary ? "var(--bpm-accent)" : "transparent",
        color: isPrimary ? "var(--bpm-accent-contrast)" : "var(--bpm-text)",
        border: variant === "outline" ? "1px solid var(--bpm-border)" : "none",
        borderRadius: "var(--bpm-radius)",
        minHeight,
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "var(--bpm-transition)",
      }}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
