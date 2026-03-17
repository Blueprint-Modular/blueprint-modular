"use client";

import React, { useState } from "react";

export interface SidebarItem {
  /** Clé unique de l’entrée. */
  key: string;
  /** Libellé affiché (mode expanded). */
  label: string;
  /** Nom de l’icône Material Symbol (snake_case), ex: "dashboard", "inventory_2", "widgets". Voir https://fonts.google.com/icons (weight 200). */
  icon: string;
}

export interface PageLayoutProps {
  title: string;
  items: SidebarItem[];
  currentItem: string;
  onNavigate: (key: string) => void;
  children: React.ReactNode;
  defaultCollapsed?: boolean;
  /** Thème courant (optionnel). Si fourni avec onThemeChange, affiche le bouton thème en bas de la sidebar (aligné .Maker). */
  theme?: "light" | "dark";
  /** Callback changement de thème (clair ↔ sombre). Affiche le bouton thème en bas si défini. */
  onThemeChange?: (theme: "light" | "dark") => void;
}

const CHEVRON_LEFT = "chevron_left";
const CHEVRON_RIGHT = "chevron_right";
const ICON_LIGHT = "light_mode";
const ICON_DARK = "dark_mode";

const SIDEBAR_WIDTH_COLLAPSED = 56;
const SIDEBAR_WIDTH_EXPANDED = 220;

function MaterialIcon({
  icon,
  size = 24,
  style = {},
}: {
  icon: string;
  size?: number;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className="material-symbols-outlined bpm-material-icon"
      role="img"
      aria-hidden
      style={{
        fontFamily: "Material Symbols Outlined",
        fontVariationSettings: "'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 24",
        fontSize: size,
        width: size,
        height: size,
        minWidth: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        overflow: "hidden",
        ...style,
      }}
    >
      {icon}
    </span>
  );
}

