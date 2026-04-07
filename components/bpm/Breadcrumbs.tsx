"use client";

import React, { useMemo } from "react";

export interface BreadcrumbsItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbsProps {
  items: BreadcrumbsItem[];
  separator?: React.ReactNode;
  maxItems?: number;
  className?: string;
}

/**
 * Fil d’Ariane avec séparateur personnalisable et réduction si trop d’entrées.
 */
export function Breadcrumbs({
  items,
  separator = "/",
  maxItems = 8,
  className = "",
}: BreadcrumbsProps) {
  const renderedItems = useMemo(() => {
    if (items.length <= maxItems) return items;
    const first = items[0];
    if (!first) return items;
    const keepTail = Math.max(1, maxItems - 2);
    const tail = items.slice(-keepTail);
    return [first, { label: "…" } as BreadcrumbsItem, ...tail];
  }, [items, maxItems]);

  const linkStyle: React.CSSProperties = {
    color: "var(--bpm-accent)",
    textDecoration: "none",
    background: "none",
    border: "none",
    padding: 0,
    font: "inherit",
    cursor: "pointer",
  };

  return (
    <nav className={className} aria-label="Fil d'Ariane" style={{ fontSize: 13 }}>
      <ol style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, listStyle: "none", margin: 0, padding: 0 }}>
        {renderedItems.map((item, i) => {
          const isLast = i === renderedItems.length - 1;
          const isEllipsis = item.label === "…";
          return (
            <li key={`${i}-${item.label}`} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              {i > 0 ? (
                <span aria-hidden style={{ color: "var(--bpm-text-secondary)" }}>
                  {separator}
                </span>
              ) : null}
              {isEllipsis ? (
                <span style={{ color: "var(--bpm-text-secondary)", padding: "0 2px" }}>…</span>
              ) : item.href != null && !isLast ? (
                <a href={item.href} style={linkStyle}>
                  {item.label}
                </a>
              ) : item.onClick != null && !isLast ? (
                <button type="button" onClick={item.onClick} style={linkStyle}>
                  {item.label}
                </button>
              ) : (
                <span aria-current={isLast ? "page" : undefined} style={{ color: "var(--bpm-text-primary)" }}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
