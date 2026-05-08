"use client";

import React from "react";

/**
 * @component bpm.nfcBadge
 * @description Badge indicateur de statut NFC/scannable avec icône et variantes de couleur.
 * @example
 * bpm.nfcBadge({ label: "Actif", variant: "success" })
 *
 * @param {object} props
 * @param {string} [props.label="Scannable"] - Texte affiché. Optionnel.
 * @param {"default"|"primary"|"success"} [props.variant="default"] - Variante de couleur. Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 *
 * @associated bpm.badge, bpm.qrCode, bpm.barcode
 */
export interface NfcBadgeProps {
  label?: string;
  variant?: "default" | "primary" | "success";
  className?: string;
}

export function NfcBadge({ label = "Scannable", variant = "default", className = "" }: NfcBadgeProps) {
  const style: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 10px",
    borderRadius: "var(--bpm-radius)",
    fontSize: "var(--bpm-font-size-sm)",
    fontWeight: 500,
    background: variant === "primary" ? "var(--bpm-accent)" : variant === "success" ? "var(--bpm-success)" : "var(--bpm-bg-secondary)",
    color: variant === "default" ? "var(--bpm-text)" : "var(--bpm-accent-contrast)",
    border: "1px solid var(--bpm-border)",
  };
  return (
    <span className={"bpm-nfc-badge " + className} style={style} title="Statut (pas de NFC front)">
      <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H4V4h16v16zM18 6H6v2h12V6zm-2 4H8v8h2v-2h2v2h2v-8zm-4 4v-2h2v2h-2z" /></svg>
      {label}
    </span>
  );
}