export function PageLayout({
  title,
  items,
  currentItem,
  onNavigate,
  children,
  defaultCollapsed = false,
  theme,
  onThemeChange,
}: PageLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const showToggle = !isCollapsed || sidebarHovered;

  const themeVars =
    theme === "dark"
      ? {
          "--bpm-bg": "#0f172a",
          "--bpm-bg-secondary": "#1e293b",
          "--bpm-border": "#334155",
          "--bpm-text": "#f1f5f9",
          "--bpm-text-secondary": "#94a3b8",
          "--bpm-accent": "#00a3e2",
          "--bpm-radius": "6px",
          "--bpm-font-size-base": "14px",
          "--bpm-font-size-lg": "1.125rem",
        }
      : {
          "--bpm-bg": "#ffffff",
          "--bpm-bg-secondary": "#f8fafc",
          "--bpm-border": "#e2e8f0",
          "--bpm-text": "#0f172a",
          "--bpm-text-secondary": "#64748b",
          "--bpm-accent": "#00a3e2",
          "--bpm-radius": "6px",
          "--bpm-font-size-base": "14px",
          "--bpm-font-size-lg": "1.125rem",
        };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "var(--bpm-bg)",
        ...themeVars,
      } as React.CSSProperties}
    >
      <aside
        style={{
          width: isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED,
          background: "var(--bpm-bg)",
          borderRight: "1px solid var(--bpm-border)",
          padding: "12px 8px",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          transition: "width 0.25s ease",
          overflow: "hidden",
        }}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        {/* Ligne du haut : titre + chevron ouvrir/fermer (aligné .Maker) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "space-between",
            gap: 8,
            minHeight: 40,
            padding: "4px 0 8px",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: "var(--bpm-font-size-lg)",
              fontWeight: 600,
              color: "var(--bpm-text)",
              paddingLeft: isCollapsed ? 0 : 12,
              flex: isCollapsed ? 0 : 1,
              minWidth: 0,
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              opacity: isCollapsed ? 0 : 1,
              transition: "opacity 0.15s ease",
            }}
          >
            {title}
          </span>
          <button
            type="button"
            onClick={() => setIsCollapsed((c) => !c)}
            aria-label={isCollapsed ? "Ouvrir le menu" : "Réduire le menu"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              padding: 0,
              border: "none",
              borderRadius: "var(--bpm-radius)",
              background: "transparent",
              color: "var(--bpm-text-secondary)",
              cursor: "pointer",
              opacity: showToggle ? 1 : 0,
              pointerEvents: showToggle ? "auto" : "none",
              transition: "background-color 0.15s ease, opacity 0.15s ease",
              outline: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bpm-bg-secondary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <MaterialIcon icon={isCollapsed ? CHEVRON_RIGHT : CHEVRON_LEFT} size={20} />
          </button>
        </div>

        <nav
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            alignItems: isCollapsed ? "center" : "stretch",
          }}
        >
          {items.map((item) => {
            const isActive = currentItem === item.key;
            return (
              <div
                key={item.key}
                style={{
                  display: "flex",
                  alignItems: "stretch",
                  width: isCollapsed ? 32 : "100%",
                  minWidth: isCollapsed ? 32 : undefined,
                  borderRadius: "var(--bpm-radius)",
                }}
              >
                {!isCollapsed && (
                  <span
                    style={{
                      width: 2,
                      flexShrink: 0,
                      background: isActive ? "var(--bpm-accent)" : "transparent",
                      borderRadius: 0,
                    }}
                    aria-hidden
                  />
                )}
                <button
                  type="button"
                  onClick={() => onNavigate(item.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: isCollapsed ? 0 : "8px 12px",
                    justifyContent: isCollapsed ? "center" : "flex-start",
                    flex: 1,
                    minWidth: 0,
                    height: 32,
                    border: "none",
                    background: isActive ? "var(--bpm-bg-secondary)" : "transparent",
                    color: isActive ? "var(--bpm-accent)" : "var(--bpm-text-secondary)",
                    cursor: "pointer",
                    font: "inherit",
                    fontSize: "var(--bpm-font-size-base)",
                    borderRadius: "var(--bpm-radius)",
                    boxSizing: "border-box",
                    transition: "background-color 0.15s ease",
                    outline: "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = "var(--bpm-bg-secondary)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <MaterialIcon icon={item.icon} size={20} />
                  <span
                    style={{
                      opacity: isCollapsed ? 0 : 1,
                      width: isCollapsed ? 0 : undefined,
                      maxWidth: isCollapsed ? 0 : undefined,
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      flex: isCollapsed ? "none" : 1,
                      minWidth: isCollapsed ? 0 : 0,
                      transition: "opacity 0.15s ease",
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              </div>
            );
          })}
        </nav>

        {/* Footer : thème clair/sombre (aligné .Maker) */}
        {onThemeChange != null && (
          <div
            style={{
              flexShrink: 0,
              paddingTop: 8,
              borderTop: "1px solid var(--bpm-border)",
              display: "flex",
              justifyContent: isCollapsed ? "center" : "flex-start",
            }}
          >
            <button
              type="button"
              onClick={() => onThemeChange(theme === "dark" ? "light" : "dark")}
              aria-label="Thème clair / sombre"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: isCollapsed ? 0 : "8px 12px",
                justifyContent: isCollapsed ? "center" : "flex-start",
                width: isCollapsed ? 32 : "100%",
                minWidth: isCollapsed ? 32 : undefined,
                height: 32,
                border: "none",
                borderRadius: "var(--bpm-radius)",
                background: "transparent",
                color: "var(--bpm-text-secondary)",
                cursor: "pointer",
                font: "inherit",
                fontSize: "var(--bpm-font-size-base)",
                boxSizing: "border-box",
                transition: "background-color 0.15s ease",
                outline: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--bpm-bg-secondary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <MaterialIcon
                icon={theme === "dark" ? ICON_LIGHT : ICON_DARK}
                size={20}
              />
              <span
                style={{
                  opacity: isCollapsed ? 0 : 1,
                  width: isCollapsed ? 0 : undefined,
                  maxWidth: isCollapsed ? 0 : undefined,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  flex: isCollapsed ? "none" : 1,
                  minWidth: isCollapsed ? 0 : 0,
                  transition: "opacity 0.15s ease",
                }}
              >
                Thème
              </span>
            </button>
          </div>
        )}
      </aside>
      <main
        style={{
          flex: 1,
          background: "var(--bpm-bg)",
          overflow: "auto",
          padding: 32,
          minWidth: 0,
        }}
      >
        {children}
      </main>
    </div>
  );
}
