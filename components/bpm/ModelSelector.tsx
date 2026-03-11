"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export interface ModelOption {
  id: string;
  label: string;
  provider: string;
  capabilities?: string[];
  contextWindow?: number;
}

export interface ModelSelectorProps {
  models: ModelOption[];
  selected: string;
  onChange: (modelId: string) => void;
  showCapabilities?: boolean;
  className?: string;
}

export function ModelSelector({
  models,
  selected,
  onChange,
  showCapabilities = true,
  className = "",
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement>(null);

  const selectedModel = models.find((m) => m.id === selected);
  const byProvider = models.reduce<Record<string, ModelOption[]>>((acc, m) => {
    if (!acc[m.provider]) acc[m.provider] = [];
    acc[m.provider].push(m);
    return acc;
  }, {});

  useEffect(() => {
    if (!open) {
      setDropdownStyle({});
      return;
    }
    const update = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
        setDropdownStyle({
          position: "fixed",
          top: rect.bottom + 4,
          left: rect.left,
          minWidth: Math.max(280, rect.width),
          maxWidth: typeof window !== "undefined" ? Math.min(400, window.innerWidth - rect.left - 16) : 400,
          maxHeight: typeof window !== "undefined" ? Math.min(320, window.innerHeight - rect.bottom - 16) : 320,
          overflowY: "auto",
          overflowX: "hidden",
          border: "1px solid var(--bpm-border)",
          borderRadius: "var(--bpm-radius)",
          background: "var(--bpm-bg-primary)",
          boxShadow: "var(--bpm-shadow)",
          zIndex: 9999,
        });
    };
    const t = setTimeout(update, 10);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, models.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    if (open) {
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }
  }, [open]);

  const dropdownContent =
    open &&
    typeof document !== "undefined" && (
      <>
        <div
          role="presentation"
          style={{ position: "fixed", inset: 0, zIndex: 9998 }}
          onClick={() => setOpen(false)}
        />
        <div
          style={{ ...dropdownStyle }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div style={{ overflow: "hidden", borderRadius: "inherit" }}>
            {Object.entries(byProvider).map(([provider, list]) => (
              <div key={provider}>
                <div
                  style={{
                    padding: "6px 12px",
                    fontSize: "10px",
                    fontWeight: 600,
                    color: "var(--bpm-text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    background: "var(--bpm-bg-secondary)",
                  }}
                >
                  {provider}
                </div>
                {list.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      onChange(m.id);
                      setOpen(false);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 12px",
                      border: "none",
                      background: m.id === selected ? "var(--bpm-bg-secondary)" : "transparent",
                      color: "var(--bpm-text)",
                      fontSize: "var(--bpm-font-size-base)",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontWeight: m.id === selected ? 600 : 400 }}>{m.label}</div>
                    {showCapabilities && (m.capabilities?.length ?? 0) > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 4,
                          marginTop: 4,
                          fontSize: "var(--bpm-font-size-sm)",
                          color: "var(--bpm-text-muted)",
                        }}
                      >
                        {m.capabilities!.map((c) => (
                          <span
                            key={c}
                            style={{
                              padding: "2px 6px",
                              borderRadius: "var(--bpm-radius-sm)",
                              background: "var(--bpm-bg-tertiary)",
                            }}
                          >
                            {c}
                          </span>
                        ))}
                        {m.contextWindow != null && (
                          <span
                            title="Fenêtre de contexte : nombre de tokens que le modèle peut traiter en une fois"
                            style={{
                              padding: "2px 6px",
                              borderRadius: "var(--bpm-radius-sm)",
                              background: "var(--bpm-bg-tertiary)",
                            }}
                          >
                            {m.contextWindow.toLocaleString()} ctx
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </>
    );

  return (
    <div
      ref={triggerRef}
      className={className ? `bpm-model-selector ${className}`.trim() : "bpm-model-selector"}
      style={{ position: "relative", display: "inline-block" }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          border: "1px solid var(--bpm-border)",
          borderRadius: "var(--bpm-radius)",
          background: "var(--bpm-bg-primary)",
          color: "var(--bpm-text)",
          fontSize: "var(--bpm-font-size-base)",
          cursor: "pointer",
          minWidth: 180,
        }}
      >
        <span style={{ flex: 1, textAlign: "left" }}>
          {selectedModel ? selectedModel.label : "Sélectionner un modèle"}
        </span>
        <span style={{ color: "var(--bpm-text-muted)", fontSize: 10, lineHeight: 1 }} aria-hidden>
          {open ? "▲" : "▼"}
        </span>
      </button>
      {dropdownContent && createPortal(dropdownContent, document.body)}
    </div>
  );
}
