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
  style?: React.CSSProperties;
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
  format_align_left: (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>,
  format_align_center: (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/></svg>,
  format_align_right: (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/></svg>,
  format_list_bulleted: (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>,
  link: (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  image: (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  sort: (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="9" y2="18"/></svg>,
  print: (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
  view_column: (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="5" height="18"/><rect x="10" y="3" width="5" height="18"/><rect x="17" y="3" width="5" height="18"/></svg>,
  density_medium: (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  thumb_up: (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>,
  share: (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  bookmark: (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>,
  comment: (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  dashboard: (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>,
  folder: (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  bar_chart: (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>,
  settings: (s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09A1.65 1.65 0 0 0 19.4 15z"/></svg>,
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
  style: styleProp,
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
    ...styleProp,
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
