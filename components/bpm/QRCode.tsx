"use client";

import React from "react";
import { QRCodeSVG } from "qrcode.react";

/**
 * @component bpm.qrCode
 * @description Génère un QR code SVG à partir d'une valeur texte avec couleurs personnalisables.
 * @example
 * bpm.qrCode({ value: "https://example.com", size: 150, fgColor: "#000" })
 *
 * @param {object} props
 * @param {string} props.value - Texte/URL à encoder. Obligatoire.
 * @param {number} [props.size=128] - Taille en pixels. Optionnel.
 * @param {string} [props.fgColor="var(--bpm-text-primary)"] - Couleur des modules. Optionnel.
 * @param {string} [props.bgColor="var(--bpm-bg-primary)"] - Couleur de fond. Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 *
 * @associated bpm.barcode, bpm.nfcBadge
 */
export interface QRCodeProps {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  className?: string;
}

export function QRCode({ value, size = 128, fgColor = "var(--bpm-text-primary)", bgColor = "var(--bpm-bg-primary)", className = "" }: QRCodeProps) {
  if (!value) {
    return (
      <div className={"bpm-qrcode " + className} style={{ width: size, height: size, background: "var(--bpm-bg-secondary)", borderRadius: "var(--bpm-radius)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--bpm-text-secondary)", fontSize: "var(--bpm-font-size-sm)" }}>
        Pas de valeur
      </div>
    );
  }
  return (
    <div className={"bpm-qrcode " + className} style={{ display: "inline-block", padding: 8, background: bgColor, borderRadius: "var(--bpm-radius)" }}>
      <QRCodeSVG value={value} size={size} fgColor={fgColor} bgColor={bgColor} level="M" />
    </div>
  );
}
