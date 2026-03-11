"use client";

import React, { useState, useRef } from "react";
import { DatePickerPopover } from "./DatePickerPopover";

function formatDisplay(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(String(date));
  if (isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${day}/${m}/${y}`;
}

export interface DateRangePickerProps {
  label?: string;
  start?: Date | string | null;
  end?: Date | string | null;
  onChange?: (start: Date | null, end: Date | null) => void;
  disabled?: boolean;
  min?: Date | string | null;
  max?: Date | string | null;
}

export function DateRangePicker(p: DateRangePickerProps) {
  const { label, start, end, onChange, disabled = false, min = null, max = null } = p;
  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);
  const startRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const startVal = start ? (start instanceof Date ? start : new Date(String(start))) : null;
  const endVal = end ? (end instanceof Date ? end : new Date(String(end))) : null;
  const minDate = min ? (min instanceof Date ? min : new Date(String(min))) : null;
  const maxDate = max ? (max instanceof Date ? max : new Date(String(max))) : null;

  const triggerStyle = (open: boolean) => ({
    padding: "8px 12px",
    border: "1px solid var(--bpm-border)",
    borderRadius: "var(--bpm-radius)",
    background: "var(--bpm-bg-primary)",
    color: "var(--bpm-text-primary)",
    fontSize: "var(--bpm-font-size-base)",
    cursor: disabled ? "not-allowed" : "pointer",
    flex: 1,
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    borderColor: open ? "var(--bpm-accent)" : "var(--bpm-border)",
    boxShadow: open ? "0 0 0 2px var(--bpm-accent-soft)" : "none",
  } as React.CSSProperties);

  return (
    <div className="bpm-date-range-picker">
      {label && (
        <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
          {label}
        </label>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <div
          ref={startRef}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={() => !disabled && setOpenStart((o) => !o)}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !disabled) {
              e.preventDefault();
              setOpenStart((o) => !o);
            }
          }}
          style={triggerStyle(openStart)}
        >
          <span style={{ color: startVal ? "var(--bpm-text-primary)" : "var(--bpm-text-muted)" }}>
            {formatDisplay(start) || "JJ/MM/AAAA"}
          </span>
          <span style={{ color: "var(--bpm-text-muted)", flexShrink: 0 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
            </svg>
          </span>
        </div>
        <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          –
        </span>
        <div
          ref={endRef}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={() => !disabled && setOpenEnd((o) => !o)}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !disabled) {
              e.preventDefault();
              setOpenEnd((o) => !o);
            }
          }}
          style={triggerStyle(openEnd)}
        >
          <span style={{ color: endVal ? "var(--bpm-text-primary)" : "var(--bpm-text-muted)" }}>
            {formatDisplay(end) || "JJ/MM/AAAA"}
          </span>
          <span style={{ color: "var(--bpm-text-muted)", flexShrink: 0 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
            </svg>
          </span>
        </div>
      </div>
      {openStart && startRef.current && (
        <DatePickerPopover
          anchorRef={startRef}
          value={startVal}
          min={minDate}
          max={maxDate ?? endVal ?? undefined}
          onSelect={(date) => {
            onChange?.(date, endVal);
            setOpenStart(false);
          }}
          onClose={() => setOpenStart(false)}
        />
      )}
      {openEnd && endRef.current && (
        <DatePickerPopover
          anchorRef={endRef}
          value={endVal}
          min={minDate ?? startVal ?? undefined}
          max={maxDate}
          onSelect={(date) => {
            onChange?.(startVal, date);
            setOpenEnd(false);
          }}
          onClose={() => setOpenEnd(false)}
        />
      )}
    </div>
  );
}
