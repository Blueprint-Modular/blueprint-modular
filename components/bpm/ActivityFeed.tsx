"use client";

import React from "react";

export interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  icon?: string;
  color?: "default" | "info" | "success" | "warning" | "error";
}

export interface ActivityFeedProps {
  activities: ActivityItem[];
  maxItems?: number;
  onLoadMore?: () => void;
  emptyMessage?: string;
  compact?: boolean;
  className?: string;
}

function formatActivityTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const diffMs = Date.now() - d.getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return "à l'instant";
  const min = Math.floor(sec / 60);
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const days = Math.floor(h / 24);
  if (days === 1) return "hier";
  if (days < 7) return `il y a ${days} j`;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function colorFor(color: ActivityItem["color"]): string {
  switch (color) {
    case "info":
      return "var(--bpm-info, var(--bpm-accent))";
    case "success":
      return "var(--bpm-success)";
    case "warning":
      return "var(--bpm-warning)";
    case "error":
      return "var(--bpm-error)";
    default:
      return "var(--bpm-accent)";
  }
}

function initial(name: string): string {
  const t = name.trim();
  return t ? t[0]!.toUpperCase() : "?";
}

/**
 * @component bpm.activityFeed
 * @description Flux d'activité compact avec avatars initiaux.
 */
export function ActivityFeed({
  activities,
  maxItems,
  onLoadMore,
  emptyMessage = "Aucune activité récente.",
  compact = false,
  className = "",
}: ActivityFeedProps) {
  const limit = maxItems ?? activities.length;
  const visible = activities.slice(0, limit);
  const hasMore = maxItems != null && activities.length > maxItems;
  const fs = compact ? 13 : 14;
  const py = compact ? 8 : 12;

  if (activities.length === 0) {
    return (
      <div
        className={`bpm-activity-feed ${className}`.trim()}
        role="status"
        style={{
          textAlign: "center",
          padding: 32,
          color: "var(--bpm-text-secondary)",
          border: "1px dashed var(--bpm-border)",
          borderRadius: "var(--bpm-radius)",
        }}
      >
        <span className="material-symbols-outlined" aria-hidden style={{ fontSize: 36, opacity: 0.5, display: "block", marginBottom: 8 }}>
          history
        </span>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`bpm-activity-feed ${className}`.trim()} role="feed" aria-label="Fil d'activité">
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {visible.map((a) => (
          <li key={a.id}>
            <article
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: `${py}px 10px`,
                fontSize: fs,
                borderRadius: "var(--bpm-radius-sm)",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "color-mix(in srgb, var(--bpm-accent) 6%, var(--bpm-surface))";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <div
                aria-hidden
                style={{
                  width: compact ? 24 : 28,
                  height: compact ? 24 : 28,
                  borderRadius: "50%",
                  background: colorFor(a.color),
                  color: "var(--bpm-accent-contrast)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: compact ? 11 : 12,
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {initial(a.actor)}
              </div>
              <p style={{ margin: 0, flex: 1, color: "var(--bpm-text-primary)", lineHeight: 1.4 }}>
                <strong>{a.actor}</strong> {a.action} {a.target}{" "}
                <span style={{ color: "var(--bpm-text-secondary)" }}>· {formatActivityTime(a.timestamp)}</span>
              </p>
              {a.icon && (
                <span
                  className="material-symbols-outlined"
                  aria-hidden
                  style={{
                    fontFamily: "Material Symbols Outlined",
                    fontSize: 20,
                    color: "var(--bpm-text-secondary)",
                  }}
                >
                  {a.icon}
                </span>
              )}
            </article>
          </li>
        ))}
      </ul>
      {hasMore && onLoadMore && (
        <button
          type="button"
          onClick={onLoadMore}
          style={{
            marginTop: 8,
            width: "100%",
            padding: "10px",
            border: "1px solid var(--bpm-border)",
            borderRadius: "var(--bpm-radius)",
            background: "var(--bpm-surface)",
            color: "var(--bpm-accent)",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Charger plus
        </button>
      )}
    </div>
  );
}
