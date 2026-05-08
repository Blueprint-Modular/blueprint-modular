"use client";

import React from "react";

/**
 * @component bpm.pdfViewer
 * @description Visionneuse PDF embarquée en iframe avec dimensions personnalisables.
 * @example
 * bpm.pdfViewer({ src: "/documents/rapport.pdf", title: "Rapport annuel", height: 600 })
 *
 * @param {object} props
 * @param {string} props.src - URL du fichier PDF. Obligatoire.
 * @param {string} [props.title="PDF"] - Titre pour l'accessibilité. Optionnel.
 * @param {number|string} [props.width="100%"] - Largeur. Optionnel.
 * @param {number|string} [props.height="600px"] - Hauteur. Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 *
 * @associated bpm.filePreview, bpm.fileUploader
 */
export interface PdfViewerProps {
  src: string;
  title?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
}

export function PdfViewer({ src, title, width = "100%", height = "600px", className = "" }: PdfViewerProps) {
  const w = typeof width === "number" ? `${width}px` : width;
  const h = typeof height === "number" ? `${height}px` : height;

  return (
    <iframe
      src={src}
      title={title ?? "PDF"}
      className={`bpm-pdf-viewer border-0 rounded-lg ${className}`.trim()}
      style={{
        width: w,
        height: h,
        background: "var(--bpm-bg-secondary)",
      }}
    />
  );
}
