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
  /** Optional logo URL (e.g. from localStorage). Shown only when level === 1. */
  logoUrl?: string | null;
  onLogoClick?: () => void;
}

export function Title({
  children,
  level = 1,
  size: sizeProp = null,
  bold: boldProp = null,
  color: colorProp = null,
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
  const color = colorProp ?? "var(--bpm-text-primary)";

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

  const classNames = `bpm-title bpm-title-level-${lvl} flex items-center gap-2 flex-wrap ${className}`.trim();
  const mergedStyle = { fontSize, fontWeight, ...style };

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
