"use client";

import React, { useId, useMemo, useState } from "react";

export interface FlowDiagramState {
  value: string;
  label: string;
  color?: "default" | "info" | "success" | "warning" | "error";
  terminal?: boolean;
}

export interface FlowDiagramTransition {
  from: string | string[];
  to: string;
  label: string;
}

export interface FlowDiagramProps {
  states: FlowDiagramState[];
  transitions: FlowDiagramTransition[];
  currentState?: string;
  onTransition?: (from: string, to: string) => void;
  direction?: "horizontal" | "vertical";
  className?: string;
}

const NODE_W = 120;
const NODE_H = 48;
const GAP_H = 160;
const GAP_V = 100;
const PAD = 32;

/** Surface de carte : aligné design tokens (alias surface). */
const STATE_COLORS: Record<string, { bg: string; border: string }> = {
  default: { bg: "var(--bpm-surface)", border: "var(--bpm-border)" },
  info: {
    bg: "color-mix(in srgb, var(--bpm-info) 15%, var(--bpm-surface))",
    border: "var(--bpm-info)",
  },
  success: {
    bg: "color-mix(in srgb, var(--bpm-success) 15%, var(--bpm-surface))",
    border: "var(--bpm-success)",
  },
  warning: {
    bg: "color-mix(in srgb, var(--bpm-warning) 15%, var(--bpm-surface))",
    border: "var(--bpm-warning)",
  },
  error: {
    bg: "color-mix(in srgb, var(--bpm-error) 15%, var(--bpm-surface))",
    border: "var(--bpm-error)",
  },
};

function normFrom(from: string | string[]): string[] {
  return Array.isArray(from) ? from : [from];
}

function transitionActiveFrom(
  t: FlowDiagramTransition,
  current: string | undefined
): string | null {
  if (!current) return null;
  const sources = normFrom(t.from);
  if (sources.includes(current)) return current;
  return null;
}

function isTransitionReachable(
  t: FlowDiagramTransition,
  current: string | undefined,
  hasOnTransition: boolean
): boolean {
  if (!hasOnTransition || current === undefined) return true;
  return transitionActiveFrom(t, current) !== null;
}

function buildPathD(
  direction: "horizontal" | "vertical",
  ax: number,
  ay: number,
  bx: number,
  by: number
): string {
  const acx = ax + NODE_W / 2;
  const acy = ay + NODE_H / 2;
  const bcx = bx + NODE_W / 2;
  const bcy = by + NODE_H / 2;
  if (direction === "horizontal") {
    const x1 = ax + NODE_W;
    const y1 = acy;
    const x2 = bx;
    const y2 = bcy;
    const dx = (x2 - x1) * 0.45;
    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  }
  const x1 = acx;
  const y1 = ay + NODE_H;
  const x2 = bcx;
  const y2 = by;
  const dy = (y2 - y1) * 0.45;
  return `M ${x1} ${y1} C ${x1} ${y1 + dy}, ${x2} ${y2 - dy}, ${x2} ${y2}`;
}

function arrowHead(tipX: number, tipY: number, ang: number, size = 8): string {
  const a1 = ang + Math.PI * 0.85;
  const a2 = ang - Math.PI * 0.85;
  const x1 = tipX + Math.cos(a1) * size;
  const y1 = tipY + Math.sin(a1) * size;
  const x2 = tipX + Math.cos(a2) * size;
  const y2 = tipY + Math.sin(a2) * size;
  return `${tipX},${tipY} ${x1},${y1} ${x2},${y2}`;
}

/**
 * @component bpm.flowDiagram
 * @description Diagramme d'états et transitions (SVG), arcs interactifs depuis l'état courant.
 */
