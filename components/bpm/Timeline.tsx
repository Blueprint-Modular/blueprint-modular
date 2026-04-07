"use client";

import React, { useMemo, useState } from "react";

/** @deprecated Utilisez TimelineEvent avec la prop `events`. Conservé pour rétrocompatibilité. */
export interface TimelineItem {
  id?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  date?: string;
  status?: "done" | "current" | "upcoming";
}

export interface TimelineEvent {
  date: string;
  title: string;
  description?: string;
  actor?: string;
  icon?: string;
  color?: "default" | "info" | "success" | "warning" | "error";
  metadata?: Record<string, string>;
}

export interface TimelineProps {
  /** Nouvelle API — fil chronologique riche. */
  events?: TimelineEvent[];
  /** Ancienne API — conservée pour compatibilité. */
  items?: TimelineItem[];
  maxItems?: number;
  sortOrder?: "asc" | "desc";
  groupByDate?: boolean;
  className?: string;
}

function parseIso(d: string): number {
  const t = Date.parse(d);
  return Number.isNaN(t) ? 0 : t;
}

function formatEventDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const diffMs = Date.now() - d.getTime();
  const seven = 7 * 24 * 60 * 60 * 1000;
  if (diffMs >= 0 && diffMs < seven) {
    const sec = Math.floor(diffMs / 1000);
    if (sec < 60) return "à l'instant";
    const min = Math.floor(sec / 60);
    if (min < 60) return `il y a ${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `il y a ${h} h`;
    const days = Math.floor(h / 24);
    if (days === 1) return "hier";
    return `il y a ${days} j`;
  }
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function groupLabelForDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startD = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startToday - startD) / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

const EVENT_COLORS: Record<string, { dot: string; ring: string }> = {
  default: { dot: "var(--bpm-accent)", ring: "var(--bpm-surface)" },
  info: { dot: "var(--bpm-info, var(--bpm-accent))", ring: "var(--bpm-surface)" },
  success: { dot: "var(--bpm-success)", ring: "var(--bpm-surface)" },
  warning: { dot: "var(--bpm-warning)", ring: "var(--bpm-surface)" },
  error: { dot: "var(--bpm-error)", ring: "var(--bpm-surface)" },
};

function initial(name: string): string {
  const t = name.trim();
  return t ? t[0]!.toUpperCase() : "?";
}

function itemsToEvents(items: TimelineItem[]): TimelineEvent[] {
  return items.map((it, i) => ({
    date: it.date ?? "",
    title: typeof it.title === "string" ? it.title : String(it.title),
    description: it.description != null ? String(it.description) : undefined,
    color:
      it.status === "done" ? "success" : it.status === "current" ? "info" : "default",
  }));
}

/**
 * @component bpm.timeline
 * @description Frise chronologique verticale (événements ou ancienne prop items).
 */
export function Timeline({
  events: eventsProp,
  items,
  maxItems,
  sortOrder = "desc",
  groupByDate = false,
  className = "",
}: TimelineProps) {
  const [expanded, setExpanded] = useState(false);

  const events = useMemo(() => {
    const raw = eventsProp?.length ? eventsProp : items ? itemsToEvents(items) : [];
    const sorted = [...raw].sort((a, b) => {
      const ta = parseIso(a.date);
      const tb = parseIso(b.date);
      return sortOrder === "desc" ? tb - ta : ta - tb;
    });
    return sorted;
  }, [eventsProp, items, sortOrder]);

  const limit = maxItems ?? events.length;
  const visibleCount = expanded ? events.length : Math.min(limit, events.length);
  const visible = events.slice(0, visibleCount);
  const remaining = events.length - visibleCount;

  const grouped = useMemo(() => {
    if (!groupByDate) return [{ label: null as string | null, evs: visible }];
    const m: { label: string; evs: TimelineEvent[] }[] = [];
    let currentLabel = "";
    for (const ev of visible) {
      const lab = groupLabelForDate(ev.date) || "Date inconnue";
      if (!m.length || lab !== currentLabel) {
        m.push({ label: lab, evs: [ev] });
        currentLabel = lab;
      } else {
        m[m.length - 1]!.evs.push(ev);
      }
    }
    return m.map((g) => ({ label: g.label as string | null, evs: g.evs }));
  }, [visible, groupByDate]);

  return (
    <div className={`bpm-timeline ${className}`.trim()} style={{ color: "var(--bpm-text-primary)" }}>
      <div style={{ position: "relative", paddingLeft: 20 }}>
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 5,
            top: 8,
            bottom: 8,
            width: 2,
            background: "var(--bpm-border)",
            borderRadius: 1,
          }}
        />
        {grouped.map((group, gi) => (
          <React.Fragment key={gi}>
            {group.label && (
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--bpm-text-secondary)",
                  marginBottom: 12,
                  marginTop: gi > 0 ? 20 : 0,
                }}
              >
                {group.label}
              </div>
            )}
            {group.evs.map((ev, i) => {
              const c = EVENT_COLORS[ev.color ?? "default"] ?? EVENT_COLORS.default;
              return (
                <div key={`${ev.date}-${ev.title}-${i}`} style={{ position: "relative", paddingLeft: 20, paddingBottom: 20 }}>
                  <div
                    aria-hidden
                    style={{
                      position: "absolute",
                      left: -7,
                      top: 4,
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: c.dot,
                      border: `2px solid ${c.ring}`,
                      boxSizing: "border-box",
                    }}
                  />
                  <div
                    style={{
                      border: "1px solid var(--bpm-border)",
                      borderRadius: "var(--bpm-radius)",
                      padding: "12px 16px",
                      background: "var(--bpm-surface)",
                      boxShadow: "var(--bpm-shadow-sm)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{ev.title}</div>
                      {ev.icon && (
                        <span
                          className="material-symbols-outlined"
                          aria-hidden
                          style={{ fontFamily: "Material Symbols Outlined", fontSize: 20, color: "var(--bpm-text-secondary)" }}
                        >
                          {ev.icon}
                        </span>
                      )}
                    </div>
                    {ev.date && (
                      <div style={{ fontSize: 12, color: "var(--bpm-text-secondary)", marginTop: 4 }}>{formatEventDate(ev.date)}</div>
                    )}
                    {ev.actor && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                        <div
                          aria-hidden
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            background: "color-mix(in srgb, var(--bpm-accent) 20%, var(--bpm-surface))",
                            color: "var(--bpm-accent)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {initial(ev.actor)}
                        </div>
                        <span style={{ fontSize: 12, color: "var(--bpm-text-secondary)" }}>{ev.actor}</span>
                      </div>
                    )}
                    {ev.description && <div style={{ fontSize: 14, color: "var(--bpm-text-secondary)", marginTop: 10 }}>{ev.description}</div>}
                    {ev.metadata && (
                      <dl style={{ margin: "10px 0 0", display: "grid", gap: 4, fontSize: 12, color: "var(--bpm-text-secondary)" }}>
                        {Object.entries(ev.metadata).map(([k, v]) => (
                          <div key={k} style={{ display: "flex", gap: 8 }}>
                            <dt style={{ margin: 0, fontWeight: 600 }}>{k}</dt>
                            <dd style={{ margin: 0 }}>{v}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      {maxItems != null && remaining > 0 && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          style={{
            marginLeft: 36,
            padding: "8px 14px",
            borderRadius: "var(--bpm-radius)",
            border: "1px solid var(--bpm-border)",
            background: "var(--bpm-surface)",
            color: "var(--bpm-accent)",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Voir {remaining} autre{remaining > 1 ? "s" : ""} événement{remaining > 1 ? "s" : ""}
        </button>
      )}
    </div>
  );
}
