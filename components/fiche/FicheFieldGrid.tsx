"use client";

import React from "react";
import { Caption, Text, Badge, Divider } from "@/components/bpm";

export interface FicheFieldItem {
  label: string;
  value: React.ReactNode;
  /** If true, value is rendered inside a Badge (for status/type). */
  asBadge?: boolean;
  badgeVariant?: "default" | "primary" | "success" | "warning" | "error";
}

export interface FicheFieldGridProps {
  items: FicheFieldItem[];
  columns?: 1 | 2;
  /** If true, add Divider between each row. */
  withDividers?: boolean;
  className?: string;
}

function formatValue(value: React.ReactNode): React.ReactNode {
  if (value === null || value === undefined || value === "") {
    return <Caption className="italic">Non défini</Caption>;
  }
  return value;
}

export function FicheFieldGrid({
  items,
  columns = 2,
  withDividers = true,
  className = "",
}: FicheFieldGridProps) {
  return (
    <dl
      className={`grid gap-x-4 gap-y-2 text-sm ${columns === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"} ${className}`.trim()}
    >
      {items.map((item, index) => {
        const valueContent = item.asBadge ? (
          <Badge variant={item.badgeVariant ?? "default"}>{formatValue(item.value) as React.ReactNode}</Badge>
        ) : (
          <Text>{formatValue(item.value)}</Text>
        );
        return (
          <React.Fragment key={index}>
            {withDividers && index > 0 && (
              <div className="col-span-2 md:col-span-2">
                <Divider thickness={1} color="var(--bpm-border)" />
              </div>
            )}
            <dt className="flex items-center pt-1">
              <Caption>{item.label}</Caption>
            </dt>
            <dd className="flex items-center flex-wrap gap-1 pt-1">{valueContent}</dd>
          </React.Fragment>
        );
      })}
    </dl>
  );
}
