"use client";

import React, { useState, useRef } from "react";
import { DatePickerPopover } from "./DatePickerPopover";

function toInputValue(date: Date | string | null | undefined): string {
  if (!date) return "";
  if (date instanceof Date) return date.toISOString().split("T")[0];
  return String(date).split("T")[0];
}

function formatDisplay(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(String(date));
  if (isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${day}/${m}/${y}`;
}

export interface DateInputProps {
  label?: string;
  value?: Date | string | null;
  onChange?: (value: Date | null) => void;
  disabled?: boolean;
  help?: string | null;
  min?: Date | string | null;
  max?: Date | string | null;
}

export function DateInput({
  label,
  value,
  onChange,
  disabled = false,
  help = null,
  min = null,
  max = null,
}: DateInputProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dateVal = value ? (value instanceof Date ? value : new Date(String(value))) : null;
  const minDate = min ? (min instanceof Date ? min : new Date(String(min))) : null;
  const maxDate = max ? (max instanceof Date ? max : new Date(String(max))) : null;

  const handleSelect = (date: Date) => {
    onChange?.(date);
    setOpen(false);
  };

  return (
    <div className="bpm-date-input-container">
      {label && (
        <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
          {label}
          {help && <span className="ml-1 opacity-70" title={help}>ⓘ</span>}
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
          color: dateVal ? "var(--bpm-text-primary)" : "var(--bpm-text-muted)",
          boxShadow: open ? "0 0 0 2px var(--bpm-accent-soft)" : "none",
        }}
      >
        <span>{formatDisplay(value) || "JJ/MM/AAAA"}</span>
        <span style={{ color: "var(--bpm-text-muted)", flexShrink: 0 }} aria-hidden>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" />
          </svg>
        </span>
      </div>
      {open && triggerRef.current && (
        <DatePickerPopover
          anchorRef={triggerRef}
          value={dateVal}
          min={minDate}
          max={maxDate}
          onSelect={handleSelect}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
