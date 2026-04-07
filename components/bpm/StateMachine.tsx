"use client";

import React, { useMemo } from "react";

export interface StateTransition {
  from: string;
  to: string;
  label?: string;
}

export interface StateMachineProps {
  states: string[];
  transitions: StateTransition[];
  currentState: string;
  history?: string[];
  onTransition?: (from: string, to: string) => void;
  width?: number;
  height?: number;
  className?: string;
}

export function StateMachine({
  states,
  transitions,
  currentState,
  history = [],
  onTransition,
  width = 420,
  height = 420,
  className = "",
}: StateMachineProps) {
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) * 0.36;

  const pos = useMemo(() => {
    const m = new Map<string, { x: number; y: number }>();
    const n = states.length;
    states.forEach((s, i) => {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      m.set(s, { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
    });
    return m;
  }, [states, cx, cy, r]);

  const outgoing = transitions.filter((t) => t.from === currentState);

  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <svg
        width={width}
        height={height}
        style={{ background: "var(--bpm-bg-secondary)", borderRadius: "var(--bpm-radius)" }}
        aria-label="Machine à états"
      >
        {transitions.map((t, i) => {
          const a = pos.get(t.from);
          const b = pos.get(t.to);
          if (!a || !b) return null;
          return (
            <line
              key={`${t.from}-${t.to}-${i}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={
                t.from === currentState
                  ? "var(--bpm-accent)"
                  : "var(--bpm-border-strong)"
              }
              strokeWidth={t.from === currentState ? 2 : 1}
              strokeOpacity={0.85}
            />
          );
        })}
        {states.map((s) => {
          const p = pos.get(s);
          if (!p) return null;
          const isCurrent = s === currentState;
          return (
            <g key={s}>
              <circle
                cx={p.x}
                cy={p.y}
                r={isCurrent ? 22 : 18}
                fill={isCurrent ? "var(--bpm-accent)" : "var(--bpm-surface)"}
                stroke="var(--bpm-border-strong)"
                strokeWidth={2}
              />
              <text
                x={p.x}
                y={p.y + 5}
                textAnchor="middle"
                fontSize={12}
                fill={isCurrent ? "var(--bpm-accent-contrast)" : "var(--bpm-text-primary)"}
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                {s.length > 8 ? s.slice(0, 7) + "…" : s}
              </text>
            </g>
          );
        })}
      </svg>
      {onTransition && outgoing.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {outgoing.map((t) => (
            <button
              key={t.from + "→" + t.to}
              type="button"
              onClick={() => onTransition(t.from, t.to)}
              style={{
                padding: "8px 12px",
                borderRadius: "var(--bpm-radius-sm)",
                border: "1px solid var(--bpm-border)",
                background: "var(--bpm-surface)",
                color: "var(--bpm-text-primary)",
                fontSize: "var(--bpm-font-size-base)",
                cursor: "pointer",
              }}
            >
              {t.label ?? `${t.from} → ${t.to}`}
            </button>
          ))}
        </div>
      )}
      {history.length > 0 && (
        <div
          style={{
            fontSize: 13,
            color: "var(--bpm-text-secondary)",
            maxHeight: 120,
            overflow: "auto",
          }}
        >
          <strong style={{ color: "var(--bpm-text-primary)" }}>Historique :</strong>{" "}
          {history.join(" → ")}
        </div>
      )}
    </div>
  );
}
