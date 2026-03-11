"use client";

import React, { useState, useRef } from "react";
import { TimePickerPopover } from "./TimePickerPopover";

function toInputValue(d: Date | string | null | undefined): string {
  if (!d) return "";
  if (d instanceof Date) return d.toTimeString().slice(0, 5);
  const m = String(d).match(/(\d{1,2}):(\d{2})/);
  return m ? m[1].padStart(2, "0") + ":" + m[2] : "";
}

export interface TimeInputProps {
  label?: string;
  value?: Date | string | null;
  onChange?: (value: Date | null) => void;
  disabled?: boolean;
  min?: string;
  max?: string;
}

export function TimeInput(p: TimeInputProps) {
  const { label, value, onChange, disabled = false, min, max } = p;
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeVal = value
    ? value instanceof Date
      ? value
      : (() => {
          const [h, m] = String(value).split(":").map(Number);
          const d = new Date();
          d.setHours(isNaN(h) ? 0 : h, isNaN(m) ? 0 : m, 0, 0);
          return d;
        })()
    : null;

  const handleSelect = (hours: number, minutes: number) => {
    const d = new Date();
    d.setHours(hours, minutes, 0, 0);
    onChange?.(d);
    setOpen(false);
  };

  return (
    <div className="bpm-time-input">
      {label && (
        <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
          {label}
        </label>
      )}
      <div
        ref={triggerRef}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) {
            e.preventDefault();
            setOpen((o) => !o);
          }
        }}
        className="w-full px-3 py-2 rounded-lg border text-sm flex items-center justify-between gap-2 cursor-pointer"
        style={{
          borderColor: open ? "var(--bpm-accent)" : "var(--bpm-border)",
          background: "var(--bpm-bg-primary)",
          color: timeVal ? "var(--bpm-text-primary)" : "var(--bpm-text-muted)",
          boxShadow: open ? "0 0 0 2px var(--bpm-accent-soft)" : "none",
        }}
      >
        <span>{toInputValue(value) || "--:--"}</span>
        <span style={{ color: "var(--bpm-text-muted)", flexShrink: 0 }} aria-hidden>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
          </svg>
        </span>
      </div>
      {open && triggerRef.current && (
        <TimePickerPopover
          anchorRef={triggerRef}
          value={timeVal}
          onSelect={handleSelect}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
