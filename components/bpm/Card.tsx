"use client";

import React from "react";

export type CardVariant = "default" | "elevated" | "outlined";

export interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  image?: string;
  imageAlt?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  variant?: CardVariant;
  /** Couleur inversée : fond sombre, texte blanc (style zone type Executive Summary). */
  inverted?: boolean;
  className?: string;
}

/**
 * @component bpm.card
 * @description Carte de contenu avec titre, image optionnelle et zone d'actions pour fiches produit ou résumés.
 * @example
 * bpm.card({ title: "Contrat Premium", subtitle: "Renouvellement mars 2025", children: "..." })
 * @props
 * - title (ReactNode, optionnel) — Titre de la carte.
 * - subtitle (ReactNode, optionnel) — Sous-titre.
 * - image (string, optionnel) — URL image en en-tête.
 * - imageAlt (string, optionnel) — Texte alternatif image.
 * - children (ReactNode, optionnel) — Contenu principal.
 * - actions (ReactNode, optionnel) — Boutons ou liens en pied.
 * - variant ('default' | 'elevated' | 'outlined', optionnel) — Style. Default: 'default'.
 * - inverted (boolean, optionnel) — Fond sombre. Default: false.
 * - className (string, optionnel) — Classes CSS.
 * @usage Fiches produit, résumés contrat, cartes dashboard.
 * @context
 * PARENT: bpm.grid | bpm.tabs (contenu onglet) | page directe.
 * ASSOCIATED: bpm.metric, bpm.button, bpm.badge.
 * FORBIDDEN: bpm.card imbriqué trop profond (max 2 niveaux).
 */
export function Card({
  title,
  subtitle,
  image,
  imageAlt = "",
  children,
  actions,
  variant = "default",
  inverted = false,
  className = "",
}: CardProps) {
  return (
    <div
      className={`bpm-card rounded-lg overflow-hidden ${inverted ? "bpm-card-inverted" : ""} ${className}`.trim()}
      style={{
        background: inverted ? undefined : "var(--bpm-surface)",
        border: variant === "outlined" && !inverted ? "1px solid var(--bpm-border)" : "none",
        boxShadow: variant === "elevated" && !inverted ? "0 4px 12px rgba(0,0,0,0.08)" : "none",
      }}
    >
      {image && (
        <div className="bpm-card-image-wrap overflow-hidden">
          <img src={image} alt={imageAlt} className="bpm-card-image w-full h-auto object-cover" />
        </div>
      )}
      {(title != null || subtitle != null || actions != null || children != null) && (
        <div className="bpm-card-body p-4">
          {title != null && (
            <h3 className="bpm-card-title text-lg font-semibold m-0 mb-1" style={!inverted ? { color: "var(--bpm-text-primary)" } : undefined}>
              {title}
            </h3>
          )}
          {subtitle != null && (
            <p className="bpm-card-subtitle text-sm m-0 mb-2" style={!inverted ? { color: "var(--bpm-text-secondary)" } : undefined}>
              {subtitle}
            </p>
          )}
          {children != null && <div className="bpm-card-content">{children}</div>}
          {actions != null && <div className="bpm-card-actions mt-3">{actions}</div>}
        </div>
      )}
    </div>
  );
}
