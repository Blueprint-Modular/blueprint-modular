"use client";

import React from "react";
import Link from "next/link";

/**
 * @component bpm.topNav
 * @description Barre de navigation horizontale avec titre/logo et liens/boutons.
 * @example
 * bpm.topNav({ title: "Mon App", titleHref: "/", items: [{ label: "Accueil", href: "/" }, { label: "Aide", onClick: showHelp }] })
 *
 * @param {object} props
 * @param {React.ReactNode} [props.title] - Titre ou logo. Optionnel.
 * @param {string} [props.titleHref="#"] - Lien du titre. Optionnel.
 * @param {TopNavItem[]} [props.items=[]] - Éléments de navigation (label, href?, onClick?). Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 *
 * @associated bpm.pageLayout, bpm.sidebar, bpm.breadcrumb
 */
export interface TopNavItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface TopNavProps {
  title?: React.ReactNode;
  titleHref?: string;
  items?: TopNavItem[];
  className?: string;
}

export function TopNav({ title, titleHref = "#", items = [], className = "" }: TopNavProps) {
  return (
    <nav
      className={"bpm-topnav flex items-center justify-between gap-4 px-4 py-3 border-b " + className}
      style={{ background: "var(--bpm-bg-primary)", borderColor: "var(--bpm-border)" }}
      role="navigation"
    >
      <div className="flex items-center gap-6">
        {title != null && (
          titleHref ? (
            <Link href={titleHref} className="font-semibold no-underline" style={{ color: "var(--bpm-text-primary)" }}>
              {title}
            </Link>
          ) : (
            <span className="font-semibold" style={{ color: "var(--bpm-text-primary)" }}>{title}</span>
          )
        )}
        <ul className="flex items-center gap-1 list-none m-0 p-0">
          {items.map((item, i) => (
            <li key={i}>
              {item.href != null ? (
                <Link href={item.href} className="px-3 py-2 rounded-lg text-sm no-underline" style={{ color: "var(--bpm-text-primary)" }}>
                  {item.label}
                </Link>
              ) : (
                <button type="button" onClick={item.onClick} className="px-3 py-2 rounded-lg text-sm border-0 cursor-pointer" style={{ background: "transparent", color: "var(--bpm-text-primary)" }}>
                  {item.label}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
