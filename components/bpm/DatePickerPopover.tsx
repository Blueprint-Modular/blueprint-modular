"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS = "Janvier Février Mars Avril Mai Juin Juillet Août Septembre Octobre Novembre Décembre".split(" ");

function toYMD(d: Date): string {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

export interface DatePickerPopoverProps {
  anchorRef: React.RefObject<HTMLElement | null>;
  value: Date | null;
  min?: Date | null;
  max?: Date | null;
  onSelect: (date: Date) => void;
  onClose: () => void;
}

export function DatePickerPopover({ anchorRef, value, min, max, onSelect, onClose }: DatePickerPopoverProps) {
  const [viewMonth, setViewMonth] = useState(() => {
    const d = value ? new Date(value) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onClickOutside = (e: MouseEvent) => {
      const el = popoverRef.current;
      const anchor = anchorRef.current;
      if (el && anchor && !el.contains(e.target as Node) && !anchor.contains(e.target as Node)) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClickOutside, true);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickOutside, true);
    };
  }, [onClose, anchorRef]);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const first = new Date(year, month, 1);
  const firstDay = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const valueYMD = value ? toYMD(value) : null;
  const minYMD = min ? toYMD(min) : null;
  const maxYMD = max ? toYMD(max) : null;

  const cells: { date: Date; ymd: string; isCurrent: boolean; disabled: boolean }[] = [];
  for (let i = 0; i < firstDay; i++) {
    const d = prevMonthDays - firstDay + 1 + i;
    const date = new Date(year, month - 1, d);
    const ymd = toYMD(date);
    const disabled = !!(minYMD && ymd < minYMD) || !!(maxYMD && ymd > maxYMD);
    cells.push({ date, ymd, isCurrent: false, disabled });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const ymd = toYMD(date);
    const disabled = !!(minYMD && ymd < minYMD) || !!(maxYMD && ymd > maxYMD);
    cells.push({ date, ymd, isCurrent: true, disabled });
  }
  const rest = 42 - cells.length;
  for (let i = 0; i < rest; i++) {
    const date = new Date(year, month + 1, i + 1);
    const ymd = toYMD(date);
    const disabled = !!(minYMD && ymd < minYMD) || !!(maxYMD && ymd > maxYMD);
    cells.push({ date, ymd, isCurrent: false, disabled });
  }

  const updatePosition = () => {
    const el = popoverRef.current;
    const anchor = anchorRef.current;
    if (!el || !anchor) return;
    const r = anchor.getBoundingClientRect();
    el.style.left = `${r.left}px`;
    el.style.top = `${r.bottom + 6}px`;
  };

  useEffect(() => {
    updatePosition();
    const t = setTimeout(updatePosition, 0);
    return () => clearTimeout(t);
  }, [viewMonth]);

  const prevMonth = () => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const nextMonth = () => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));

  const content = (
    <div
      ref={popoverRef}
      role="dialog"
      aria-modal="true"
      className="bpm-date-picker-popover"
      style={{
        position: "fixed",
        zIndex: 10003,
        background: "var(--bpm-bg-primary)",
        border: "1px solid var(--bpm-border)",
        borderRadius: "var(--bpm-radius)",
        boxShadow: "var(--bpm-shadow)",
        padding: 12,
        minWidth: 280,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <button
          type="button"
          onClick={prevMonth}
          aria-label="Mois précédent"
          style={{
            padding: "4px 8px",
            border: "none",
            background: "transparent",
            color: "var(--bpm-text)",
            cursor: "pointer",
            borderRadius: "var(--bpm-radius-sm)",
          }}
        >
          ‹
        </button>
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--bpm-text)" }}>
          {MONTHS[month]} {year}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          aria-label="Mois suivant"
          style={{
            padding: "4px 8px",
            border: "none",
            background: "transparent",
            color: "var(--bpm-text)",
            cursor: "pointer",
            borderRadius: "var(--bpm-radius-sm)",
          }}
        >
          ›
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, textAlign: "center" }}>
        {WEEKDAYS.map((w) => (
          <div key={w} style={{ fontSize: 11, fontWeight: 600, color: "var(--bpm-text-muted)", padding: "4px 0" }}>
            {w}
          </div>
        ))}
        {cells.map(({ date, ymd, isCurrent, disabled }) => {
          const selected = valueYMD === ymd;
          return (
            <button
              key={ymd}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onSelect(date)}
              style={{
                padding: "6px 0",
                border: "none",
                borderRadius: "var(--bpm-radius-sm)",
                background: selected ? "var(--bpm-accent)" : "transparent",
                color: selected ? "var(--bpm-accent-contrast)" : isCurrent ? "var(--bpm-text)" : "var(--bpm-text-muted)",
                fontSize: 13,
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.5 : 1,
              }}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );

  const anchor = anchorRef.current;
  if (!anchor || typeof document === "undefined") return null;
  return createPortal(content, document.body);
}
