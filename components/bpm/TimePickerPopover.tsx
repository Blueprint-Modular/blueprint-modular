"use client";

import React, { useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export interface TimePickerPopoverProps {
  anchorRef: React.RefObject<HTMLElement | null>;
  value: Date | null;
  onSelect: (hours: number, minutes: number) => void;
  onClose: () => void;
}

export function TimePickerPopover({ anchorRef, value, onSelect, onClose }: TimePickerPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const hours = value ? value.getHours() : 0;
  const minutes = value ? value.getMinutes() : 0;

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
  }, []);

  const listStyle = (selected: boolean): React.CSSProperties => ({
    padding: "6px 12px",
    border: "none",
    borderRadius: "var(--bpm-radius-sm)",
    background: selected ? "var(--bpm-accent)" : "transparent",
    color: selected ? "var(--bpm-accent-contrast)" : "var(--bpm-text)",
    fontSize: 13,
    cursor: "pointer",
    textAlign: "center",
    listStyle: "none",
  });

  const content = (
    <div
      ref={popoverRef}
      role="dialog"
      aria-modal="true"
      className="bpm-time-picker-popover"
      style={{
        position: "fixed",
        zIndex: 10003,
        background: "var(--bpm-bg-primary)",
        border: "1px solid var(--bpm-border)",
        borderRadius: "var(--bpm-radius)",
        boxShadow: "var(--bpm-shadow)",
        padding: 8,
        display: "flex",
        gap: 8,
        maxHeight: 280,
        overflow: "auto",
      }}
    >
      <div style={{ flex: "1 1 0", minWidth: 48 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--bpm-text-muted)", padding: "4px 0", textAlign: "center" }}>
          Heure
        </div>
        <ul style={{ margin: 0, padding: 0, maxHeight: 220, overflowY: "auto" }}>
          {Array.from({ length: 24 }, (_, i) => (
            <li key={i}>
              <button
                type="button"
                style={listStyle(hours === i)}
                onClick={() => onSelect(i, minutes)}
              >
                {String(i).padStart(2, "0")}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div style={{ flex: "1 1 0", minWidth: 48 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--bpm-text-muted)", padding: "4px 0", textAlign: "center" }}>
          Min
        </div>
        <ul style={{ margin: 0, padding: 0, maxHeight: 220, overflowY: "auto" }}>
          {Array.from({ length: 60 }, (_, i) => (
            <li key={i}>
              <button
                type="button"
                style={listStyle(minutes === i)}
                onClick={() => onSelect(hours, i)}
              >
                {String(i).padStart(2, "0")}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  if (!anchorRef.current || typeof document === "undefined") return null;
  return createPortal(content, document.body);
}
