"use client";

import React from "react";

export interface TitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4;
  /** Optional logo URL (e.g. from localStorage). Shown only when level === 1. */
  logoUrl?: string | null;
  onLogoClick?: () => void;
}

export function Title({
  children,
  level = 1,
  logoUrl = null,
  onLogoClick,
  className = "",
  ...props
}: TitleProps) {
  const lvl = Math.min(Math.max(level, 1), 4) as 1 | 2 | 3 | 4;
  const showLogo = level === 1 && logoUrl;

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
      <span className="bpm-title-text" style={{ color: "var(--bpm-text-primary)" }}>
        {children}
      </span>
    </>
  );

  const classNames = `bpm-title bpm-title-level-${lvl} flex items-center gap-2 flex-wrap ${className}`.trim();

  if (lvl === 1) return <h1 className={classNames} {...props}>{content}</h1>;
  if (lvl === 2) return <h2 className={classNames} {...props}>{content}</h2>;
  if (lvl === 3) return <h3 className={classNames} {...props}>{content}</h3>;
  return <h4 className={classNames} {...props}>{content}</h4>;
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
