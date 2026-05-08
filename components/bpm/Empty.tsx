"use client";

import React from "react";

export interface EmptyProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * @component bpm.empty
 * @description Conteneur vide minimal servant de placeholder ou espaceur dans une grille/layout.
 * @example
 * bpm.empty({ children: "Texte optionnel" })
 *
 * @param {object} props
 * @param {ReactNode} [props.children] - Contenu optionnel. Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 * @param {object} [props.style={}] - Styles inline. Optionnel.
 *
 * @associated bpm.column, bpm.grid
 */
export function Empty({ children, className = "", style = {} }: EmptyProps) {
  return (
    <div
      className={"bpm-empty min-h-[1rem] " + className}
      style={{
        width: "100%",
        minWidth: 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
