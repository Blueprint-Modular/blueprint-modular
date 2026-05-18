"use client";

import React from "react";

export interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  height?: string | number;
  placeholder?: string;
  className?: string;
}

/**
 * @component bpm.codeEditor
 * @description Éditeur de code simple (textarea monospace) pour saisie ou modification de code.
 * @example
 * bpm.codeEditor({ value: code, onChange: setCode, language: "json", height: 400 })
 *
 * @param {object} props
 * @param {string} props.value - Contenu du code. Obligatoire.
 * @param {function} props.onChange - Callback appelé à chaque modification. Obligatoire.
 * @param {string} [props.language] - Langage (pour référence, pas de coloration). Optionnel.
 * @param {boolean} [props.readOnly=false] - Mode lecture seule. Optionnel.
 * @param {string|number} [props.height=300] - Hauteur de l'éditeur. Optionnel.
 * @param {string} [props.placeholder=""] - Texte d'aide. Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 *
 * @associated bpm.codeBlock, bpm.jsonEditor
 */
export function CodeEditor({
  value,
  onChange,
  readOnly = false,
  height = 300,
  placeholder = "",
  className = "",
}: CodeEditorProps) {
  const h = typeof height === "number" ? `${height}px` : height;

  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      readOnly={readOnly}
      placeholder={placeholder}
      className={className ? `bpm-code-editor ${className}`.trim() : "bpm-code-editor"}
      style={{
        width: "100%",
        height: h,
        padding: 12,
        border: "1px solid var(--bpm-border)",
        borderRadius: "var(--bpm-radius-sm)",
        fontFamily: "ui-monospace, monospace",
        fontSize: "var(--bpm-font-size-base)",
        lineHeight: 1.5,
        color: "var(--bpm-text-primary)",
        background: "var(--bpm-bg-primary)",
        resize: "vertical",
        boxSizing: "border-box",
      }}
    />
  );
}
