"use client";

import React from "react";

export interface PaginationProps {
  /** Page courante (1-based). */
  page: number;
  /** Nombre total de pages. */
  totalPages: number;
  /** Callback au changement de page. Reçoit le numéro de page. */
  onPageChange: (page: number) => void;
  /** Taille de page (optionnel, pour affichage). */
  pageSize?: number;
  /** Nombre total d’éléments (optionnel). */
  totalItems?: number;
  /** Libellé optionnel (ex. "Page 1 sur 5"). */
  label?: string;
  className?: string;
}

/**
 * Pagination réutilisable pour listes et tableaux (page, taille, total).
 */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  pageSize,
  totalItems,
  label,
  className = "",
}: PaginationProps) {
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav className={`bpm-pagination ${className}`} aria-label="Pagination" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      {label && <span className="text-sm" style={{ color: "var(--bpm-text-secondary)", marginRight: 8 }}>{label}</span>}
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrev}
        aria-label="Page précédente"
        style={{
          width: 36,
          height: 36,
          padding: 0,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "var(--bpm-radius)",
          border: "1px solid var(--bpm-border)",
          background: "var(--bpm-bg-primary)",
          color: "var(--bpm-text)",
          cursor: hasPrev ? "pointer" : "not-allowed",
          opacity: hasPrev ? 1 : 0.5,
          fontSize: "var(--bpm-font-size-base)",
          lineHeight: 0,
        }}
      >
        <span style={{ display: "inline-block", lineHeight: 1 }}>←</span>
      </button>
      <span className="text-sm" style={{ color: "var(--bpm-text-primary)" }}>
        Page {page} sur {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNext}
        aria-label="Page suivante"
        style={{
          width: 36,
          height: 36,
          padding: 0,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "var(--bpm-radius)",
          border: "1px solid var(--bpm-border)",
          background: "var(--bpm-bg-primary)",
          color: "var(--bpm-text)",
          cursor: hasNext ? "pointer" : "not-allowed",
          opacity: hasNext ? 1 : 0.5,
          fontSize: "var(--bpm-font-size-base)",
          lineHeight: 0,
        }}
      >
        <span style={{ display: "inline-block", lineHeight: 1 }}>→</span>
      </button>
      {(pageSize != null && totalItems != null) && (
        <span className="text-sm" style={{ color: "var(--bpm-text-secondary)", marginLeft: 8 }}>
          {totalItems} élément{totalItems > 1 ? "s" : ""}
        </span>
      )}
    </nav>
  );
}
