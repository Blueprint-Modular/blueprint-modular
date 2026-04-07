"use client";

import React, { useEffect, useMemo, useState } from "react";

export interface MasterDetailColumn<T> {
  key: string;
  label: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface MasterDetailProps<T extends Record<string, unknown>> {
  items: T[];
  columns: MasterDetailColumn<T>[];
  renderDetail: (item: T) => React.ReactElement;
  selectedId?: string;
  onSelect: (item: T) => void;
  idKey?: string;
  searchable?: boolean;
  emptyDetailMessage?: string;
  splitRatio?: number;
  className?: string;
}

function useNarrowMobile(): boolean {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setNarrow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return narrow;
}

function getId<T extends Record<string, unknown>>(item: T, idKey: string): string {
  const v = item[idKey];
  return v != null ? String(v) : "";
}

function rowText<T extends Record<string, unknown>>(item: T, columns: MasterDetailColumn<T>[]): string {
  return columns
    .map((c) => {
      const v = item[c.key];
      return v != null ? String(v) : "";
    })
    .join(" ")
    .toLowerCase();
}

/**
 * @component bpm.masterDetail
 * @description Liste à gauche et détail à droite ; sur mobile, le détail s’ouvre en plein cadre avec retour.
 */
export function MasterDetail<T extends Record<string, unknown>>({
  items,
  columns,
  renderDetail,
  selectedId,
  onSelect,
  idKey = "id",
  searchable = false,
  emptyDetailMessage = "Sélectionnez un élément dans la liste.",
  splitRatio = 40,
  className = "",
}: MasterDetailProps<T>) {
  const isMobile = useNarrowMobile();
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!isMobile) setMobileDetailOpen(false);
  }, [isMobile]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => rowText(item, columns).includes(q));
  }, [items, columns, query]);

  const selected = items.find((it) => getId(it, idKey) === selectedId) ?? null;

  const handleSelect = (item: T) => {
    onSelect(item);
    if (isMobile) setMobileDetailOpen(true);
  };

  const listSection = (
    <div
      style={{
        flex: isMobile ? "none" : `0 0 ${splitRatio}%`,
        width: isMobile ? "100%" : undefined,
        minWidth: 0,
        borderRight: isMobile ? "none" : "1px solid var(--bpm-border)",
        borderBottom: isMobile ? "1px solid var(--bpm-border)" : "none",
        display: "flex",
        flexDirection: "column",
        maxHeight: isMobile ? 360 : 480,
      }}
    >
      {searchable && (
        <div style={{ padding: "8px 10px", borderBottom: "1px solid var(--bpm-border)" }}>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher…"
            aria-label="Rechercher dans la liste"
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: "var(--bpm-radius-sm)",
              border: "1px solid var(--bpm-border)",
              fontSize: 14,
              background: "var(--bpm-surface)",
              color: "var(--bpm-text-primary)",
            }}
          />
        </div>
      )}
      <ul role="listbox" aria-label="Liste" style={{ listStyle: "none", margin: 0, padding: 0, overflowY: "auto", flex: 1 }}>
        {filtered.map((item) => {
          const id = getId(item, idKey);
          const isSel = id === selectedId;
          return (
            <li key={id || JSON.stringify(item)}>
              <button
                type="button"
                role="option"
                aria-selected={isSel}
                onClick={() => handleSelect(item)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 12px",
                  border: "none",
                  borderBottom: "1px solid var(--bpm-border)",
                  background: isSel ? "color-mix(in srgb, var(--bpm-accent) 10%, var(--bpm-surface))" : "var(--bpm-surface)",
                  cursor: "pointer",
                  fontSize: 14,
                  color: "var(--bpm-text-primary)",
                }}
              >
                {columns.map((col) => (
                  <div key={col.key} style={{ fontWeight: col === columns[0] ? 600 : 400 }}>
                    {col.render ? col.render(item[col.key], item) : item[col.key] != null ? String(item[col.key]) : ""}
                  </div>
                ))}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );

  const detailSection = (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        padding: 16,
        background: "var(--bpm-bg-app, var(--bpm-bg-secondary))",
        minHeight: isMobile ? 240 : undefined,
      }}
    >
      {isMobile && mobileDetailOpen && (
        <button
          type="button"
          onClick={() => setMobileDetailOpen(false)}
          style={{
            marginBottom: 12,
            padding: "8px 12px",
            borderRadius: "var(--bpm-radius-sm)",
            border: "1px solid var(--bpm-border)",
            background: "var(--bpm-surface)",
            cursor: "pointer",
            color: "var(--bpm-text-primary)",
          }}
        >
          ← Retour à la liste
        </button>
      )}
      {selected ? (
        renderDetail(selected)
      ) : (
        <div
          role="status"
          style={{
            minHeight: 200,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--bpm-text-secondary)",
            textAlign: "center",
            padding: 24,
          }}
        >
          <span className="material-symbols-outlined" aria-hidden style={{ fontSize: 40, opacity: 0.45, marginBottom: 8 }}>
            touch_app
          </span>
          {emptyDetailMessage}
        </div>
      )}
    </div>
  );

  const showList = !isMobile || !mobileDetailOpen;
  const showDetail = !isMobile || mobileDetailOpen;

  return (
    <div
      className={`bpm-master-detail ${className}`.trim()}
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        width: "100%",
        minHeight: 320,
        border: "1px solid var(--bpm-border)",
        borderRadius: "var(--bpm-radius)",
        overflow: "hidden",
        background: "var(--bpm-surface)",
      }}
    >
      {showList ? listSection : null}
      {showDetail ? detailSection : null}
    </div>
  );
}
