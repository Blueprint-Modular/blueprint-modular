"use client";

import React from "react";
import { DataExplorerClassic, type DataExplorerClassicProps, type ColumnDef } from "./DataExplorerClassic";
import { DataExplorerAnalytics, type DataExplorerAnalyticsProps } from "./DataExplorerAnalytics";

export type { ColumnDef };
export type { DataExplorerClassicProps };
export type { ExplorerAnalyticsColumn, DataExplorerAnalyticsProps } from "./DataExplorerAnalytics";

export type DataExplorerProps = DataExplorerClassicProps | DataExplorerAnalyticsProps;

/**
 * @component bpm.dataExplorer
 * @description Explorateur de données unifié supportant le mode classique (table) ou analytics (filtres + graphiques).
 * @example
 * bpm.dataExplorer({ mode: "analytics", data: [...], columns: [...], chartConfig: { type: "bar", xKey: "mois", yKey: "ventes" } })
 *
 * @param {object} props
 * @param {"classic"|"analytics"} [props.mode] - Mode d'affichage. Optionnel (défaut: classic).
 * @param {Record<string, unknown>[]} props.data - Données à explorer. Obligatoire.
 * @param {ColumnDef[]|ExplorerAnalyticsColumn[]} props.columns - Définition des colonnes. Obligatoire.
 *
 * @associated bpm.table, bpm.filterPanel, bpm.barChart
 */
export function DataExplorer(props: DataExplorerProps) {
  if ("mode" in props && props.mode === "analytics") {
    const { mode: _m, ...rest } = props;
    return <DataExplorerAnalytics {...rest} />;
  }
  return <DataExplorerClassic {...(props as DataExplorerClassicProps)} />;
}
