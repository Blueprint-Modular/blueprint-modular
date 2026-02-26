"use client";

import React, { useRef, useEffect } from "react";
import { Button } from "@/components/bpm";

export interface WikiEditorToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  onSave?: () => void;
  onTogglePreview?: () => void;
  showPreview?: boolean;
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
  onSave,
  onTogglePreview,
  showPreview = false,
}: WikiEditorToolbarProps) {
  const colorPopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key === "s") {
        e.preventDefault();
        onSave?.();
      }
      if (mod && e.shiftKey && e.key === "p") {
        e.preventDefault();
        onTogglePreview?.();
      }
      if (mod && e.key === "k") {
        e.preventDefault();
        handleLink();
      }
      if (mod && e.key === "/") {
        e.preventDefault();
        handleCodeBlock();
      }
      if (mod && e.key === "b") {
        e.preventDefault();
        handleBold();
      }
      if (mod && e.key === "i") {
        e.preventDefault();
        handleItalic();
      }
      if (mod && e.shiftKey && e.key === "8") {
        e.preventDefault();
        handleBulletList();
      }
      if (mod && e.shiftKey && e.key === "7") {
        e.preventDefault();
        handleNumberedList();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [disabled, onSave, onTogglePreview]);

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

  /** Insère un préfixe au début de la ligne courante (ex. # , - ). */
  const applyLinePrefix = (prefix: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const newValue = value.slice(0, lineStart) + prefix + value.slice(lineStart);
    onChange(newValue);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(lineStart + prefix.length, lineStart + prefix.length);
    });
  };

  const handleBold = () => applyWrap("**", "**");
  const handleItalic = () => applyWrap("*", "*");
  const handleUnderline = () => applyWrap("<u>", "</u>", "texte");
  const handleStrikethrough = () => applyWrap("~~", "~~");
  const handleCodeInline = () => applyWrap("`", "`", "code");
  const handleHeading = (level: 1 | 2 | 3 | 4) => applyLinePrefix("#".repeat(level) + " ");
  const handleBlockquote = () => applyLinePrefix("> ");
  const handleCodeBlock = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end).trim() || "code";
    const before = "\n```\n";
    const after = "\n```\n";
    const newValue = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(newValue);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };
  const handleLink = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end).trim() || "texte du lien";
    const before = `[${selected}](`;
    const after = ")";
    const newValue = value.slice(0, start) + before + value.slice(end) + after;
    onChange(newValue);
    requestAnimationFrame(() => {
      ta.focus();
      const urlStart = start + before.length;
      ta.setSelectionRange(urlStart, urlStart);
    });
  };
  const handleBulletList = () => applyLinePrefix("- ");
  const handleNumberedList = () => applyLinePrefix("1. ");
  const handleTaskList = () => applyLinePrefix("- [ ] ");
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

  const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const modKey = isMac ? "⌘" : "Ctrl";

  return (
    <div
      className="sticky top-0 z-10 flex flex-wrap items-center gap-1 p-2 rounded-t border border-b-0"
      style={{
        borderColor: "var(--bpm-border)",
        background: "var(--bpm-bg)",
      }}
    >
      {/* Groupe 1 — Historique */}
      <span title={`Annuler (${modKey}+Z)`}>
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={() => document.execCommand("undo")}>
          ↩
        </Button>
      </span>
      <span title={`Rétablir (${modKey}+Shift+Z)`}>
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={() => document.execCommand("redo")}>
          ↪
        </Button>
      </span>
      <span className="w-px self-stretch" style={{ background: "var(--bpm-border)" }} aria-hidden />
      {/* Groupe 2 — Style */}
      <span title="Titre 1">
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={() => handleHeading(1)}>H1</Button>
      </span>
      <span title="Titre 2">
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={() => handleHeading(2)}>H2</Button>
      </span>
      <span title="Titre 3">
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={() => handleHeading(3)}>H3</Button>
      </span>
      <span title="Titre 4">
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={() => handleHeading(4)}>H4</Button>
      </span>
      <span title="Citation">
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={handleBlockquote}>»</Button>
      </span>
      <span className="w-px self-stretch" style={{ background: "var(--bpm-border)" }} aria-hidden />
      {/* Groupe 3 — Caractère */}
      <span title={`Gras (${modKey}+B)`}>
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={handleBold}><strong>G</strong></Button>
      </span>
      <span title={`Italique (${modKey}+I)`}>
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={handleItalic}><em>I</em></Button>
      </span>
      <span title="Souligné">
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={handleUnderline}><u>U</u></Button>
      </span>
      <span title="Barré">
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={handleStrikethrough}><s>S</s></Button>
      </span>
      <span title={`Code inline (${modKey}+E)`}>
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={handleCodeInline}>&lt;/&gt;</Button>
      </span>
      <span className="w-px self-stretch" style={{ background: "var(--bpm-border)" }} aria-hidden />
      {/* Listes */}
      <span title={`Liste à puces (${modKey}+Shift+8)`}>
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={handleBulletList}>•</Button>
      </span>
      <span title={`Liste numérotée (${modKey}+Shift+7)`}>
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={handleNumberedList}>1.</Button>
      </span>
      <span title="Liste de tâches">
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={handleTaskList}>☐</Button>
      </span>
      <span className="w-px self-stretch" style={{ background: "var(--bpm-border)" }} aria-hidden />
      {/* Insertions */}
      <span title={`Lien (${modKey}+K)`}>
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={handleLink}>🔗</Button>
      </span>
      <span title={`Bloc de code (${modKey}+/)`}>
        <Button type="button" variant="outline" size="small" disabled={disabled} onClick={handleCodeBlock}>{"</>"}</Button>
      </span>
      {onTogglePreview && (
        <>
          <span className="w-px self-stretch" style={{ background: "var(--bpm-border)" }} aria-hidden />
          <span title={`Prévisualisation (${modKey}+Shift+P)`}>
            <Button
              type="button"
              variant={showPreview ? "primary" : "outline"}
              size="small"
              disabled={disabled}
              onClick={onTogglePreview}
            >
              {showPreview ? "Éditer" : "Aperçu"}
            </Button>
          </span>
        </>
      )}
      {onSave && (
        <span title={`Sauvegarder (${modKey}+S)`}>
          <Button type="button" variant="outline" size="small" disabled={disabled} onClick={onSave}>
            Sauvegarder
          </Button>
        </span>
      )}
      <span className="w-px self-stretch" style={{ background: "var(--bpm-border)" }} aria-hidden />
      <div className="relative inline-block" ref={colorPopoverRef}>
        <span title="Couleur du texte">
          <Button
            type="button"
            variant="outline"
            size="small"
            disabled={disabled}
            onClick={() => {
              const el = colorPopoverRef.current?.querySelector(".wiki-toolbar-colors");
              if (el instanceof HTMLElement) el.hidden = !el.hidden;
            }}
          >
            <span className="underline" style={{ color: "var(--bpm-accent)" }}>A</span>
          </Button>
        </span>
        <div
          className="wiki-toolbar-colors absolute left-0 top-full mt-1 p-2 rounded border shadow z-10 hidden"
          style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)" }}
        >
          <div className="text-xs mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Couleur</div>
          <div className="flex flex-wrap gap-1">
            {COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                title={c.name}
                className="w-6 h-6 rounded border"
                style={{ borderColor: "var(--bpm-border)", backgroundColor: c.value }}
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
