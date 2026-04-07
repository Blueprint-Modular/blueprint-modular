"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface Command {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  shortcut?: string;
  category?: string;
  action: () => void;
}

export interface CommandPaletteProps {
  commands: Command[];
  /** Mode contrôlé : si défini, l’ouverture au clavier doit être gérée via `onRequestOpen`. */
  isOpen?: boolean;
  onClose: () => void;
  /** Appelé sur Cmd/Ctrl+K lorsque `isOpen` est fourni (mode contrôlé). */
  onRequestOpen?: () => void;
  placeholder?: string;
  className?: string;
}

function fuzzyMatch(query: string, text: string): boolean {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

function commandHaystack(c: Command): string {
  return `${c.label} ${c.description ?? ""} ${c.category ?? ""}`;
}

/**
 * @component bpm.commandPalette
 * @description Palette de commandes modale (recherche floue, clavier).
 */
export function CommandPalette({
  commands,
  isOpen: isOpenProp,
  onClose,
  onRequestOpen,
  placeholder = "Rechercher une action...",
  className = "",
}: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const controlled = typeof isOpenProp === "boolean";
  const open = controlled ? isOpenProp : internalOpen;
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => {
    if (!controlled) setInternalOpen(false);
    setQuery("");
    setActive(0);
    onClose();
  }, [controlled, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return commands;
    return commands.filter((c) => fuzzyMatch(q, commandHaystack(c)));
  }, [commands, query]);

  const grouped = useMemo(() => {
    const byCat = new Map<string, Command[]>();
    for (const c of filtered) {
      const cat = c.category ?? "";
      if (!byCat.has(cat)) byCat.set(cat, []);
      byCat.get(cat)!.push(c);
    }
    const keys = [...byCat.keys()].sort((a, b) => a.localeCompare(b));
    const flat: { cmd: Command; flatIndex: number }[] = [];
    let idx = 0;
    for (const k of keys) {
      for (const cmd of byCat.get(k)!) {
        flat.push({ cmd, flatIndex: idx++ });
      }
    }
    return { keys, byCat, flat };
  }, [filtered]);

  useEffect(() => {
    setActive(0);
  }, [query, open]);

  useEffect(() => {
    if (!open) return;
    const t = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(t);
  }, [open]);

  useEffect(() => {
    const onOpenShortcut = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "k") return;
      e.preventDefault();
      if (controlled) onRequestOpen?.();
      else setInternalOpen(true);
    };
    window.addEventListener("keydown", onOpenShortcut);
    return () => window.removeEventListener("keydown", onOpenShortcut);
  }, [controlled, onRequestOpen]);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, close]);

  const runIndex = (flatIndex: number) => {
    const item = grouped.flat[flatIndex];
    if (!item) return;
    item.cmd.action();
    close();
  };

  const onPaletteKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, Math.max(grouped.flat.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      runIndex(active);
    }
  };

  if (!open) return null;

  return (
    <div
      className={`bpm-command-palette ${className}`.trim()}
      role="dialog"
      aria-modal="true"
      aria-label="Palette de commandes"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: "12vh",
        background: "color-mix(in srgb, var(--bpm-text-primary) 35%, transparent)",
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <style>{`
        @keyframes bpm-cp-open {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .bpm-command-palette-panel {
          animation: bpm-cp-open 0.15s ease forwards;
        }
      `}</style>
      <div
        className="bpm-command-palette-panel"
        style={{
          width: "min(560px, calc(100vw - 24px))",
          maxHeight: "min(70vh, 520px)",
          display: "flex",
          flexDirection: "column",
          borderRadius: "var(--bpm-radius)",
          border: "1px solid var(--bpm-border)",
          background: "var(--bpm-surface)",
          boxShadow: "var(--bpm-shadow-md)",
          overflow: "hidden",
        }}
        onKeyDown={onPaletteKeyDown}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderBottom: "1px solid var(--bpm-border)" }}>
          <span className="material-symbols-outlined" aria-hidden style={{ color: "var(--bpm-text-secondary)", fontSize: 22 }}>
            search
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: 16,
              background: "transparent",
              color: "var(--bpm-text-primary)",
            }}
          />
        </div>
        <div
          role="listbox"
          aria-activedescendant={grouped.flat[active] ? `bpm-cmd-${grouped.flat[active]!.flatIndex}` : undefined}
          style={{ overflowY: "auto", flex: 1 }}
        >
          {(() => {
            let running = 0;
            return grouped.keys.map((cat) => (
              <div key={cat || "__default"}>
                {cat ? (
                  <div style={{ padding: "8px 14px 4px", fontSize: 11, fontWeight: 700, color: "var(--bpm-text-secondary)", textTransform: "uppercase" }}>
                    {cat}
                  </div>
                ) : null}
                {grouped.byCat.get(cat)!.map((cmd) => {
                  const flatIndex = running++;
                  const isActive = flatIndex === active;
                  return (
                    <button
                      key={cmd.id}
                      type="button"
                      role="option"
                      id={`bpm-cmd-${flatIndex}`}
                      aria-selected={isActive}
                      onMouseEnter={() => setActive(flatIndex)}
                      onClick={() => runIndex(flatIndex)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 14px",
                        border: "none",
                        textAlign: "left",
                        cursor: "pointer",
                        background: isActive ? "color-mix(in srgb, var(--bpm-accent) 10%, var(--bpm-surface))" : "transparent",
                        color: "var(--bpm-text-primary)",
                      }}
                    >
                      {cmd.icon ? (
                        <span
                          className="material-symbols-outlined"
                          aria-hidden
                          style={{ fontSize: 20, color: "var(--bpm-text-secondary)", width: 24, textAlign: "center" }}
                        >
                          {cmd.icon}
                        </span>
                      ) : (
                        <span style={{ width: 24 }} />
                      )}
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontWeight: 500, display: "block" }}>{cmd.label}</span>
                        {cmd.description && (
                          <span style={{ fontSize: 12, color: "var(--bpm-text-secondary)", display: "block", marginTop: 2 }}>{cmd.description}</span>
                        )}
                      </span>
                      {cmd.shortcut && (
                        <kbd
                          style={{
                            fontSize: 11,
                            fontFamily: "ui-monospace, monospace",
                            padding: "2px 6px",
                            borderRadius: 4,
                            border: "1px solid var(--bpm-border)",
                            background: "var(--bpm-bg-app, var(--bpm-bg-secondary))",
                            color: "var(--bpm-text-secondary)",
                          }}
                        >
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ));
          })()}
          {filtered.length === 0 && (
            <div style={{ padding: 24, textAlign: "center", color: "var(--bpm-text-secondary)", fontSize: 14 }}>Aucune commande</div>
          )}
        </div>
      </div>
    </div>
  );
}