export function FlowDiagram({
  states,
  transitions,
  currentState,
  onTransition,
  direction = "horizontal",
  className = "",
}: FlowDiagramProps) {
  const uid = useId().replace(/:/g, "");
  const [hoverKey, setHoverKey] = useState<string | null>(null);

  const { positions, vbW, vbH } = useMemo(() => {
    const nonTerm = states.filter((s) => !s.terminal);
    const term = states.filter((s) => s.terminal);
    const ordered = [...nonTerm, ...term];
    const pos: Record<string, { x: number; y: number }> = {};
    ordered.forEach((s, i) => {
      if (direction === "horizontal") {
        pos[s.value] = { x: PAD + i * GAP_H, y: PAD };
      } else {
        pos[s.value] = { x: PAD, y: PAD + i * GAP_V };
      }
    });
    const n = Math.max(ordered.length, 1);
    const vbW =
      direction === "horizontal" ? PAD * 2 + (n - 1) * GAP_H + NODE_W : PAD * 2 + NODE_W + 80;
    const vbH =
      direction === "vertical" ? PAD * 2 + (n - 1) * GAP_V + NODE_H : PAD * 2 + NODE_H + 80;
    return { positions: pos, vbW, vbH };
  }, [states, direction]);

  const hasOn = typeof onTransition === "function";

  return (
    <div
      className={`bpm-flow-diagram ${className}`.trim()}
      style={{ width: "100%", maxWidth: "100%", overflow: "auto" }}
    >
      <svg
        width="100%"
        height="auto"
        viewBox={`0 0 ${vbW} ${vbH}`}
        role="img"
        aria-label="Diagramme de flux"
        style={{ display: "block", minHeight: 120 }}
      >
        <defs>
          {transitions.map((t, i) => {
            const toPos = positions[t.to];
            if (!toPos) return null;
            const fromList = normFrom(t.from);
            const fromState = fromList.find((f) => positions[f]);
            if (!fromState) return null;
            const fp = positions[fromState];
            const d = buildPathD(direction, fp.x, fp.y, toPos.x, toPos.y);
            return <path key={`p-${i}`} id={`bpm-flow-path-${uid}-${i}`} d={d} fill="none" />;
          })}
        </defs>
        {transitions.map((t, i) => {
          const toPos = positions[t.to];
          if (!toPos) return null;
          const fromList = normFrom(t.from);
          const fpEntry = fromList.map((f) => [f, positions[f]] as const).find(([, p]) => p);
          if (!fpEntry) return null;
          const [fromState, fp] = fpEntry;
          const d = buildPathD(direction, fp.x, fp.y, toPos.x, toPos.y);
          const activeFrom = transitionActiveFrom(t, currentState);
          const reachable = isTransitionReachable(t, currentState, hasOn);
          const clickable = hasOn && activeFrom !== null;
          const key = `${fromState}->${t.to}-${i}`;
          const isHover = hoverKey === key;
          const stroke = reachable
            ? isHover && clickable
              ? "var(--bpm-accent)"
              : "var(--bpm-text-secondary)"
            : "color-mix(in srgb, var(--bpm-border) 70%, transparent)";
          const sw = isHover && clickable ? 3 : 2;
          const pathId = `bpm-flow-path-${uid}-${i}`;
          const tipX = direction === "horizontal" ? toPos.x : toPos.x + NODE_W / 2;
          const tipY = direction === "horizontal" ? toPos.y + NODE_H / 2 : toPos.y;
          const ang =
            direction === "horizontal"
              ? Math.atan2(0, -1)
              : Math.atan2(-1, 0);

          const handleClick = () => {
            if (clickable && activeFrom) onTransition?.(activeFrom, t.to);
          };

          return (
            <g key={key}>
              <path
                d={d}
                fill="none"
                stroke="transparent"
                strokeWidth={16}
                style={{ cursor: clickable ? "pointer" : "default" }}
                onClick={handleClick}
                onMouseEnter={() => clickable && setHoverKey(key)}
                onMouseLeave={() => setHoverKey(null)}
              />
              <path
                d={d}
                fill="none"
                stroke={stroke}
                strokeWidth={sw}
                style={{ transition: "stroke 0.15s ease, stroke-width 0.15s ease", pointerEvents: "none" }}
              />
              <polygon
                points={arrowHead(tipX, tipY, ang)}
                fill={reachable ? "var(--bpm-text-secondary)" : "var(--bpm-border)"}
                style={{ pointerEvents: "none" }}
              />
              <text
                fontSize={10}
                fill="var(--bpm-text-secondary)"
                style={{ pointerEvents: "none" }}
                textAnchor="middle"
              >
                <textPath href={`#${pathId}`} startOffset="50%">
                  {t.label}
                </textPath>
              </text>
            </g>
          );
        })}
        {states.map((s) => {
          const p = positions[s.value];
          if (!p) return null;
          const col = STATE_COLORS[s.color ?? "default"] ?? STATE_COLORS.default;
          const isCurrent = currentState === s.value;
          return (
            <g key={s.value}>
              <rect
                x={p.x}
                y={p.y}
                width={NODE_W}
                height={NODE_H}
                rx={8}
                ry={8}
                fill={col.bg}
                stroke={isCurrent ? "var(--bpm-accent)" : col.border}
                strokeWidth={isCurrent ? 3 : s.terminal ? 2 : 1}
                style={{
                  filter: isCurrent ? "drop-shadow(0 0 4px color-mix(in srgb, var(--bpm-accent) 35%, transparent))" : undefined,
                }}
              />
              {s.terminal && (
                <rect
                  x={p.x + 3}
                  y={p.y + 3}
                  width={NODE_W - 6}
                  height={NODE_H - 6}
                  rx={6}
                  ry={6}
                  fill="none"
                  stroke={col.border}
                  strokeWidth={1}
                />
              )}
              <text
                x={p.x + NODE_W / 2}
                y={p.y + NODE_H / 2 + 4}
                textAnchor="middle"
                fontSize={12}
                fontWeight={500}
                fill="var(--bpm-text-primary)"
                style={{ pointerEvents: "none" }}
              >
                {s.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
