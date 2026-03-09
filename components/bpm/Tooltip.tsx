"use client";

import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";

export type TooltipPlacement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "right";

export interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: TooltipPlacement;
  /** Couleur de fond du tooltip (hex, rgb ou nom CSS). Par défaut : var(--bpm-text-primary). */
  backgroundColor?: string | null;
  /** Couleur du texte du tooltip (hex, rgb ou nom CSS). Par défaut : var(--bpm-bg-primary). */
  textColor?: string | null;
}

/**
 * @component bpm.tooltip
 * @description Info-bulle au survol d'un élément (bouton, icône) pour aide contextuelle.
 * @example
 * bpm.tooltip({ text: "Exporter en PDF", children: <button>Export</button> })
 * @props
 * - text (string) — Texte du tooltip.
 * - children (ReactNode) — Élément déclencheur (bouton, icône).
 * - position (string, optionnel) — Placement (top, bottom, left, right…). Default: 'top'.
 * - backgroundColor (string, optionnel) — Fond du tooltip.
 * - textColor (string, optionnel) — Couleur du texte.
 * @usage Aide sur boutons, explication de champs, raccourcis.
 * @context PARENT: partout. ASSOCIATED: bpm.button, bpm.input. FORBIDDEN: aucun.
 */
export function Tooltip({
  text,
  children,
  position = "top",
  backgroundColor = null,
  textColor = null,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);

  const updatePosition = () => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const gap = 8;
    const tooltipHeight = 32;
    let top = 0;
    let left = rect.left + rect.width / 2;
    if (position.startsWith("top")) {
      top = rect.top - gap - tooltipHeight;
    } else if (position.startsWith("bottom")) {
      top = rect.bottom + gap;
    } else {
      top = rect.top + rect.height / 2 - tooltipHeight / 2;
    }
    if (position.includes("start")) left = rect.left;
    if (position.includes("end")) left = rect.right;
    if (position === "left") left = rect.left - gap;
    if (position === "right") left = rect.right + gap;
    setCoords({ top, left });
  };

  const getTransform = (): string => {
    switch (position) {
      case "top":
      case "bottom":
        return "translate(-50%, 0)";
      case "top-start":
      case "bottom-start":
        return "translate(0, 0)";
      case "top-end":
      case "bottom-end":
        return "translate(-100%, 0)";
      case "left":
        return "translate(-100%, -50%)";
      case "right":
        return "translate(0, -50%)";
      default:
        return "translate(-50%, 0)";
    }
  };

  const show = () => {
    setVisible(true);
    requestAnimationFrame(updatePosition);
  };
  const hide = () => setVisible(false);

  const tooltipEl = visible && text && (
    <div
      className="bpm-tooltip-popover fixed z-[10002] px-3 py-2 rounded text-sm max-w-[380px] min-w-[140px] shadow-lg pointer-events-none"
      style={{
        left: coords.left,
        top: coords.top,
        transform: getTransform(),
        background: backgroundColor ?? "var(--bpm-text-primary)",
        color: textColor ?? "var(--bpm-bg-primary)",
      }}
    >
      {text}
    </div>
  );

  const handleClick = (e: React.MouseEvent) => {
    if (typeof window !== "undefined" && "ontouchstart" in window) {
      e.preventDefault();
      setVisible((v) => !v);
    }
  };

  return (
    <>
      <span
        ref={triggerRef}
        className="bpm-tooltip-container inline"
        tabIndex={0}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onClick={handleClick}
      >
        {children}
      </span>
      {typeof document !== "undefined" && tooltipEl && createPortal(tooltipEl, document.body)}
    </>
  );
}
