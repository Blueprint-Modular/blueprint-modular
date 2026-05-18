"use client";

import React from "react";

/**
 * @component bpm.scrollContainer
 * @description Conteneur avec scroll vertical, horizontal ou bidirectionnel et option pour masquer la scrollbar.
 * @example
 * bpm.scrollContainer({ children: <Content />, height: 400, direction: "vertical", hideScrollbar: true })
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Contenu scrollable. Obligatoire.
 * @param {string|number} [props.height="100%"] - Hauteur du conteneur. Optionnel.
 * @param {string|number} [props.maxHeight] - Hauteur maximale. Optionnel.
 * @param {"vertical"|"horizontal"|"both"} [props.direction="vertical"] - Direction du scroll. Optionnel.
 * @param {boolean} [props.hideScrollbar=false] - Masque la scrollbar visuellement. Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 *
 * @parent bpm.panel, bpm.card
 */
export interface ScrollContainerProps {
  children: React.ReactNode;
  /** Hauteur du conteneur (défaut '100%'). */
  height?: string | number;
  /** Hauteur max pour limiter le scroll. */
  maxHeight?: string | number;
  /** Direction du scroll (défaut 'vertical'). */
  direction?: "vertical" | "horizontal" | "both";
  /** Masquer la scrollbar visuelle (défaut false). */
  hideScrollbar?: boolean;
  className?: string;
}

const normalizeSize = (v: string | number | undefined): string | undefined => {
  if (v === undefined) return undefined;
  return typeof v === "number" ? `${v}px` : v;
};

export function ScrollContainer({
  children,
  height = "100%",
  maxHeight,
  direction = "vertical",
  hideScrollbar = false,
  className = "",
}: ScrollContainerProps) {
  const h = normalizeSize(height);
  const mh = normalizeSize(maxHeight);
  const overflowY = direction === "horizontal" ? "hidden" : "auto";
  const overflowX = direction === "vertical" ? "hidden" : "auto";
  const overflow = direction === "both" ? "auto" : undefined;

  const baseClass = "bpm-scroll-container" + (hideScrollbar ? " bpm-scroll-container-hide-sb" : "");

  return (
    <div
      className={className ? `${baseClass} ${className}`.trim() : baseClass.trim()}
      style={{
        height: h,
        maxHeight: mh ?? (direction === "horizontal" ? "none" : undefined),
        overflow: overflow ?? undefined,
        overflowX: overflow ? undefined : overflowX,
        overflowY: overflow ? undefined : overflowY,
        scrollbarWidth: hideScrollbar ? "none" : undefined,
        msOverflowStyle: hideScrollbar ? "none" : undefined,
      }}
    >
      {hideScrollbar && (
        <style>{`.bpm-scroll-container-hide-sb::-webkit-scrollbar { display: none; }`}</style>
      )}
      {children}
    </div>
  );
}
