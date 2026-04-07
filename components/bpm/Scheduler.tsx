"use client";

import React, { useMemo, useState } from "react";

const DAY_MS = 24 * 60 * 60 * 1000;

function parseMs(iso: string): number {
  const t = Date.parse(iso);
  return Number.isNaN(t) ? 0 : t;
}

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function startOfWeekMonday(d: Date): Date {
  const s = startOfLocalDay(d);
  const day = s.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(s, diff);
}

function daysInMonth(y: number, m: number): number {
  return new Date(y, m + 1, 0).getDate();
}

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export type SchedulerEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  resourceId?: string;
  color?: string;
};

export type SchedulerResource = {
  id: string;
  label: string;
};

export type SchedulerProps = {
  view: "day" | "week" | "month";
  events: SchedulerEvent[];
  resources?: SchedulerResource[];
  onEventClick: (ev: SchedulerEvent) => void;
  onSlotClick: (dayStart: Date, hour: number) => void;
  startHour?: number;
  endHour?: number;
};

function resourceLabel(resources: SchedulerResource[] | undefined, id: string | undefined): string | undefined {
  if (!resources || !id) return undefined;
  return resources.find((r) => r.id === id)?.label;
}

export function Scheduler({
  view,
  events,
  resources,
  onEventClick,
  onSlotClick,
  startHour = 8,
  endHour = 20,
}: SchedulerProps) {
  const [anchor, setAnchor] = useState(() => startOfLocalDay(new Date()));
  const hourCount = Math.max(1, endHour - startHour);
  const hourRowPx = 44;
  const headerCellH = 36;

  const hourSlots = useMemo(() => {
    const slots: number[] = [];
    for (let h = startHour; h < endHour; h += 1) slots.push(h);
    return slots;
  }, [startHour, endHour]);

  const visibleDays = useMemo(() => {
    if (view === "day") return [startOfLocalDay(anchor)];
    if (view === "week") {
      const start = startOfWeekMonday(anchor);
      return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }
    const y = anchor.getFullYear();
    const m = anchor.getMonth();
    const first = new Date(y, m, 1);
    const last = daysInMonth(y, m);
    const startWeekday = (first.getDay() + 6) % 7;
    const cells: Date[] = [];
    const pad = startWeekday;
    for (let i = 0; i < pad; i += 1) {
      cells.push(addDays(first, i - pad));
    }
    for (let d = 1; d <= last; d += 1) {
      cells.push(new Date(y, m, d));
    }
    while (cells.length % 7 !== 0 || cells.length < 42) {
      const lastCell = cells[cells.length - 1];
      cells.push(addDays(lastCell, 1));
    }
    return cells;
  }, [anchor, view]);

  const rangeBounds = useMemo(() => {
    if (view === "month") {
      const y = anchor.getFullYear();
      const m = anchor.getMonth();
      const startMs = new Date(y, m, 1).getTime();
      const lastDay = new Date(y, m + 1, 0);
      const endMs = startOfLocalDay(lastDay).getTime() + DAY_MS;
      return { start: startMs, end: endMs };
    }
    const d0 = visibleDays[0];
    const d1 = visibleDays[visibleDays.length - 1];
    return { start: startOfLocalDay(d0).getTime(), end: startOfLocalDay(d1).getTime() + DAY_MS };
  }, [visibleDays, view, anchor]);

  const eventsForView = useMemo(() => {
    return events.filter((e) => {
      const s = parseMs(e.start);
      const en = parseMs(e.end);
      return en > rangeBounds.start && s < rangeBounds.end;
    });
  }, [events, rangeBounds.start, rangeBounds.end]);

  const goPrev = () => {
    if (view === "day") setAnchor((a) => addDays(a, -1));
    else if (view === "week") setAnchor((a) => addDays(a, -7));
    else setAnchor((a) => new Date(a.getFullYear(), a.getMonth() - 1, 1));
  };

  const goNext = () => {
    if (view === "day") setAnchor((a) => addDays(a, 1));
    else if (view === "week") setAnchor((a) => addDays(a, 7));
    else setAnchor((a) => new Date(a.getFullYear(), a.getMonth() + 1, 1));
  };

  const goToday = () => {
    setAnchor(startOfLocalDay(new Date()));
  };

  const titleText = useMemo(() => {
    if (view === "day") {
      return anchor.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    }
    if (view === "week") {
      const s = startOfWeekMonday(anchor);
      const e = addDays(s, 6);
      return `${s.toLocaleDateString(undefined, { day: "numeric", month: "short" })} – ${e.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}`;
    }
    return anchor.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  }, [anchor, view]);

  const btnStyle: React.CSSProperties = {
    padding: "6px 12px",
    fontSize: 12,
    borderRadius: "var(--bpm-radius-sm)",
    border: "1px solid var(--bpm-border)",
    background: "var(--bpm-surface)",
    color: "var(--bpm-text-primary)",
    cursor: "pointer",
  };

  if (view === "month") {
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            padding: 10,
            borderBottom: "1px solid var(--bpm-border)",
            background: "var(--bpm-bg-secondary, var(--bpm-surface))",
          }}
        >
          <div style={{ display: "flex", gap: 6 }}>
            <button type="button" style={btnStyle} onClick={goPrev}>
              Prev
            </button>
            <button type="button" style={btnStyle} onClick={goToday}>
              Today
            </button>
            <button type="button" style={btnStyle} onClick={goNext}>
              Next
            </button>
          </div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{titleText}</div>
          <div style={{ width: 120 }} />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
            gap: 0,
            borderBottom: "1px solid var(--bpm-border)",
          }}
        >
          {WEEKDAY_LABELS.map((w) => (
            <div
              key={w}
              style={{
                textAlign: "center",
                fontSize: 11,
                fontWeight: 600,
                color: "var(--bpm-text-secondary)",
                padding: 8,
                borderRight: "1px solid var(--bpm-border)",
              }}
            >
              {w}
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}>
          {visibleDays.map((day, idx) => {
            const inMonth = day.getMonth() === anchor.getMonth();
            const dayStart = startOfLocalDay(day).getTime();
            const dayEnd = dayStart + DAY_MS;
            const dayEvents = eventsForView.filter((e) => {
              const s = parseMs(e.start);
              const en = parseMs(e.end);
              return en > dayStart && s < dayEnd;
            });
            return (
              <div
                key={`${dayStart}-${idx}`}
                style={{
                  minHeight: 96,
                  borderRight: "1px solid var(--bpm-border)",
                  borderBottom: "1px solid var(--bpm-border)",
                  padding: 6,
                  background: inMonth ? "var(--bpm-surface)" : "color-mix(in srgb, var(--bpm-border) 12%, var(--bpm-surface))",
                  cursor: "pointer",
                }}
                role="button"
                tabIndex={0}
                onClick={() => onSlotClick(startOfLocalDay(day), startHour)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSlotClick(startOfLocalDay(day), startHour);
                  }
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: inMonth ? 600 : 400,
                    color: inMonth ? "var(--bpm-text-primary)" : "var(--bpm-text-secondary)",
                    marginBottom: 6,
                  }}
                >
                  {day.getDate()}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {dayEvents.map((ev) => {
                    const rl = resourceLabel(resources, ev.resourceId);
                    const chipBg = ev.color ?? "color-mix(in srgb, var(--bpm-accent) 22%, var(--bpm-surface))";
                    return (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(ev);
                        }}
                        style={{
                          textAlign: "left",
                          fontSize: 10,
                          padding: "4px 6px",
                          borderRadius: "var(--bpm-radius-sm)",
                          border: "1px solid var(--bpm-border)",
                          background: chipBg,
                          color: "var(--bpm-text-primary)",
                          cursor: "pointer",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {ev.title}
                        {rl ? ` · ${rl}` : ""}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const colCount = view === "week" ? 7 : 1;
  const gridMinHeight = headerCellH + hourCount * hourRowPx;

  return (
    <div
      style={{
        border: "1px solid var(--bpm-border)",
        borderRadius: "var(--bpm-radius)",
        background: "var(--bpm-surface)",
        color: "var(--bpm-text-primary)",
        overflow: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: 10,
          borderBottom: "1px solid var(--bpm-border)",
          background: "var(--bpm-bg-secondary, var(--bpm-surface))",
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          <button type="button" style={btnStyle} onClick={goPrev}>
            Prev
          </button>
          <button type="button" style={btnStyle} onClick={goToday}>
            Today
          </button>
          <button type="button" style={btnStyle} onClick={goNext}>
            Next
          </button>
        </div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{titleText}</div>
        <div style={{ width: 120 }} />
      </div>

      <div style={{ display: "flex", minWidth: colCount * 120, minHeight: gridMinHeight }}>
        <div style={{ width: 48, flexShrink: 0, borderRight: "1px solid var(--bpm-border)" }}>
          <div style={{ height: headerCellH, borderBottom: "1px solid var(--bpm-border)" }} />
          {hourSlots.map((h) => (
            <div
              key={h}
              style={{
                height: hourRowPx,
                fontSize: 10,
                color: "var(--bpm-text-secondary)",
                paddingRight: 6,
                textAlign: "right",
                borderBottom: "1px solid var(--bpm-border)",
                boxSizing: "border-box",
              }}
            >
              {`${h}:00`}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flex: 1, position: "relative" }}>
          {visibleDays.map((day, colIdx) => {
            const dayStart = startOfLocalDay(day).getTime();
            const dayEnd = dayStart + DAY_MS;
            return (
              <div
                key={`${dayStart}-${colIdx}`}
                style={{
                  flex: 1,
                  minWidth: 0,
                  borderRight: colIdx < visibleDays.length - 1 ? "1px solid var(--bpm-border)" : undefined,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    height: headerCellH,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--bpm-text-secondary)",
                    borderBottom: "1px solid var(--bpm-border)",
                  }}
                >
                  {view === "week"
                    ? `${WEEKDAY_LABELS[(day.getDay() + 6) % 7]} ${day.getDate()}`
                    : day.toLocaleDateString(undefined, { weekday: "short", day: "numeric" })}
                </div>
                <div style={{ position: "relative", height: hourCount * hourRowPx }}>
                  {hourSlots.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => onSlotClick(startOfLocalDay(day), h)}
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: (h - startHour) * hourRowPx,
                        height: hourRowPx,
                        border: "none",
                        borderBottom: "1px solid var(--bpm-border)",
                        background: "transparent",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    />
                  ))}
                  {eventsForView
                    .filter((ev) => {
                      const s = parseMs(ev.start);
                      return s >= dayStart && s < dayEnd;
                    })
                    .map((ev) => {
                      const s = parseMs(ev.start);
                      const en = parseMs(ev.end);
                      const startD = new Date(s);
                      const minsFromStart = (startD.getHours() * 60 + startD.getMinutes() - startHour * 60) / 60;
                      const durH = Math.max(0.25, (en - s) / (60 * 60 * 1000));
                      const top = Math.max(0, minsFromStart * hourRowPx);
                      const height = Math.max(18, durH * hourRowPx - 2);
                      const rl = resourceLabel(resources, ev.resourceId);
                      const bg = ev.color ?? "color-mix(in srgb, var(--bpm-accent) 28%, var(--bpm-surface))";
                      return (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(ev);
                          }}
                          style={{
                            position: "absolute",
                            left: 4,
                            right: 4,
                            top,
                            height,
                            borderRadius: "var(--bpm-radius-sm)",
                            border: "1px solid var(--bpm-border)",
                            background: bg,
                            color: "var(--bpm-text-primary)",
                            fontSize: 10,
                            textAlign: "left",
                            padding: "4px 6px",
                            overflow: "hidden",
                            cursor: "pointer",
                            zIndex: 1,
                            boxSizing: "border-box",
                          }}
                        >
                          <div style={{ fontWeight: 600 }}>{ev.title}</div>
                          {rl && <div style={{ color: "var(--bpm-text-secondary)", marginTop: 2 }}>{rl}</div>}
                        </button>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
