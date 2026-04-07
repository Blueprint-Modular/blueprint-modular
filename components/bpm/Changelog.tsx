"use client";

import React, { useMemo, useState } from "react";

export interface ChangelogEntry {
  field: string;
  fieldLabel?: string;
  before: string | number | boolean | null;
  after: string | number | boolean | null;
  actor: string;
  date: string;
}

export interface ChangelogProps {
  changes: ChangelogEntry[];
  groupByDate?: boolean;
  maxItems?: number;
  className?: string;
}

function fmt(v: string | number | boolean | null): string {
  if (v === null) return "—";
  return String(v);
}

function groupLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const t = new Date();
  const a = new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime();
  const b = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((a - b) / 86400000);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Hier";
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function initial(s: string): string {
  return s.trim().slice(0, 1).toUpperCase() || "?";
}

export function Changelog({ changes, groupByDate = false, maxItems, className = "" }: ChangelogProps) {
  const [expanded, setExpanded] = useState(false);
  const limit = maxItems ?? changes.length;
  const slice = expanded ? changes : changes.slice(0, limit);

  const groups = useMemo(() => {
    if (!groupByDate) return [{ label: null as string | null, items: slice }];
    const m: { label: string; items: ChangelogEntry[] }[] = [];
    let cur = "";
    for (const c of slice) {
      const lab = groupLabel(c.date);
      if (!m.length || lab !== cur) {
        m.push({ label: lab, items: [c] });
        cur = lab;
      } else {
        m[m.length - 1]!.items.push(c);
      }
    }
    return m.map((g) => ({ label: g.label as string | null, items: g.items }));
  }, [slice, groupByDate]);

  return (
    <div className={`bpm-changelog ${className}`.trim()} role="feed" aria-label="Journal des modifications">
      {groups.map((g, gi) => (
        <div key={gi}>
          {g.label && (
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--bpm-text-secondary)", margin: "16px 0 8px" }}>{g.label}</div>
          )}
          {g.items.map((c, i) => (
            <article
              key={`${c.field}-${c.date}-${i}`}
              style={{
                display: "flex",
                gap: 12,
                padding: "12px 0",
                borderBottom: "1px solid var(--bpm-border)",
              }}
            >
              <div
                aria-hidden
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "color-mix(in srgb, var(--bpm-accent) 20%, var(--bpm-surface))",
                  color: "var(--bpm-accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 13,
                  flexShrink: 0,
                }}
              >
                {initial(c.actor)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: "var(--bpm-text-secondary)" }}>
                  {c.actor} · {new Date(c.date).toLocaleString("fr-FR")}
                </div>
                <div style={{ fontWeight: 600, marginTop: 4, color: "var(--bpm-text-primary)" }}>{c.fieldLabel ?? c.field}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginTop: 8 }}>
                  <span
                    style={{
                      textDecoration: "line-through",
                      color: "var(--bpm-error)",
                      fontSize: 14,
                      padding: "4px 8px",
                      borderRadius: "var(--bpm-radius-sm)",
                      background: "color-mix(in srgb, var(--bpm-error) 12%, transparent)",
                    }}
                  >
                    {fmt(c.before)}
                  </span>
                  <span aria-hidden style={{ color: "var(--bpm-text-secondary)" }}>
                    →
                  </span>
                  <span
                    style={{
                      color: "var(--bpm-success)",
                      fontSize: 14,
                      fontWeight: 500,
                      padding: "4px 8px",
                      borderRadius: "var(--bpm-radius-sm)",
                      background: "color-mix(in srgb, var(--bpm-success) 12%, transparent)",
                    }}
                  >
                    {fmt(c.after)}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      ))}
      {maxItems != null && changes.length > limit && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          style={{
            marginTop: 12,
            padding: 8,
            width: "100%",
            border: "1px solid var(--bpm-border)",
            borderRadius: "var(--bpm-radius)",
            background: "var(--bpm-surface)",
            color: "var(--bpm-accent)",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Voir plus
        </button>
      )}
    </div>
  );
}
