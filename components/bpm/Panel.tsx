"use client";

import React from "react";

export interface PanelProps {
  /** PARENT: page directe | bpm.grid | bpm.tabs (contenu onglet). INTERDIT: bpm.panel imbriqué trop profond (max 2 niveaux). ASSOCIÉ: bpm.title, bpm.metric, bpm.table, bpm.plotlyChart. */
  variant?: "info" | "success" | "warning" | "error";
  title?: string | null;
  icon?: string | null | false;
  /** Couleur inversée : fond sombre, texte blanc (style zone type Executive Summary). */
  inverted?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const variantBorder: Record<string, string> = {
  info: "var(--bpm-accent-cyan)",
  success: "var(--bpm-accent-mint)",
  warning: "#f59e0b",
  error: "#ef4444",
};

/**
 * @component bpm.panel
 * @description Bloc d'information, alerte ou résumé encadré (type notice ou executive summary) pour mettre en avant un message métier.
 * @example
 * bpm.panel({ variant: "warning", title: "TRS sous seuil", children: "Ligne FORM-1 : 68,4%." })
 * @props
 * - variant ('info' | 'success' | 'warning' | 'error', optionnel) — Type visuel. Default: 'info'.
 * - title (ReactNode, optionnel) — Titre du panneau.
 * - icon (string | false, optionnel) — Icône ou false pour masquer.
 * - inverted (boolean, optionnel) — Fond sombre. Default: false.
 * - children (ReactNode, optionnel) — Contenu.
 * - className (string, optionnel) — Classes CSS.
 * @usage Alertes production, notices légales, résumés chiffrés.
 * @context
 * PARENT: page directe | bpm.grid | bpm.tabs (contenu onglet).
 * ASSOCIATED: bpm.title, bpm.metric, bpm.table, bpm.plotlyChart.
 * FORBIDDEN: bpm.panel imbriqué trop profond (max 2 niveaux).
 */
export function Panel({
  variant = "info",
  title = null,
  icon = null,
  inverted = false,
  children,
  className = "",
}: PanelProps) {
  const iconChar = icon ?? (variant === "error" || variant === "warning" ? "!" : "i");
  const borderColor = variantBorder[variant] ?? variantBorder.info;

  return (
    <div
      className={`rounded-lg border-l-4 p-4 ${inverted ? "bpm-panel-inverted" : ""} ${className}`}
      style={{
        background: inverted ? undefined : "var(--bpm-bg-secondary)",
        borderColor,
        color: inverted ? undefined : "var(--bpm-text-primary)",
      }}
      role="region"
      aria-label={title ?? `Panneau ${variant}`}
    >
      {(title || icon !== false) && (
        <div className="flex items-center gap-2 mb-2">
          <span
            className="flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold"
            style={{ background: borderColor, color: "#fff" }}
          >
            {icon ?? iconChar}
          </span>
          {title && <span className="font-semibold">{title}</span>}
        </div>
      )}
      {children && <div>{children}</div>}
    </div>
  );
}
