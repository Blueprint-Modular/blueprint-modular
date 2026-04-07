"use client";

import React, { useId, useMemo } from "react";

const DAY_MS = 24 * 60 * 60 * 1000;

function parseIsoMs(iso: string): number {
  const t = Date.parse(iso);
  return Number.isNaN(t) ? 0 : t;
}

function startOfUtcDay(ms: number): number {
  const d = new Date(ms);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function endOfUtcDay(ms: number): number {
  return startOfUtcDay(ms) + DAY_MS;
}

export type GanttTask = {
  id: string;
  label: string;
  start: string;
  end: string;
  progress?: number;
  color?: string;
  dependencies?: string[];
  group?: string;
};

export type GanttProps = {
  tasks: GanttTask[];
  viewMode: "day" | "week" | "month";
  onTaskClick: (task: GanttTask) => void;
  showDependencies?: boolean;
  todayLine?: boolean;
};

function pixelsPerDayForView(mode: GanttProps["viewMode"]): number {
  if (mode === "day") return 40;
  if (mode === "week") return 28;
  return 12;
}

function padDaysForView(mode: GanttProps["viewMode"]): number {
  if (mode === "day") return 2;
  if (mode === "week") return 7;
  return 31;
}

type DisplayRow = { kind: "group"; label: string } | { kind: "task"; task: GanttTask };

export function Gantt({
  tasks,
  viewMode,
  onTaskClick,
  showDependencies = true,
  todayLine = true,
}: GanttProps) {
  const arrowMarkerId = useId().replace(/:/g, "");
  const labelColWidth = 168;
  const rowHeight = 36;
  const groupRowHeight = 24;
  const barHeight = 20;

  const { displayRows, timelineWidth, barLayouts, todayX, contentHeight } = useMemo(() => {
    const valid = tasks.filter((t) => parseIsoMs(t.end) >= parseIsoMs(t.start));
    const byGroup = [...valid].sort((a, b) => {
      const ga = a.group ?? "";
      const gb = b.group ?? "";
      if (ga !== gb) return ga.localeCompare(gb);
      return a.label.localeCompare(b.label);
    });

    const rows: DisplayRow[] = [];
    let lastG: string | undefined;
    for (const t of byGroup) {
      if (t.group !== undefined && t.group !== lastG) {
        rows.push({ kind: "group", label: t.group });
        lastG = t.group;
      }
      rows.push({ kind: "task", task: t });
    }

    let minMs = Infinity;
    let maxMs = -Infinity;
    for (const t of byGroup) {
      const s = parseIsoMs(t.start);
      const e = parseIsoMs(t.end);
      if (s < minMs) minMs = s;
      if (e > maxMs) maxMs = e;
    }
    if (!Number.isFinite(minMs) || byGroup.length === 0) {
      const now = Date.now();
      minMs = startOfUtcDay(now);
      maxMs = endOfUtcDay(now);
    }

    const pad = padDaysForView(viewMode) * DAY_MS;
    const rangeStartMs = startOfUtcDay(minMs - pad);
    const rangeEndMs = endOfUtcDay(maxMs + pad);
    const rangeMs = Math.max(DAY_MS, rangeEndMs - rangeStartMs);
    const ppd = pixelsPerDayForView(viewMode);
    const timelineWidthPx = Math.max(320, (rangeMs / DAY_MS) * ppd);

    const scaleX = (ms: number): number => ((ms - rangeStartMs) / rangeMs) * timelineWidthPx;

    const layouts = new Map<
      string,
      { left: number; width: number; centerY: number; endX: number; startX: number }
    >();

    let yAcc = 0;
    for (const r of rows) {
      if (r.kind === "group") {
        yAcc += groupRowHeight;
        continue;
      }
      const t = r.task;
      const s = parseIsoMs(t.start);
      const e = parseIsoMs(t.end);
      const left = scaleX(s);
      const right = scaleX(e);
      const width = Math.max(4, right - left);
      const centerY = yAcc + rowHeight / 2;
      layouts.set(t.id, { left, width, centerY, endX: left + width, startX: left });
      yAcc += rowHeight;
    }

    const contentH = rows.reduce((acc, r) => acc + (r.kind === "group" ? groupRowHeight : rowHeight), 0);

    const now = Date.now();
    let tX: number | null = null;
    if (now >= rangeStartMs && now <= rangeEndMs) {
      tX = scaleX(now);
    }

    return {
      displayRows: rows,
      timelineWidth: timelineWidthPx,
      barLayouts: layouts,
      todayX: tX,
      contentHeight: contentH,
    };
  }, [tasks, viewMode, rowHeight, groupRowHeight]);

  const headerHeight = rowHeight;
  const svgHeight = contentHeight;

  const depPaths = useMemo(() => {
    if (!showDependencies) return [] as { d: string; key: string }[];
    const out: { d: string; key: string }[] = [];
    for (const r of displayRows) {
      if (r.kind !== "task") continue;
      const t = r.task;
      if (!t.dependencies?.length) continue;
      const to = barLayouts.get(t.id);
      if (!to) continue;
      for (const depId of t.dependencies) {
        const from = barLayouts.get(depId);
        if (!from) continue;
        const x1 = from.endX;
        const y1 = from.centerY;
        const x2 = to.startX;
        const y2 = to.centerY;
        const mid = x1 + Math.max(16, (x2 - x1) * 0.35);
        const d = `M ${x1} ${y1} L ${mid} ${y1} L ${mid} ${y2} L ${x2 - 4} ${y2}`;
        out.push({ d, key: `${depId}->${t.id}` });
      }
    }
    return out;
  }, [showDependencies, displayRows, barLayouts]);

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
      <div style={{ overflowX: "auto", overflowY: "hidden" }}>
        <div style={{ display: "flex", minWidth: labelColWidth + timelineWidth }}>
          <div
            style={{
              flex: `0 0 ${labelColWidth}px`,
              borderRight: "1px solid var(--bpm-border)",
              background: "var(--bpm-bg-secondary, var(--bpm-surface))",
            }}
          >
            <div
              style={{
                height: headerHeight,
                display: "flex",
                alignItems: "center",
                paddingLeft: 10,
                fontSize: 11,
                fontWeight: 600,
                color: "var(--bpm-text-secondary)",
                borderBottom: "1px solid var(--bpm-border)",
              }}
            >
              Task
            </div>
            {displayRows.map((r, i) =>
              r.kind === "group" ? (
                <div
                  key={`g-${r.label}-${i}`}
                  style={{
                    height: groupRowHeight,
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: 8,
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    color: "var(--bpm-text-secondary)",
                    background: "color-mix(in srgb, var(--bpm-accent) 8%, var(--bpm-surface))",
                    borderBottom: "1px solid var(--bpm-border)",
                    boxSizing: "border-box",
                  }}
                >
                  {r.label}
                </div>
              ) : (
                <div
                  key={r.task.id}
                  style={{
                    height: rowHeight,
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: 10,
                    paddingRight: 8,
                    fontSize: 12,
                    borderBottom: "1px solid var(--bpm-border)",
                    boxSizing: "border-box",
                  }}
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.task.label}
                  </span>
                </div>
              ),
            )}
          </div>

          <div
            style={{
              position: "relative",
              flex: "1 0 auto",
              width: timelineWidth,
              minHeight: headerHeight + svgHeight,
            }}
          >
            <div
              style={{
                height: headerHeight,
                borderBottom: "1px solid var(--bpm-border)",
                background: "var(--bpm-bg-secondary, var(--bpm-surface))",
                fontSize: 10,
                color: "var(--bpm-text-secondary)",
                display: "flex",
                alignItems: "center",
                paddingLeft: 8,
              }}
            >
              Timeline
            </div>

            <div style={{ position: "relative", width: timelineWidth, minHeight: svgHeight }}>
              {showDependencies && depPaths.length > 0 && (
                <svg
                  width={timelineWidth}
                  height={svgHeight}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    pointerEvents: "none",
                    overflow: "visible",
                  }}
                  aria-hidden
                >
                  <defs>
                    <marker
                      id={arrowMarkerId}
                      markerWidth="8"
                      markerHeight="8"
                      refX="6"
                      refY="4"
                      orient="auto"
                      markerUnits="strokeWidth"
                    >
                      <path d="M0,0 L0,8 L8,4 z" fill="var(--bpm-border)" />
                    </marker>
                  </defs>
                  {depPaths.map((p) => (
                    <path
                      key={p.key}
                      d={p.d}
                      fill="none"
                      stroke="var(--bpm-border)"
                      strokeWidth={1.5}
                      markerEnd={`url(#${arrowMarkerId})`}
                    />
                  ))}
                </svg>
              )}

              {todayLine && todayX !== null && (
                <div
                  style={{
                    position: "absolute",
                    left: todayX,
                    top: 0,
                    width: 2,
                    height: svgHeight,
                    background: "var(--bpm-accent)",
                    opacity: 0.85,
                    pointerEvents: "none",
                    zIndex: 2,
                  }}
                />
              )}

              {displayRows.map((r, i) => {
                if (r.kind !== "task") return null;
                const t = r.task;
                const layout = barLayouts.get(t.id);
                if (!layout) return null;
                const pct = Math.min(100, Math.max(0, t.progress ?? 0));
                const bg = t.color ?? "var(--bpm-accent)";
                let yOffset = 0;
                for (let j = 0; j < i; j++) {
                  const row = displayRows[j];
                  yOffset += row.kind === "group" ? groupRowHeight : rowHeight;
                }
                return (
                  <div
                    key={t.id}
                    style={{
                      position: "absolute",
                      left: layout.left,
                      top: yOffset + (rowHeight - barHeight) / 2,
                      width: layout.width,
                      height: barHeight,
                      borderRadius: "var(--bpm-radius-sm)",
                      background: "color-mix(in srgb, var(--bpm-border) 35%, var(--bpm-surface))",
                      border: "1px solid var(--bpm-border)",
                      cursor: "pointer",
                      boxSizing: "border-box",
                      overflow: "hidden",
                      zIndex: 1,
                    }}
                    role="button"
                    tabIndex={0}
                    onClick={() => onTaskClick(t)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onTaskClick(t);
                      }
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: bg,
                        transition: "width 0.2s ease",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
