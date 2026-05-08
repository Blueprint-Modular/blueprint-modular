"use client";

import React, { useState, useEffect } from "react";

export interface ColorPickerProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  help?: string | null;
  disabled?: boolean;
}

/**
 * @component bpm.colorPicker
 * @description Sélecteur de couleur avec aperçu et affichage du code hexadécimal.
 * @example
 * bpm.colorPicker({ label: "Couleur principale", value: "#00a3e2", onChange: setColor })
 *
 * @param {object} props
 * @param {string} [props.label] - Libellé du champ. Optionnel.
 * @param {string} [props.value="#000000"] - Valeur couleur hexadécimale. Optionnel.
 * @param {function} [props.onChange] - Callback appelé avec la nouvelle couleur. Optionnel.
 * @param {string} [props.help] - Texte d'aide affiché en tooltip. Optionnel.
 * @param {boolean} [props.disabled=false] - Désactive le sélecteur. Optionnel.
 *
 * @parent bpm.form
 * @associated bpm.input, bpm.select
 */
export function ColorPicker({
  label,
  value = "#000000",
  onChange,
  help = null,
  disabled = false,
}: ColorPickerProps) {
  const [color, setColor] = useState(value);
  useEffect(() => {
    if (value != null && /^#[0-9A-Fa-f]{6}$/.test(String(value).trim())) setColor(String(value).trim());
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setColor(v);
    onChange?.(v);
  };

  return (
    <div className={`bpm-color-picker-container ${disabled ? "opacity-60" : ""}`}>
      {label && (
        <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
          {label}
          {help && <span className="ml-1" title={help}>?</span>}
        </label>
      )}
      <div className="flex items-center gap-2">
        <input
          type="color"
          className="w-10 h-10 rounded border cursor-pointer"
          style={{ borderColor: "var(--bpm-border)" }}
          value={color}
          onChange={handleChange}
          disabled={disabled}
        />
        <span className="text-sm font-mono" style={{ color: "var(--bpm-text-secondary)" }}>{color}</span>
      </div>
    </div>
  );
}
