"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Toggle } from "./Toggle";
import { useTheme } from "@/components/ThemeProvider";

const STORAGE_KEY = "bpm-theme";
type ThemeValue = "light" | "dark";

export type ThemeVariant = "toggle" | "select";

export interface ThemeProps {
  /** Type de contrôle : interrupteur (toggle) ou liste (select). */
  variant?: ThemeVariant;
  /** Label à côté du toggle (variant toggle uniquement). */
  label?: React.ReactNode;
  /** Libellé option "Clair" (variant select). */
  lightLabel?: string;
  /** Libellé option "Sombre" (variant select). */
  darkLabel?: string;
  className?: string;
}

function getStoredTheme(): ThemeValue {
  if (typeof document === "undefined") return "light";
  const stored = localStorage.getItem(STORAGE_KEY) as ThemeValue | null;
  if (stored === "dark" || stored === "light") return stored;
  const root = document.documentElement.getAttribute("data-theme") as ThemeValue | null;
  if (root === "dark" || root === "light") return root;
  return "light";
}

function applyTheme(value: ThemeValue) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", value);
  localStorage.setItem(STORAGE_KEY, value);
}

/**
 * Composant de bascule thème clair / sombre.
 * S’appuie sur ThemeProvider quand il est monté ; sinon gère data-theme et localStorage seul.
 */
export function Theme({
  variant = "toggle",
  label,
  lightLabel = "Clair",
  darkLabel = "Sombre",
  className = "",
}: ThemeProps) {
  const { theme: contextTheme, toggleTheme, hasProvider } = useTheme();
  const [standaloneTheme, setStandaloneTheme] = useState<ThemeValue>("light");

  const isDark = hasProvider ? contextTheme === "dark" : standaloneTheme === "dark";

  useEffect(() => {
    if (!hasProvider) {
      const v = getStoredTheme();
      setStandaloneTheme(v);
    }
  }, [hasProvider]);

  const setTheme = useCallback(
    (value: ThemeValue) => {
      applyTheme(value);
      if (hasProvider) {
        if (contextTheme !== value) toggleTheme();
      } else {
        setStandaloneTheme(value);
      }
    },
    [hasProvider, contextTheme, toggleTheme]
  );

  const handleToggle = useCallback(() => {
    setTheme(isDark ? "light" : "dark");
  }, [isDark, setTheme]);

  const handleSelectChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setTheme(e.target.value as ThemeValue);
    },
    [setTheme]
  );

  if (variant === "select") {
    return (
      <div className={`bpm-theme bpm-theme-select inline-flex items-center gap-2 ${className}`.trim()}>
        <select
          value={isDark ? "dark" : "light"}
          onChange={handleSelectChange}
          className="bpm-theme-select-input text-sm rounded-lg border px-3 py-2"
          style={{
            background: "var(--bpm-surface)",
            color: "var(--bpm-text-primary)",
            borderColor: "var(--bpm-border)",
          }}
          aria-label="Choisir le thème"
        >
          <option value="light">{lightLabel}</option>
          <option value="dark">{darkLabel}</option>
        </select>
      </div>
    );
  }

  return (
    <div className={`bpm-theme bpm-theme-toggle ${className}`.trim()}>
      <Toggle
        value={isDark}
        onChange={handleToggle}
        label={label != null ? label : (isDark ? darkLabel : lightLabel)}
      />
    </div>
  );
}
