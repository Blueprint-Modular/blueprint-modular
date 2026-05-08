"use client";

import React from "react";
import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  separator?: string;
  className?: string;
}

/**
 * @component bpm.breadcrumb
 * @description Fil d'Ariane pour navigation hiérarchique avec liens cliquables.
 * @example
 * bpm.breadcrumb({ items: [{ label: "Accueil", href: "/" }, { label: "Produits" }] })
 *
 * @param {object} props
 * @param {BreadcrumbItem[]} [props.items=[]] - Liste des éléments {label, href}. Optionnel.
 * @param {string} [props.separator="›"] - Séparateur entre éléments. Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 *
 * @parent bpm.pageHeader, bpm.navbar
 * @associated bpm.breadcrumbs, bpm.tabs
 */
export function Breadcrumb({
  items = [],
  separator = "›",
  className = "",
}: BreadcrumbProps) {
  return (
    <nav className={`bpm-breadcrumb ${className}`.trim()} aria-label="Fil d'Ariane">
      <ol className="flex flex-wrap items-center gap-1 list-none m-0 p-0 text-sm">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && <span className="opacity-60" aria-hidden>{separator}</span>}
              {item.href != null && !isLast ? (
                <Link href={item.href} className="underline" style={{ color: "var(--bpm-accent)" }}>
                  {item.label}
                </Link>
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
