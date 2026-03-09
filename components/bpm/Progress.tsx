"use client";

import React from "react";

export interface ProgressProps {
  value?: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
}

/**
 * @component bpm.progress
 * @description Barre de progression (value/max) pour avancement de tâche ou objectif (ex. TRS cible).
 * @example
 * bpm.progress({ value: 74, max: 100, label: "TRS cible 80%", showValue: true })
 * @props
 * - value (number, optionnel) — Valeur actuelle. Default: 0.
 * - max (number, optionnel) — Valeur max. Default: 1.
 * - label (string, optionnel) — Libelle au-dessus.
 * - showValue (boolean, optionnel) — Afficher le pourcentage. Default: true.
 * - className (string, optionnel) — Classes CSS.
 * @usage Avancement commande, TRS ligne, objectif commercial.
 * @context PARENT: bpm.panel | bpm.card | bpm.tabs. ASSOCIATED: bpm.metric, bpm.slider. FORBIDDEN: aucun.
 */
export function Progress({
  value = 0,
  max = 1,
  label,
  showValue = true,
  className = "",
}: ProgressProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className={`bpm-progress-wrap ${className}`.trim()}>
      {(label != null || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label != null && (
            <span className="text-sm" style={{ color: "var(--bpm-text-primary)" }}>{label}</span>
          )}
          {showValue && (
            <span className="text-sm tabular-nums" style={{ color: "var(--bpm-text-secondary)" }}>
              {Math.round(pct)} %
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={max > 0 ? value : undefined}
        aria-valuemin={0}
        aria-valuemax={max}
        className="bpm-progress-track h-2 rounded-full overflow-hidden"
        style={{ background: "var(--bpm-bg-secondary)" }}
      >
        <div
          className="bpm-progress-fill h-full rounded-full transition-[width]"
          style={{ width: `${pct}%`, background: "var(--bpm-accent)" }}
        />
      </div>
    </div>
  );
}
