"use client";

import React, { useMemo, useState } from "react";

export type GroupedListProps<T extends Record<string, unknown>> = {
  items: T[];
  groupBy: keyof T;
  renderItem: (item: T, index: number) => React.ReactNode;
  renderGroupHeader?: (key: string, count: number) => React.ReactNode;
  sortGroups?: "asc" | "desc";
  collapsible?: boolean;
  defaultCollapsed?: boolean;
};

function groupKeyString(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);
  return String(v);
}

export function GroupedList<T extends Record<string, unknown>>({
  items,
  groupBy,
  renderItem,
  renderGroupHeader,
  sortGroups = "asc",
  collapsible = false,
  defaultCollapsed = false,
}: GroupedListProps<T>) {
  const grouped = useMemo(() => {
    const m = new Map<string, { items: T[]; indices: number[] }>();
    items.forEach((item, index) => {
      const k = groupKeyString(item[groupBy]);
      const g = m.get(k) ?? { items: [], indices: [] };
      g.items.push(item);
      g.indices.push(index);
      m.set(k, g);
    });
    const keys = [...m.keys()].sort((a, b) => (sortGroups === "asc" ? a.localeCompare(b) : b.localeCompare(a)));
    return keys.map((key) => ({ key, ...m.get(key)! }));
  }, [items, groupBy, sortGroups]);

  const [openOverrides, setOpenOverrides] = useState<Record<string, boolean>>({});

  const isGroupOpen = (key: string) =>
    key in openOverrides ? openOverrides[key] : !defaultCollapsed;

  const toggle = (key: string) => {
    setOpenOverrides((p) => {
      const cur = key in p ? p[key] : !defaultCollapsed;
      return { ...p, [key]: !cur };
    });
  };

  return (
    <div
      style={{
        border: "1px solid var(--bpm-border)",
        borderRadius: "var(--bpm-radius)",
        background: "var(--bpm-surface)",
        color: "var(--bpm-text-primary)",
        overflow: "hidden",
      }}
    >
      {grouped.map(({ key, items: groupItems, indices }) => {
        const isOpen = isGroupOpen(key);
        const headerContent = renderGroupHeader ? (
          renderGroupHeader(key, groupItems.length)
        ) : (
          <span style={{ fontWeight: 600, fontSize: 13 }}>
            {key === "" ? "(empty)" : key}{" "}
            <span style={{ fontWeight: 400, color: "var(--bpm-text-secondary)", fontSize: 12 }}>
              ({groupItems.length})
            </span>
          </span>
        );

        return (
          <div key={key} style={{ borderBottom: "1px solid var(--bpm-border)" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 12px",
                background: "var(--bpm-bg-secondary, var(--bpm-surface))",
              }}
            >
              {collapsible && (
                <button
                  type="button"
                  onClick={() => toggle(key)}
                  aria-expanded={isOpen}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "var(--bpm-radius-sm)",
                    border: "1px solid var(--bpm-border)",
                    background: "var(--bpm-surface)",
                    color: "var(--bpm-text-primary)",
                    cursor: "pointer",
                    fontSize: 14,
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                >
                  {isOpen ? "−" : "+"}
                </button>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>{headerContent}</div>
            </div>
            <div
              style={{
                maxHeight: collapsible ? (isOpen ? 8000 : 0) : undefined,
                overflow: "hidden",
                transition: collapsible ? "max-height 0.35s ease" : undefined,
              }}
            >
              <ul
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                }}
              >
                {groupItems.map((item, i) => (
                  <li
                    key={indices[i] ?? i}
                    style={{
                      padding: "10px 12px",
                      borderTop: "1px solid var(--bpm-border)",
                      fontSize: 13,
                    }}
                  >
                    {renderItem(item, indices[i] ?? i)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}
