"use client";

import React from "react";

/**
 * @component bpm.map
 * @description Carte OpenStreetMap embarquée en iframe. Utiliser MapView pour des fonctionnalités interactives.
 * @example
 * bpm.map({ lat: 48.8566, lng: 2.3522, height: 300 })
 *
 * @param {object} props
 * @param {string} [props.iframeSrc] - URL iframe personnalisée. Optionnel.
 * @param {number} [props.lat] - Latitude du centre. Optionnel.
 * @param {number} [props.lng] - Longitude du centre. Optionnel.
 * @param {number|string} [props.width="100%"] - Largeur. Optionnel.
 * @param {number|string} [props.height=400] - Hauteur. Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 *
 * @associated bpm.mapView, bpm.gps
 */
export interface MapProps {
  iframeSrc?: string;
  lat?: number;
  lng?: number;
  width?: number | string;
  height?: number | string;
  className?: string;
}

export function Map(p: MapProps) {
  const { iframeSrc, lat, lng, width = "100%", height = 400, className = "" } = p;
  const w = typeof width === "number" ? width + "px" : width;
  const h = typeof height === "number" ? height + "px" : height;
  const src = iframeSrc ?? (lat != null && lng != null
    ? "https://www.openstreetmap.org/export/embed.html?bbox=" + (lng - 0.01) + "," + (lat - 0.01) + "," + (lng + 0.01) + "," + (lat + 0.01) + "&layer=mapnik"
    : "https://www.openstreetmap.org/export/embed.html?bbox=-0.2%2C43.5%2C0.2%2C43.7&layer=mapnik");

  return (
    <iframe
      src={src}
      title="Carte"
      className={"bpm-map border-0 rounded-lg " + className}
      style={{ width: w, height: h, background: "var(--bpm-bg-secondary)" }}
    />
  );
}
