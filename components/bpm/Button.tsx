"use client";

import React, { useState } from "react";

/** Accent BPM aligné référence — valeurs hex pour styles 100% inline (pas de var()). */
const ACCENT = "#00a3e2";
const ACCENT_DARK = "#008bc4";
const ACCENT_DARKER = "#007aa8";
const ACCENT_LIGHT = "#b3e0f4";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "link";
export type ButtonSize = "small" | "medium" | "large" | "sm" | "md" | "lg";

export interface ButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Toolbar : ghost avec hover surface + shadow */
  raised?: boolean;
  icon?: string | null;
  iconRight?: string | null;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
  "aria-label"?: string;
  className?: string;
}

const SIZE_MAP: Record<string, "sm" | "md" | "lg"> = {
  small: "sm",
  medium: "md",
  large: "lg",
  sm: "sm",
  md: "md",
  lg: "lg",
};

const SIZES: Record<"sm" | "md" | "lg", { height: number; padding: string; fontSize: number; gap: number; borderRadius: string }> = {
  sm: { height: 32, padding: "0 12px", fontSize: 13, gap: 5, borderRadius: "6px" },
  md: { height: 36, padding: "0 16px", fontSize: 14, gap: 6, borderRadius: "6px" },
  lg: { height: 44, padding: "0 20px", fontSize: 15, gap: 7, borderRadius: "8px" },
};

const ICON_SIZE: Record<"sm" | "md" | "lg", number> = { sm: 14, md: 16, lg: 18 };

type VariantStyle = {
  base: React.CSSProperties;
  hover: React.CSSProperties;
  active: React.CSSProperties;
};

const VARIANTS: Record<ButtonVariant, VariantStyle> = {
  primary: {
    base: {
      background: ACCENT,
      color: "#ffffff",
      border: `1px solid ${ACCENT_DARK}`,
      boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
    },
    hover: { background: ACCENT_DARK },
    active: { background: ACCENT_DARKER },
  },
  secondary: {
    base: {
      background: "#ffffff",
      color: "#111827",
      border: "1px solid #c8cdd6",
      boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
    },
    hover: { background: "#f4f5f7" },
    active: { background: "#e9ecef" },
  },
  outline: {
    base: {
      background: "transparent",
      color: ACCENT,
      border: `1px solid ${ACCENT_LIGHT}`,
    },
    hover: { background: "#e6f7fd", borderColor: ACCENT },
    active: { background: "#cceff9" },
  },
  ghost: {
    base: {
      background: "transparent",
      color: "#6b7280",
      border: "1px solid transparent",
    },
    hover: { background: "#f4f5f7", color: "#111827" },
    active: { background: "#e9ecef" },
  },
  destructive: {
    base: {
      background: "#dc2626",
      color: "#ffffff",
      border: "1px solid #b91c1c",
      boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
    },
    hover: { background: "#b91c1c" },
    active: { background: "#991b1b" },
  },
  link: {
    base: {
      background: "transparent",
      color: ACCENT,
      border: "none",
      paddingLeft: 0,
      paddingRight: 0,
      textDecoration: "none",
      textUnderlineOffset: 3,
    },
    hover: { textDecoration: "underline" },
    active: {},
  },
};

const GHOST_RAISED: VariantStyle = {
  base: { background: "transparent", color: "#6b7280", border: "1px solid transparent" },
  hover: { background: "#ffffff", color: "#111827", boxShadow: "0 1px 2px rgba(0,0,0,0.1)" },
  active: { background: "#f1f3f5" },
};

function Spinner({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{ animation: "bpm-btn-spin 0.75s linear infinite", flexShrink: 0 }}
      aria-hidden
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

type IconFn = (size: number) => React.ReactNode;
const ICONS: Record<string, IconFn> = {
  add: (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  arrow_forward: (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>,
  chevron_left: (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>,
  chevron_right: (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>,
  delete: (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>,
  download: (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>,
  more_vert: (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>,
  more_horiz: (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>,
  filter_list: (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>,
  refresh: (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  check: (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  notifications: (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  person: (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>,
  format_bold: (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>,
  format_italic: (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>,
  format_underlined: (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v7a6 6 0 0 0 12 0V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>,
};

function ButtonIcon({ name, size }: { name: string; size: number }) {
  const fn = ICONS[name];
  if (!fn) return null;
  return <span style={{ display: "inline-flex", alignItems: "center", flexShrink: 0 }}>{fn(size)}</span>;
}

const SPINNER_CSS = "@keyframes bpm-btn-spin{to{transform:rotate(360deg)}}";

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "medium",
  raised = false,
  icon = null,
  iconRight = null,
  loading = false,
  disabled = false,
  fullWidth = false,
  type = "button",
  "aria-label": ariaLabel,
  className,
}: ButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [focused, setFocused] = useState(false);

  const sizeKey = SIZE_MAP[size] ?? "md";
  const vDef = variant === "ghost" && raised ? GHOST_RAISED : (VARIANTS[variant] ?? VARIANTS.primary);
  const sDef = SIZES[sizeKey];
  const iconSize = ICON_SIZE[sizeKey];
  const isIconOnly = children == null || (typeof children === "string" && (children as string).trim() === "");

  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: sDef.gap,
    fontFamily: "inherit",
    fontWeight: 500,
    cursor: disabled || loading ? "default" : "pointer",
    whiteSpace: "nowrap",
    outline: "none",
    userSelect: "none",
    transition: "background 0.12s ease, border-color 0.12s ease, color 0.12s ease, box-shadow 0.12s ease, transform 0.12s ease",
    opacity: disabled ? 0.42 : loading ? 0.7 : 1,
    pointerEvents: disabled || loading ? "none" : undefined,
    height: variant === "link" ? "auto" : sDef.height,
    minHeight: variant === "link" ? undefined : sDef.height,
    padding: isIconOnly ? 0 : (variant === "link" ? 0 : sDef.padding),
    width: isIconOnly ? sDef.height : fullWidth ? "100%" : "auto",
    fontSize: sDef.fontSize,
    borderRadius: sDef.borderRadius,
    ...vDef.base,
    ...(hovered && !disabled && !loading ? vDef.hover : {}),
    ...(pressed && !disabled ? { ...vDef.active, transform: "scale(0.97)" } : {}),
    ...(focused ? { boxShadow: `0 0 0 3px ${ACCENT}40` } : {}),
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: SPINNER_CSS }} />
      <button
        type={type}
        style={baseStyle}
        disabled={disabled || loading}
        onClick={onClick}
        aria-busy={loading || undefined}
        aria-label={ariaLabel}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setPressed(false); }}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        {loading ? <Spinner size={iconSize} /> : icon ? <ButtonIcon name={icon} size={iconSize} /> : null}
        {children != null && <span style={{ opacity: loading ? 0.65 : 1 }}>{children}</span>}
        {!loading && iconRight && <ButtonIcon name={iconRight} size={iconSize} />}
      </button>
    </>
  );
}
