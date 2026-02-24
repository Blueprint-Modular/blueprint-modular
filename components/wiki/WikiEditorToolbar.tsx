"use client";

import React, { useRef } from "react";
import { Button } from "@/components/bpm";

export interface WikiEditorToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const COLORS = [
  { name: "Rouge", value: "#c62828" },
  { name: "Bleu", value: "#1565c0" },
  { name: "Vert", value: "#2e7d32" },
  { name: "Orange", value: "#e65100" },
  { name: "Violet", value: "#6a1b9a" },
  { name: "Gris", value: "#546e7a" },
];

export function WikiEditorToolbar({
  textareaRef,
  value,
  onChange,
  disabled = false,
}: WikiEditorToolbarProps) {
  const colorPopoverRef = useRef<HTMLDivElement>(null);

  const applyWrap = (before: string, after: string, placeholder?: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end);
    const text = selected || (placeholder ?? "texte");
    const newValue = value.slice(0, start) + before + text + after + value.slice(end);
    const newStart = start + before.length;
    const newEnd = newStart + text.length;
    onChange(newValue);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(newStart, newEnd);
    });
  };

  const handleBold = () => applyWrap("**", "**");
  const handleItalic = () => applyWrap("*", "*");
  const handleColor = (hex: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end) || "texte";
    const before = `<span style="color:${hex}">`;
    const after = "</span>";
    const newValue = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(newValue);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };

  return (
    <div
      className="flex flex-wrap items-center gap-1 p-2 rounded-t border border-b-0"
      style={{
        borderColor: "var(--bpm-border)",
        background: "var(--bpm-bg)",
      }}
    >
      <Button
        type="button"
        variant="outline"
        size="small"
        disabled={disabled}
        onClick={handleBold}
        title="Gras"
      >
        <strong>G</strong>
      </Button>
      <Button
        type="button"
        variant="outline"
        size="small"
        disabled={disabled}
        onClick={handleItalic}
        title="Italique"
      >
        <em>I</em>
      </Button>
      <div className="relative inline-block" ref={colorPopoverRef}>
        <Button
          type="button"
          variant="outline"
          size="small"
          disabled={disabled}
          title="Couleur du texte"
          onClick={() => {
            const el = colorPopoverRef.current?.querySelector(".wiki-toolbar-colors");
            if (el instanceof HTMLElement) el.hidden = !el.hidden;
          }}
        >
          <span className="underline" style={{ color: "var(--bpm-accent)" }}>
            A
          </span>
        </Button>
        <div
          className="wiki-toolbar-colors absolute left-0 top-full mt-1 p-2 rounded border shadow z-10 hidden"
          style={{
            borderColor: "var(--bpm-border)",
            background: "var(--bpm-surface)",
          }}
        >
          <div className="text-xs mb-1" style={{ color: "var(--bpm-text-secondary)" }}>
            Couleur
          </div>
          <div className="flex flex-wrap gap-1">
            {COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                title={c.name}
                className="w-6 h-6 rounded border"
                style={{
                  borderColor: "var(--bpm-border)",
                  backgroundColor: c.value,
                }}
                onClick={() => {
                  handleColor(c.value);
                  const el = colorPopoverRef.current?.querySelector(".wiki-toolbar-colors");
                  if (el instanceof HTMLElement) el.hidden = true;
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
