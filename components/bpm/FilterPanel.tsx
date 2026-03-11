"use client";

import React, { useState } from "react";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: "select" | "multiselect" | "daterange" | "text" | "toggle";
  options?: FilterOption[];
}

export interface FilterPanelProps {
  /** Liste des filtres à afficher. */
  filters: FilterConfig[];
  /** Valeurs courantes (clé = filter.key). */
  values?: Record<string, unknown>;
  /** Callback à chaque changement d'un filtre. */
  onChange: (key: string, value: unknown) => void;
  /** Callback réinitialisation. */
  onReset: () => void;
  /** Disposition : horizontal (flex row) ou vertical (colonne 240px). */
  orientation?: "horizontal" | "vertical";
  /** Afficher un bouton pour replier le panneau (avec badge si filtres actifs). */
  collapsible?: boolean;
}

function getActiveCount(filters: FilterConfig[], values: Record<string, unknown>): number {
  let n = 0;
  for (const f of filters) {
    const v = values[f.key];
    if (f.type === "multiselect") {
      const arr = Array.isArray(v) ? v : [];
      if (arr.length > 0) n++;
    } else if (f.type === "daterange") {
      const range = v as { start?: unknown; end?: unknown } | undefined;
      if (range && (range.start != null || range.end != null)) n++;
    } else if (v !== undefined && v !== null && v !== "") n++;
  }
  return n;
}

export function FilterPanel({
  filters,
  values = {},
  onChange,
  onReset,
  orientation = "horizontal",
  collapsible = false,
}: FilterPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const activeCount = getActiveCount(filters, values);
  const hasActive = activeCount > 0;

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: orientation === "vertical" ? "column" : "row",
    flexWrap: orientation === "horizontal" ? "wrap" : "nowrap",
    gap: 12,
    alignItems: orientation === "vertical" ? "stretch" : "center",
    width: orientation === "vertical" ? 240 : "100%",
    padding: 12,
    background: "var(--bpm-surface)",
    border: "1px solid var(--bpm-border)",
    borderRadius: "var(--bpm-radius)",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--bpm-text-secondary)",
    marginBottom: 4,
    display: "block",
  };

  const inputStyle: React.CSSProperties = {
    padding: "8px 12px",
    border: "1px solid var(--bpm-border)",
    borderRadius: "var(--bpm-radius-sm)",
    background: "var(--bpm-bg-primary)",
    color: "var(--bpm-text-primary)",
    fontSize: 14,
    minWidth: orientation === "vertical" ? "100%" : 120,
  };

  const buttonStyle: React.CSSProperties = {
    padding: "8px 16px",
    border: "1px solid var(--bpm-border)",
    borderRadius: "var(--bpm-radius-sm)",
    background: "var(--bpm-bg-primary)",
    color: "var(--bpm-text-secondary)",
    fontSize: 14,
    cursor: "pointer",
  };

  const buttonDangerStyle: React.CSSProperties = {
    ...buttonStyle,
    background: "var(--bpm-error)",
    color: "var(--bpm-accent-contrast)",
    borderColor: "var(--bpm-error)",
  };

  const renderFilter = (f: FilterConfig) => {
    const v = values[f.key];
    const common = { key: f.key, label: f.label };

    if (f.type === "select") {
      const opts = f.options ?? [];
      return (
        <div key={f.key} style={{ display: "flex", flexDirection: "column", minWidth: 140 }}>
          <label style={labelStyle}>{f.label}</label>
          <select
            style={inputStyle}
            value={(v as string) ?? ""}
            onChange={(e) => onChange(f.key, e.target.value || null)}
          >
            <option value="">Tous</option>
            {opts.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (f.type === "multiselect") {
      const selected = (Array.isArray(v) ? v : []) as string[];
      const opts = f.options ?? [];
      return (
        <div key={f.key} style={{ display: "flex", flexDirection: "column", minWidth: 160 }}>
          <label style={labelStyle}>{f.label}</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {opts.map((o) => {
              const checked = selected.includes(o.value);
              return (
                <label key={o.value} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "var(--bpm-text-primary)", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      const next = checked ? selected.filter((x) => x !== o.value) : [...selected, o.value];
                      onChange(f.key, next);
                    }}
                  />
                  {o.label}
                </label>
              );
            })}
          </div>
        </div>
      );
    }

    if (f.type === "daterange") {
      const range = (v as { start?: string; end?: string }) ?? {};
      return (
        <div key={f.key} style={{ display: "flex", flexDirection: "column", minWidth: 200 }}>
          <label style={labelStyle}>{f.label}</label>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="date"
              style={{ ...inputStyle, flex: 1 }}
              value={range.start ?? ""}
              onChange={(e) => onChange(f.key, { ...range, start: e.target.value || undefined })}
            />
            <span style={{ color: "var(--bpm-text-secondary)", fontSize: 14 }}>–</span>
            <input
              type="date"
              style={{ ...inputStyle, flex: 1 }}
              value={range.end ?? ""}
              onChange={(e) => onChange(f.key, { ...range, end: e.target.value || undefined })}
            />
          </div>
        </div>
      );
    }

    if (f.type === "text") {
      return (
        <div key={f.key} style={{ display: "flex", flexDirection: "column", minWidth: 140 }}>
          <label style={labelStyle}>{f.label}</label>
          <input
            type="text"
            style={inputStyle}
            value={(v as string) ?? ""}
            onChange={(e) => onChange(f.key, e.target.value)}
            placeholder="Rechercher..."
          />
        </div>
      );
    }

    if (f.type === "toggle") {
      const on = v === true || v === "true";
      return (
        <div key={f.key} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 20 }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>{f.label}</label>
          <input
            type="checkbox"
            checked={on}
            onChange={(e) => onChange(f.key, e.target.checked)}
            style={{ width: 18, height: 18, cursor: "pointer" }}
          />
        </div>
      );
    }

    return null;
  };

  const content = (
    <>
      {filters.map(renderFilter)}
      {hasActive && (
        <button type="button" style={buttonDangerStyle} onClick={onReset}>
          Réinitialiser
        </button>
      )}
    </>
  );

  if (collapsible) {
    return (
      <div style={{ ...containerStyle, flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: collapsed ? 0 : 8 }}>
          <button
            type="button"
            style={buttonStyle}
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? "Afficher les filtres" : "Masquer les filtres"}
          >
            {collapsed ? "Filtres" : "Filtres"}
            {activeCount > 0 && (
              <span style={{ marginLeft: 8, background: "var(--bpm-accent)", color: "var(--bpm-accent-contrast)", padding: "2px 8px", borderRadius: 4, fontSize: 12 }}>
                {activeCount}
              </span>
            )}
          </button>
        </div>
        {!collapsed && content}
      </div>
    );
  }

  return <div style={containerStyle}>{content}</div>;
}
