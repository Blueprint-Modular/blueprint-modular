"use client";

import React from "react";

export interface EmptyStateProps {
  title?: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

/**
 * @component bpm.emptyState
 * @description État vide centré avec titre, description et action (bouton) quand une liste ou recherche n'a aucun résultat.
 * @example
 * bpm.emptyState({ title: "Aucune commande", description: "Créez votre première commande.", action: <Button>Nouvelle commande</Button> })
 * @props
 * - title (string, optionnel) — Titre. Default: 'Aucune donnée'.
 * - description (ReactNode, optionnel) — Texte explicatif.
 * - icon (ReactNode, optionnel) — Icône au-dessus du titre.
 * - action (ReactNode, optionnel) — Bouton ou lien d'action.
 * - className (string, optionnel) — Classes CSS.
 * @usage Liste vide, recherche sans résultat, premier usage.
 * @context PARENT: bpm.panel | bpm.card | bpm.table (contenu vide). ASSOCIATED: bpm.button, bpm.input. FORBIDDEN: aucun.
 */
export function EmptyState({
  title = "Aucune donnée",
  description,
  icon,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`bpm-emptystate text-center py-8 px-4 ${className}`.trim()}
      style={{ color: "var(--bpm-text-secondary)" }}
    >
      {icon != null && <div className="bpm-emptystate-icon mb-3 flex justify-center">{icon}</div>}
      <h3 className="bpm-emptystate-title text-lg font-semibold m-0 mb-1" style={{ color: "var(--bpm-text-primary)" }}>
        {title}
      </h3>
      {description != null && <p className="bpm-emptystate-desc text-sm m-0 mb-3">{description}</p>}
      {action != null && <div className="bpm-emptystate-action">{action}</div>}
    </div>
  );
}
