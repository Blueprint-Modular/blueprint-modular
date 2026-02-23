"use client";

import React from "react";

/** Locales courants pour le format nombre (ex. "fr-FR" → 1 000,50, "en-US" → 1,000.50). */
export type MetricValueLocale = "fr-FR" | "en-US" | "de-DE" | string;

export interface MetricProps {
  label: string;
  value: string | number;
  delta?: number | string | null;
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
}

export function Metric({
  label,
  value,
  delta,
  deltaType = "normal",
  help = null,
  deltaDecimals = 0,
  currency = "EUR",
  valueLocale,
  valueDecimals = 0,
  valueGrouping = true,
}: MetricProps) {
  const symbols: Record<string, string> = {
    EUR: "€",
    USD: "$",
    GBP: "£",
    JPY: "¥",
    CHF: "CHF",
  };
  const sym = currency ? (symbols[currency] ?? currency) : "";
  const locale = valueLocale ?? "fr-FR";
  const formatWithLocale = (n: number, decimals: number) =>
    n.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: valueGrouping,
    });
  const formatDelta = (d: number) => {
    if (typeof d !== "number" || !Number.isFinite(d)) return "";
    const sign = d > 0 ? "+" : d < 0 ? "-" : "";
    const fmt = formatWithLocale(Math.abs(d), deltaDecimals);
    return currency === "" ? `${sign}${fmt}%` : `${sign}${fmt} ${sym}`;
  };
  const displayValue =
    typeof value === "number"
      ? formatWithLocale(value, valueDecimals)
      : value;
  const deltaNum = typeof delta === "string" ? parseFloat(delta) : delta;
  const hasDelta = deltaNum != null && !Number.isNaN(deltaNum);
  const positive = hasDelta && deltaType !== "aucun" && (deltaType === "inverse" ? deltaNum < 0 : deltaNum > 0);
  const negative = hasDelta && deltaType !== "aucun" && (deltaType === "inverse" ? deltaNum > 0 : deltaNum < 0);

  return (
    <div
      className="inline-block p-4 rounded-lg border min-w-[140px]"
      style={{
        background: "var(--bpm-surface)",
        borderColor: "var(--bpm-border)",
        color: "var(--bpm-text-primary)",
      }}
    >
      <div className="text-sm mb-1" style={{ color: "var(--bpm-text-secondary)" }}>
        {label}
        {help && (
          <span className="ml-1" title={help}>
            ⓘ
          </span>
        )}
      </div>
      <div className="text-xl font-bold">{displayValue}</div>
      <div
        className={`text-sm mt-1 ${hasDelta ? (positive ? "text-green-600" : negative ? "text-red-600" : "") : "opacity-0"}`}
      >
        {hasDelta ? (
          <>
            {deltaNum! > 0 ? "▲" : deltaNum! < 0 ? "▼" : "—"}
            {formatDelta(deltaNum!)}
          </>
        ) : (
          "\u00A0"
        )}
      </div>
    </div>
  );
}
