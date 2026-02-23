"use client";

import React from "react";
import "./HighlightBox.css";

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
  className?: string;
}

export function HighlightBox({
  value,
  label,
  title,
  momentDescription,
  rtbPoints,
  targetPoints,
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

  return (
    <div
      className={`bpm-highlight-box ${className}`.trim()}
      role="article"
      aria-label={title}
    >
      <div className="bpm-highlight-box-bar">
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
