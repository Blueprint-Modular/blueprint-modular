"use client";

import React from "react";

/**
 * @component bpm.image
 * @description Affiche une image avec chargement différé et options de dimensionnement/ajustement.
 * @example
 * bpm.image({ src: "/photo.jpg", alt: "Photo de profil", width: 200, fit: "cover" })
 *
 * @param {object} props
 * @param {string} props.src - URL de l'image. Obligatoire.
 * @param {string} props.alt - Texte alternatif pour l'accessibilité. Obligatoire.
 * @param {string} [props.title] - Titre affiché au survol. Optionnel.
 * @param {number|string} [props.width] - Largeur en pixels ou CSS. Optionnel.
 * @param {number|string} [props.height] - Hauteur en pixels ou CSS. Optionnel.
 * @param {"contain"|"cover"|"fill"|"none"} [props.fit="contain"] - Mode d'ajustement object-fit. Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 */
export interface ImageProps {
  src: string;
  alt: string;
  title?: string;
  width?: number | string;
  height?: number | string;
  fit?: "contain" | "cover" | "fill" | "none";
  className?: string;
}

export function Image({
  src,
  alt,
  title,
  width,
  height,
  fit = "contain",
  className = "",
}: ImageProps) {
  const style: React.CSSProperties = {
    maxWidth: "100%",
    objectFit: fit,
  };
  if (width != null) style.width = typeof width === "number" ? `${width}px` : width;
  if (height != null) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <img
      src={src}
      alt={alt}
      title={title}
      className={`bpm-image ${className}`.trim()}
      style={style}
      loading="lazy"
    />
  );
}
