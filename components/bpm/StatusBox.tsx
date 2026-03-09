"use client";

import React, { useState } from "react";
import { Spinner } from "./Spinner";

export interface StatusBoxProps {
  label: string;
  state?: "running" | "complete" | "error";
  children?: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

/**
 * @component bpm.statusBox
 * @description Affiche le statut d'une opération ou d'un service (en cours, terminé, erreur) avec zone dépliable pour détails.
 * @example
 * bpm.statusBox({ label: "Synchronisation CRM", state: "complete", defaultExpanded: false })
 * @props
 * - label (string) — Libellé du statut affiché (ex. "Connecté", "Synchronisation en cours").
 * - state ('running' | 'complete' | 'error', optionnel) — État affiché. Default: 'running'.
 * - children (ReactNode, optionnel) — Contenu dépliable sous le bandeau.
 * - defaultExpanded (boolean, optionnel) — Ouvrir la zone dépliable au montage. Default: true.
 * - className (string, optionnel) — Classes CSS additionnelles.
 * @usage Indicateur de statut pour tableaux de bord, synchronisation données, connexion API.
 * @context
 * PARENT: bpm.panel | bpm.card | page directe.
 * ASSOCIATED: bpm.metric, bpm.badge, bpm.spinner.
 * FORBIDDEN: aucun.
 */
export function StatusBox(p: StatusBoxProps) {
  const { label, state = "running", children, defaultExpanded = true, className = "" } = p;
  const [expanded, setExpanded] = useState(defaultExpanded);
  const icon = state === "running" ? <Spinner size="small" neutral /> : state === "complete" ? "\u2713" : "x";
  const iconColor = state === "running" ? "var(--bpm-text-secondary)" : state === "complete" ? "var(--bpm-accent-mint)" : "var(--bpm-accent)";
  return (
    <div className={"bpm-status-box rounded-lg border " + className} style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)" }}>
      <button type="button" onClick={() => setExpanded((e) => !e)} className="w-full flex items-center gap-2 px-4 py-3 text-left" style={{ color: "var(--bpm-text-primary)" }}>
        <span style={{ color: iconColor }}>{icon}</span><span className="font-medium">{label}</span><span className="ml-auto text-sm" style={{ color: "var(--bpm-text-secondary)" }}>{expanded ? "\u2193" : "\u2192"}</span>
      </button>
      {expanded && children && <div className="px-4 pb-3 pt-0 border-t" style={{ borderColor: "var(--bpm-border)" }}>{children}</div>}
    </div>
  );
}
