"use client";

import React from "react";
import { DataExplorerClassic, type DataExplorerClassicProps, type ColumnDef } from "./DataExplorerClassic";
import { DataExplorerAnalytics, type DataExplorerAnalyticsProps } from "./DataExplorerAnalytics";

export type { ColumnDef };
export type { DataExplorerClassicProps };
export type { ExplorerAnalyticsColumn, DataExplorerAnalyticsProps } from "./DataExplorerAnalytics";

export type DataExplorerProps = DataExplorerClassicProps | DataExplorerAnalyticsProps;

export function DataExplorer(props: DataExplorerProps) {
  if ("mode" in props && props.mode === "analytics") {
    const { mode: _m, ...rest } = props;
    return <DataExplorerAnalytics {...rest} />;
  }
  return <DataExplorerClassic {...(props as DataExplorerClassicProps)} />;
}
