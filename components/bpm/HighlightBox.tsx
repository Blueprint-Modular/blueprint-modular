"use client";

import React from "react";
import "./HighlightBox.css";

/**
 * @component bpm.highlightBox
 * @description Bloc de mise en valeur avec barre latérale colorée, numéro, titre et sections RTB/Cible optionnelles.
 * @example
 * bpm.highlightBox({ value: 1, label: "DAILY", title: "Objectif quotidien", rtbPoints: ["Point 1", "Point 2"] })
 *
 * @param {object} props
 * @param {number} props.value - Numéro affiché dans la barre gauche. Obligatoire.
 * @param {string} props.label - Texte sous le numéro (ex: "DAILY"). Obligatoire.
 * @param {string} props.title - Titre principal du contenu. Obligatoire.
 * @param {string} [props.momentDescription] - Description "Moment" affichée en italique. Optionnel.
 * @param {string[]} [props.rtbPoints] - Points RTB séparés par "·". Optionnel.
 * @param {string|string[]} [props.targetPoints] - Points Cible (chaîne ou liste). Optionnel.
 * @param {string} [props.barColor="#212121"] - Couleur de la barre latérale. Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 */
export interface HighlightBoxProps {
  /** Numéro affiché dans la barre gauche (ex. 1) */
  value: number;
  /** Texte sous le numéro dans la barre (ex. "DAILY") */
  label: string;
  /** Titre principal du contenu */
  title: string;
  /** Description "Moment" (affichée en italique, gris) */
  momentDescription?: string | null;
  /** Points RTB (affichés séparés par ·) */
  rtbPoints?: string[] | null;
  /** Points Cible (chaîne ou liste) */
  targetPoints?: string | string[] | null;
  /** Couleur de la barre latérale (hex, rgb ou nom CSS). Par défaut : noir (#212121). */
  barColor?: string | null;
  className?: string;
}

export function HighlightBox({
  value,
  label,
  title,
  momentDescription,
  rtbPoints,
  targetPoints,
  barColor = null,
  className = "",
}: HighlightBoxProps) {
  const rtbText =
    Array.isArray(rtbPoints) && rtbPoints.length > 0
      ? rtbPoints.join(" · ")
      : null;
  const targetText =
    targetPoints == null
      ? null
      : Array.isArray(targetPoints)
        ? targetPoints.join(", ")
        : targetPoints;

  const barStyle = barColor ? { background: barColor } : undefined;

  return (
    <div
      className={`bpm-highlight-box ${className}`.trim()}
      role="article"
      aria-label={title}
    >
      <div className="bpm-highlight-box-bar" style={barStyle}>
        <span className="bpm-highlight-box-value">{value}</span>
        <span className="bpm-highlight-box-label">{label}</span>
      </div>
      <div className="bpm-highlight-box-content">
        <h3 className="bpm-highlight-box-title">{title}</h3>
        {momentDescription != null && momentDescription !== "" && (
          <div className="bpm-highlight-box-block">
            <span className="bpm-highlight-box-block-label">Moment :</span>{" "}
            <span className="bpm-highlight-box-moment-text">{momentDescription}</span>
          </div>
        )}
        {rtbText && (
          <div className="bpm-highlight-box-block">
            <span className="bpm-highlight-box-block-label">RTB :</span>{" "}
            <span className="bpm-highlight-box-block-text">{rtbText}</span>
          </div>
        )}
        {targetText && (
          <div className="bpm-highlight-box-block">
            <span className="bpm-highlight-box-block-label">Cible :</span>{" "}
            <span className="bpm-highlight-box-block-text">{targetText}</span>
          </div>
        )}
      </div>
    </div>
  );
}
