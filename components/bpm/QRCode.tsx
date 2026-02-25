"use client";

import React from "react";
import { QRCodeSVG } from "qrcode.react";

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
      <div className={"bpm-qrcode " + className} style={{ width: size, height: size, background: "var(--bpm-bg-secondary)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--bpm-text-secondary)", fontSize: 11 }}>
        Pas de valeur
      </div>
    );
  }
  return (
    <div className={"bpm-qrcode " + className} style={{ display: "inline-block", padding: 8, background: bgColor, borderRadius: 4 }}>
      <QRCodeSVG value={value} size={size} fgColor={fgColor} bgColor={bgColor} level="M" />
    </div>
  );
}
