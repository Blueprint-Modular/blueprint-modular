"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

export interface ContextMenuItem {
  id: string;
  label: string;
  disabled?: boolean;
  onSelect?: () => void;
}

export interface ContextMenuProps {
  items: ContextMenuItem[];
  trigger: React.ReactNode;
  triggerOn?: "contextmenu" | "click";
  className?: string;
}

export function ContextMenu({
  items,
  trigger,
  triggerOn = "contextmenu",
  className = "",
}: ContextMenuProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const close = useCallback(() => setOpen(false), []);

  const openAt = useCallback((clientX: number, clientY: number) => {
    setPos({ x: clientX, y: clientY });
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const m = menuRef.current;
      const w = wrapRef.current;
      if (m?.contains(e.target as Node) || w?.contains(e.target as Node)) return;
      close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const onContext = (e: React.MouseEvent) => {
    if (triggerOn !== "contextmenu") return;
    e.preventDefault();
    openAt(e.clientX, e.clientY);
  };

  const onClick = (e: React.MouseEvent) => {
    if (triggerOn !== "click") return;
    e.preventDefault();
    openAt(e.clientX, e.clientY);
  };

  return (
    <div ref={wrapRef} className={className} style={{ position: "relative", display: "inline-block" }}>
      <div onContextMenu={onContext} onClick={onClick}>
        {trigger}
      </div>
      {open && (
        <div
          ref={menuRef}
          role="menu"
          style={{
            position: "fixed",
            left: pos.x,
            top: pos.y,
            minWidth: 160,
            zIndex: 10000,
            background: "var(--bpm-surface)",
            border: "1px solid var(--bpm-border)",
            borderRadius: "var(--bpm-radius-sm)",
            boxShadow: "var(--bpm-shadow-md)",
            padding: 4,
          }}
        >
          {items.map((it) => (
            <button
              key={it.id}
              type="button"
              role="menuitem"
              disabled={it.disabled}
              onClick={() => {
                if (!it.disabled) {
                  it.onSelect?.();
                  close();
                }
              }}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "8px 12px",
                border: "none",
                background: "transparent",
                color: it.disabled ? "var(--bpm-text-muted)" : "var(--bpm-text-primary)",
                fontSize: "var(--bpm-font-size-base)",
                cursor: it.disabled ? "not-allowed" : "pointer",
                borderRadius: "var(--bpm-radius-sm)",
              }}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
