"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Spinner } from "./Spinner";

export type InlineEditType = "text" | "number" | "select";

export interface InlineEditProps {
  value: string | number;
  onSave: (next: string | number) => void | Promise<void>;
  type?: InlineEditType;
  options?: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Texte ou nombre éditable au clic : validation Entrée / blur, annulation Échap.
 */
export function InlineEdit({
  value,
  onSave,
  type = "text",
  options = [],
  placeholder = "",
  disabled = false,
  className = "",
}: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (!editing) setDraft(String(value));
  }, [value, editing]);

  useEffect(() => {
    if (!editing) return;
    if (type === "select") selectRef.current?.focus();
    else inputRef.current?.focus();
  }, [editing, type]);

  const cancel = useCallback(() => {
    setDraft(String(value));
    setEditing(false);
  }, [value]);

  const commit = useCallback(async () => {
    if (disabled || loading) return;
    let next: string | number = draft;
    if (type === "number") {
      const n = Number(draft.replace(",", "."));
      if (Number.isNaN(n)) {
        cancel();
        return;
      }
      next = n;
    }
    const same = type === "number" ? Number(value) === next : String(value) === String(next);
    if (same) {
      setEditing(false);
      return;
    }
    setLoading(true);
    try {
      await Promise.resolve(onSave(next));
      setEditing(false);
    } finally {
      setLoading(false);
    }
  }, [cancel, disabled, draft, loading, onSave, type, value]);

  const display =
    type === "select"
      ? options.find((o) => o.value === String(value))?.label ?? String(value)
      : String(value);

  if (disabled) {
    return (
      <span className={className} style={{ color: "var(--bpm-text-secondary)" }}>
        {display || placeholder || "—"}
      </span>
    );
  }

  return (
    <span
      className={className}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: 28, position: "relative" }}
    >
      {editing ? (
        <>
          {type === "select" ? (
            <select
              ref={selectRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void commit();
                if (e.key === "Escape") cancel();
              }}
              onBlur={() => void commit()}
              disabled={loading}
              style={{
                padding: "4px 8px",
                borderRadius: "var(--bpm-radius-sm)",
                border: "1px solid var(--bpm-border)",
                background: "var(--bpm-surface)",
                color: "var(--bpm-text-primary)",
                fontSize: 14,
              }}
            >
              {options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type={type === "number" ? "text" : "text"}
              inputMode={type === "number" ? "decimal" : undefined}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void commit();
                if (e.key === "Escape") cancel();
              }}
              onBlur={() => void commit()}
              placeholder={placeholder}
              disabled={loading}
              style={{
                padding: "4px 8px",
                borderRadius: "var(--bpm-radius-sm)",
                border: "1px solid var(--bpm-border)",
                background: "var(--bpm-surface)",
                color: "var(--bpm-text-primary)",
                fontSize: 14,
                minWidth: 120,
              }}
            />
          )}
          {loading ? <Spinner size="small" text="" neutral /> : null}
        </>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "2px 6px",
            margin: 0,
            border: "1px solid transparent",
            borderRadius: "var(--bpm-radius-sm)",
            background: "transparent",
            color: "var(--bpm-text-primary)",
            cursor: "pointer",
            font: "inherit",
            textAlign: "left",
          }}
          className="bpm-inline-edit-trigger"
          title="Modifier"
        >
          <span>{display || placeholder || "—"}</span>
          <span className="bpm-inline-edit-pencil" aria-hidden style={{ fontSize: 12 }}>
            ✎
          </span>
        </button>
      )}
      <style>{`
        .bpm-inline-edit-pencil { opacity: 0; transition: opacity 0.15s ease; }
        .bpm-inline-edit-trigger:hover .bpm-inline-edit-pencil { opacity: 0.55; }
        .bpm-inline-edit-trigger:hover { border-color: var(--bpm-border); background: color-mix(in srgb, var(--bpm-accent) 6%, var(--bpm-surface)); }
      `}</style>
    </span>
  );
}
