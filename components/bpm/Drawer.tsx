"use client";

import React, { useEffect } from "react";

export interface DrawerProps {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  side?: "left" | "right";
  width?: number | string;
  className?: string;
}

/**
 * @component bpm.drawer
 * @description Panneau latéral glissant (gauche ou droite) avec overlay et fermeture par Escape ou clic extérieur.
 * @example
 * bpm.drawer({ open: true, onClose: close, title: "Détails", side: "right", children: <Content /> })
 *
 * @param {object} props
 * @param {ReactNode} props.children - Contenu du drawer. Obligatoire.
 * @param {boolean} props.open - État d'ouverture. Obligatoire.
 * @param {function} props.onClose - Callback de fermeture. Obligatoire.
 * @param {ReactNode} [props.title] - Titre dans l'en-tête. Optionnel.
 * @param {"left"|"right"} [props.side="right"] - Côté d'apparition. Optionnel.
 * @param {number|string} [props.width=360] - Largeur du drawer. Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 *
 * @associated bpm.modal, bpm.panel, bpm.sidebar
 */
export function Drawer({ children, open, onClose, title, side = "right", width = 360, className = "" }: DrawerProps) {
  useEffect(() => {
    if (open) {
      const onEscape = (e: KeyboardEvent) => e.key === "Escape" && onClose();
      document.addEventListener("keydown", onEscape);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", onEscape);
        document.body.style.overflow = "";
      };
    }
  }, [open, onClose]);

  if (!open) return null;

  const w = typeof width === "number" ? width + "px" : width;

  return (
    <>
      <div className={"bpm-drawer-backdrop " + className} style={{ position: "fixed", inset: 0, background: "var(--bpm-overlay-bg)", zIndex: 9998 }} onClick={onClose} aria-hidden />
      <div
        className={"bpm-drawer " + className}
        role="dialog"
        aria-modal="true"
        style={{
          position: "fixed",
          top: 0,
          bottom: 0,
          [side]: 0,
          width: w,
          maxWidth: "100vw",
          background: "var(--bpm-bg-primary)",
          borderLeft: side === "right" ? "1px solid var(--bpm-border)" : "none",
          borderRight: side === "left" ? "1px solid var(--bpm-border)" : "none",
          boxShadow: "var(--bpm-shadow)",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--bpm-border)", flexShrink: 0, fontWeight: 600, fontSize: "var(--bpm-font-size-lg)", color: "var(--bpm-text)" }}>
          {title != null ? (typeof title === "string" ? <span style={{ fontWeight: 600, fontSize: "var(--bpm-font-size-lg)", color: "var(--bpm-text)" }}>{title}</span> : title) : <span />}
          <button type="button" onClick={onClose} aria-label="Fermer" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--bpm-text-secondary)", padding: 4 }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
          </button>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: 16 }}>{children}</div>
      </div>
    </>
  );
}
