"use client";

import React from "react";

export interface SliderProps {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * @component bpm.slider
 * @description Curseur de saisie numerique (min-max) pour volume, pourcentage, seuil.
 * @example
 * bpm.slider({ label: "Volume", value: 70, min: 0, max: 100, onChange: setVolume })
 * @props
 * - value (number, optionnel) — Valeur courante.
 * - min (number, optionnel) — Minimum. Default: 0.
 * - max (number, optionnel) — Maximum. Default: 100.
 * - step (number, optionnel) — Pas. Default: 1.
 * - onChange (function, optionnel) — Callback (value: number).
 * - label (string, optionnel) — Libelle au-dessus.
 * - disabled (boolean, optionnel) — Default: false.
 * - className (string, optionnel) — Classes CSS.
 * @usage Parametres volume, seuil TRS, pourcentage objectif.
 * @context PARENT: bpm.panel | bpm.modal | bpm.card. ASSOCIATED: bpm.input, bpm.progress. FORBIDDEN: aucun.
 */
export function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  label,
  disabled = false,
  className = "",
}: SliderProps) {
  const v = value ?? min;
  return (
    <div className={`bpm-slider-wrap ${className}`.trim()}>
      {label && (
        <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
          {label}
        </label>
      )}
      <div className="flex items-center gap-3">
        <input
          type="range"
          className="bpm-slider flex-1 accent-[var(--bpm-accent)]"
          min={min}
          max={max}
          step={step}
          value={v}
          onChange={(e) => onChange?.(parseFloat(e.target.value))}
          disabled={disabled}
        />
        <span className="bpm-slider-value text-sm tabular-nums w-8" style={{ color: "var(--bpm-text-secondary)" }}>
          {v}
        </span>
      </div>
    </div>
  );
}
