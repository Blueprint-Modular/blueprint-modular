"use client";

import React, { useMemo } from "react";

export interface TreemapItem {
  name: string;
  value: number;
  fill?: string;
}

export interface TreemapProps {
  data: TreemapItem[];
  width?: number;
  height?: number;
  className?: string;
}

interface Cell extends TreemapItem {
  x: number;
  y: number;
  w: number;
  h: number;
}

function worst(values: number[], shortSide: number): number {
  const s = values.reduce((a, b) => a + b, 0);
  if (s <= 0) return Infinity;
  const mx = Math.max(...values);
  const mn = Math.min(...values);
  const s2 = s * s;
  return Math.max((shortSide * mx) / s2, s2 / (shortSide * mn));
}

function squarify(
  children: TreemapItem[],
  x: number,
  y: number,
  w: number,
  h: number,
): Cell[] {
  const rows: TreemapItem[] = children.filter((c) => c.value > 0);
  const total = rows.reduce((s, c) => s + c.value, 0);
  if (total <= 0 || rows.length === 0) return [];

  const rects: Cell[] = [];
  let remaining = rows;
  let rx = x;
  let ry = y;
  let rw = w;
  let rh = h;
  let sumRest = total;

  while (remaining.length > 0) {
    const horiz = rw >= rh;
    const short = horiz ? rh : rw;
    const row: TreemapItem[] = [];
    let rowSum = 0;

    for (let i = 0; i < remaining.length; i++) {
      const next = remaining[i];
      const testRow = [...row, next];
      const testSum = rowSum + next.value;
      const testVals = testRow.map((t) => t.value);
      const wShort = short * (testSum / sumRest);
      const worstTest = worst(testVals, wShort);
      const worstCur =
        row.length > 0 ? worst(row.map((t) => t.value), short * (rowSum / sumRest)) : 0;
      if (row.length > 0 && worstTest > worstCur) break;
      row.push(next);
      rowSum = testSum;
    }

    const rTotal = row.reduce((s, t) => s + t.value, 0);
    const share = rTotal / sumRest;

    if (horiz) {
      const rowH = rh * share;
      let cx = rx;
      for (const t of row) {
        const cw = rw * (t.value / rTotal);
        rects.push({
          ...t,
          x: cx,
          y: ry,
          w: cw,
          h: rowH,
        });
        cx += cw;
      }
      ry += rowH;
      rh -= rowH;
    } else {
      const rowW = rw * share;
      let cy = ry;
      for (const t of row) {
        const ch = rh * (t.value / rTotal);
        rects.push({
          ...t,
          x: rx,
          y: cy,
          w: rowW,
          h: ch,
        });
        cy += ch;
      }
      rx += rowW;
      rw -= rowW;
    }

    remaining = remaining.slice(row.length);
    sumRest -= rTotal;
  }

  return rects;
}

export function Treemap({
  data,
  width = 400,
  height = 280,
  className = "",
}: TreemapProps) {
  const cells = useMemo(
    () => squarify(data, 0, 0, width, height),
    [data, width, height],
  );

  return (
    <svg
      width={width}
      height={height}
      className={className}
      style={{ background: "var(--bpm-bg-secondary)", borderRadius: "var(--bpm-radius)" }}
      role="img"
      aria-label="Treemap"
    >
      {cells.map((c, i) => (
        <g key={i}>
          <rect
            x={c.x + 1}
            y={c.y + 1}
            width={Math.max(0, c.w - 2)}
            height={Math.max(0, c.h - 2)}
            fill={c.fill ?? "var(--bpm-accent-soft)"}
            stroke="var(--bpm-border)"
            strokeWidth={1}
          />
          {c.w > 48 && c.h > 22 && (
            <text
              x={c.x + 6}
              y={c.y + 16}
              fontSize={11}
              fill="var(--bpm-text-primary)"
              style={{ pointerEvents: "none" }}
            >
              {c.name}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
