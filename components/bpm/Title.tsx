"use client";

import React from "react";

const LEVEL_STYLES: Record<1 | 2 | 3 | 4, { fontSize: string; fontWeight: number }> = {
  1: { fontSize: "1.875rem", fontWeight: 700 },
  2: { fontSize: "1.5rem", fontWeight: 600 },
  3: { fontSize: "1.25rem", fontWeight: 600 },
  4: { fontSize: "1.125rem", fontWeight: 600 },
};

export interface TitleProps extends Omit<React.HTMLAttributes<HTMLHeadingElement>, "color"> {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4;
  /** Taille de police (ex. "1.5rem", "24px"). Surcharge le défaut du niveau. */
  size?: string | null;
  /** Gras : true = 700, false = 400, ou nombre (ex. 600). Surcharge le défaut du niveau. */
  bold?: boolean | number | null;
  /** Couleur du texte (ex. "var(--bpm-text-primary)", "#333"). Surcharge la couleur par défaut. */
  color?: string | null;
  /** Barre verticale sombre à gauche du titre (comme en-tête de section). */
  bar?: boolean;
  /** Couleur de la barre gauche (hex, rgb ou nom CSS). Ignoré si bar=false. */
  barColor?: string | null;
  /** Couleur inversée : fond sombre, texte blanc (style badge / scénario). */
  inverted?: boolean;
  /** Couleur de fond quand inverted=true (hex, rgb ou nom CSS). Par défaut : #1d1d1f. */
  invertedBackground?: string | null;
  /** Optional logo URL (e.g. from localStorage). Shown only when level === 1. */
  logoUrl?: string | null;
  onLogoClick?: () => void;
}

/**
 * @component bpm.title
 * @description Titre de page ou de section avec niveaux 1–4 pour structurer rapports et tableaux de bord.
 * @example
 * bpm.title({ children: "Dashboard Production", level: 1 })
 * @props
 * - children (ReactNode) — Texte du titre.
 * - level (1 | 2 | 3 | 4, optionnel) — Niveau hiérarchique. Default: 1.
 * - size (string, optionnel) — Surcharge taille (ex. "1.5rem").
 * - bold (boolean | number, optionnel) — Gras.
 * - color (string, optionnel) — Couleur texte.
 * - bar (boolean, optionnel) — Barre verticale à gauche. Default: false.
 * - barColor (string, optionnel) — Couleur de la barre.
 * - inverted (boolean, optionnel) — Fond sombre. Default: false.
 * - logoUrl (string, optionnel) — URL logo (level 1).
 * - onLogoClick (function, optionnel) — Clic sur le logo.
 * - className, style (optionnel) — Reste des props.
 * @usage En-têtes de page, titres de section, rapports.
 * @context PARENT: page directe | bpm.panel | bpm.tabs. ASSOCIATED: bpm.metric, bpm.table. FORBIDDEN: aucun.
 */
export function Title({
  children,
  level = 1,
  size: sizeProp = null,
  bold: boldProp = null,
  color: colorProp = null,
  bar = false,
  barColor: barColorProp = null,
  inverted = false,
  invertedBackground: invertedBgProp = null,
  logoUrl = null,
  onLogoClick,
  className = "",
  style = {},
  ...props
}: TitleProps) {
  const lvl = Math.min(Math.max(level, 1), 4) as 1 | 2 | 3 | 4;
  const showLogo = level === 1 && logoUrl;
  const base = LEVEL_STYLES[lvl];
  const fontSize = sizeProp ?? base.fontSize;
  const fontWeight =
    boldProp === null || boldProp === undefined
      ? base.fontWeight
      : typeof boldProp === "boolean"
        ? boldProp ? 700 : 400
        : boldProp;
  const color = inverted ? "#fff" : (colorProp ?? "var(--bpm-text-primary)");

  const content = (
    <>
      {showLogo && (
        <img
          src={logoUrl!}
          alt=""
          className="bpm-title-logo h-8 w-auto object-contain"
          onClick={onLogoClick}
          style={onLogoClick ? { cursor: "pointer" } : undefined}
        />
      )}
      <span className="bpm-title-text" style={{ color }}>
        {children}
      </span>
    </>
  );

  const classNames = `bpm-title bpm-title-level-${lvl} flex items-center gap-2 flex-wrap ${bar ? "bpm-title-with-bar" : ""} ${inverted ? "bpm-title-inverted" : ""} ${className}`.trim();
  const mergedStyle: React.CSSProperties = { fontSize, fontWeight, ...style };
  if (bar && barColorProp) (mergedStyle as Record<string, string>)["--bpm-title-bar-color"] = barColorProp;
  if (inverted && invertedBgProp) (mergedStyle as Record<string, string>)["--bpm-title-inverted-bg"] = invertedBgProp;

  if (lvl === 1) return <h1 className={classNames} style={mergedStyle} {...props}>{content}</h1>;
  if (lvl === 2) return <h2 className={classNames} style={mergedStyle} {...props}>{content}</h2>;
  if (lvl === 3) return <h3 className={classNames} style={mergedStyle} {...props}>{content}</h3>;
  return <h4 className={classNames} style={mergedStyle} {...props}>{content}</h4>;
}

export function Title1(props: Omit<TitleProps, "level">) {
  return <Title level={1} {...props} />;
}
export function Title2(props: Omit<TitleProps, "level">) {
  return <Title level={2} {...props} />;
}
export function Title3(props: Omit<TitleProps, "level">) {
  return <Title level={3} {...props} />;
}
export function Title4(props: Omit<TitleProps, "level">) {
  return <Title level={4} {...props} />;
}
