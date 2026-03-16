"use client";

import React from "react";
import { useBPMContext } from "@/lib/ai/context";

/** Locales courants pour le format nombre (ex. "fr-FR" → 1 000,50, "en-US" → 1,000.50). */
export type MetricValueLocale = "fr-FR" | "en-US" | "de-DE" | string;

export interface MetricProps {
  /** PARENT: bpm.metricRow (standard) | bpm.grid | bpm.card (isolé). INTERDIT: div custom comme parent — casse le responsive. ASSOCIÉ: bpm.badge (statut), bpm.plotlyChart (tendance), bpm.metricRow. */
  /** Libellé affiché au-dessus de la valeur. */
  label: string;
  /** Valeur principale (string ou number). */
  value: string | number;
  /** Variation affichée. Format string (ex. "+12%") ou number. */
  delta?: number | string | null;
  /** Nom optionnel pour référencer la métrique dans le chat IA : $metric:name ou @name */
  name?: string | null;
  /** Aucun = pas de couleur, normal = + vert / - rouge, inverse = + rouge / - vert */
  deltaType?: "aucun" | "normal" | "inverse";
  help?: string | null;
  deltaDecimals?: number;
  currency?: string;
  /** Locale pour formater value (et delta) quand ce sont des nombres. Ex. "fr-FR" (1 000,50), "en-US" (1,000.50). */
  valueLocale?: MetricValueLocale;
  /** Nombre de décimales pour value (si value est un number et valueLocale est défini). */
  valueDecimals?: number;
  /** Afficher le séparateur de milliers (true par défaut). false → 1000,50 au lieu de 1 000,50. */
  valueGrouping?: boolean;
  /** Afficher la bordure autour de la métrique (true par défaut). */
  border?: boolean;
  /** Icône distinctive (ex. lucide-react) affichée à gauche du label. */
  icon?: React.ReactNode | null;
  /** Micro-info contextuelle sous la métrique (gris clair). */
  subtext?: string | null;
  /** Couleur d'accent (bordure gauche ou fond icône). */
  accentColor?: string | null;
  /** Mode compact : hauteur réduite (~80px), padding et typo plus serrés. */
  compact?: boolean;
  /** Si true, expose cette métrique au contexte IA. */
  trackContext?: boolean;
}

export function Metric({
  label,
  value,
  delta,
  name = null,
  deltaType = "normal",
  help = null,
  deltaDecimals = 0,
  currency = "EUR",
  valueLocale,
  valueDecimals = 0,
  valueGrouping = true,
  border = true,
  icon = null,
  subtext = null,
  accentColor = null,
  compact = false,
  trackContext = false,
}: MetricProps) {
  const symbols: Record<string, string> = {
    EUR: "€",
    USD: "$",
    GBP: "£",
    JPY: "¥",
    CHF: "CHF",
  };
  const sym = currency && currency !== "%" ? (symbols[currency] ?? currency) : "";
  const locale = valueLocale ?? "fr-FR";
  const formatWithLocale = (n: number, decimals: number) =>
    n.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: valueGrouping,
    });
  const formatDelta = (d: number, forcePercent = false) => {
    if (typeof d !== "number" || !Number.isFinite(d)) return "";
    const sign = d > 0 ? "+" : d < 0 ? "-" : "";
    const fmt = formatWithLocale(Math.abs(d), deltaDecimals);
    if (forcePercent || currency === "%") return `${sign}${fmt}%`;
    if (!currency || currency === "") return `${sign}${fmt}`;
    return `${sign}${fmt} ${sym}`;
  };
  const displayValue =
    typeof value === "number"
      ? formatWithLocale(value, valueDecimals)
      : value;
  const deltaStr = typeof delta === "string" ? delta.trim() : "";
  const deltaIsPercent = deltaStr.endsWith("%");
  const deltaNum = typeof delta === "string" ? parseFloat(delta.replace(/,/g, ".").replace(/%/g, "")) : delta;
  const hasDelta = deltaNum != null && !Number.isNaN(deltaNum);
  const positive = hasDelta && deltaType !== "aucun" && (deltaType === "inverse" ? deltaNum < 0 : deltaNum > 0);
  const negative = hasDelta && deltaType !== "aucun" && (deltaType === "inverse" ? deltaNum > 0 : deltaNum < 0);

  useBPMContext(
    { type: "metric", label, value: displayValue },
    trackContext === true
  );

  return (
    <div
      className={`bpm-metric inline-block rounded-lg min-w-[140px] ${compact ? "p-3" : "p-4"} ${border ? "border" : ""}`}
      style={{
        background: "var(--bpm-surface, #ffffff)",
        ...(border ? { borderColor: "var(--bpm-border, #e5e7eb)" } : {}),
        ...(accentColor ? { borderLeftWidth: 4, borderLeftColor: accentColor } : {}),
        color: "var(--bpm-text-primary, #111827)",
        minHeight: compact ? "80px" : undefined,
      }}
      data-metric-name={name && name !== "" ? name : undefined}
    >
      <div className={`flex items-center gap-2 ${compact ? "mb-0.5" : "mb-1"}`} style={compact ? { marginBottom: "calc(0.125rem + 3px)" } : undefined}>
        {icon != null && (
          <span
            className="flex-shrink-0 flex items-center justify-center rounded"
            style={{ color: accentColor || "var(--bpm-text-secondary, #6b7280)" }}
          >
            {icon}
          </span>
        )}
        <div className={`${compact ? "text-xs" : "text-sm"} truncate`} style={{ color: "var(--bpm-text-secondary, #6b7280)" }}>
          {label}
          {help && (
            <span className="ml-1" title={help}>
              ⓘ
            </span>
          )}
        </div>
      </div>
      <div className={compact ? "text-lg font-bold" : "text-xl font-bold"} style={compact ? { marginTop: 3 } : undefined}>{displayValue}</div>
      {(subtext != null && subtext !== "") && (
        <div className={`${compact ? "text-[11px]" : "text-sm mt-1"}`} style={{ color: "var(--bpm-text-secondary, #6b7280)", ...(compact ? { marginTop: "calc(0.125rem + 3px)" } : {}) }}>
          {subtext}
        </div>
      )}
      <div
        className={`${compact ? "text-xs mt-0.5" : "text-sm mt-1"} ${hasDelta ? (positive ? "text-green-600" : negative ? "text-red-600" : "") : "opacity-0"}`}
      >
        {hasDelta ? (
          <>
            {deltaNum! > 0 ? "▲" : deltaNum! < 0 ? "▼" : "—"}
            {formatDelta(deltaNum!, deltaIsPercent)}
          </>
        ) : (
          "\u00A0"
        )}
      </div>
    </div>
  );
}
