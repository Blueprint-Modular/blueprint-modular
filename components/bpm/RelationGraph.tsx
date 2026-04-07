"use client";

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

export interface GraphNode {
  id: string;
  label: string;
  width?: number;
  height?: number;
}

export interface GraphEdge {
  from: string;
  to: string;
}

export type RelationGraphLayout = "force" | "grid" | "circular";

export interface RelationGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  layout?: RelationGraphLayout;
  width?: number;
  height?: number;
  className?: string;
}

type Vec = { x: number; y: number };

function nodeSize(n: GraphNode): { w: number; h: number } {
  return { w: n.width ?? 96, h: n.height ?? 40 };
}

function layoutSignature(nodes: GraphNode[], edges: GraphEdge[], layout: RelationGraphLayout): string {
  return `${layout}:${nodes.map((n) => n.id).join(",")}:${edges.map((e) => `${e.from}->${e.to}`).join(",")}`;
}

function gridLayout(nodes: GraphNode[], w: number, h: number): Record<string, Vec> {
  const n = nodes.length;
  const out: Record<string, Vec> = {};
  if (n === 0) return out;
  const cols = Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / cols);
  const cw = w / cols;
  const rh = h / rows;
  nodes.forEach((node, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    out[node.id] = { x: (col + 0.5) * cw, y: (row + 0.5) * rh };
  });
  return out;
}

function circularLayout(nodes: GraphNode[], w: number, h: number): Record<string, Vec> {
  const n = nodes.length;
  const out: Record<string, Vec> = {};
  if (n === 0) return out;
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) * 0.36;
  nodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    out[node.id] = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
  return out;
}

function forceLayout(nodes: GraphNode[], edges: GraphEdge[], w: number, h: number, iterations = 50): Record<string, Vec> {
  const n = nodes.length;
  const out: Record<string, Vec> = {};
  if (n === 0) return out;
  const area = w * h;
  const k = Math.sqrt(area / Math.max(1, n));
  const pos: Record<string, Vec> = {};
  for (const node of nodes) {
    pos[node.id] = { x: 0.2 * w + Math.random() * 0.6 * w, y: 0.2 * h + Math.random() * 0.6 * h };
  }
  const disp: Record<string, Vec> = {};

  for (let iter = 0; iter < iterations; iter++) {
    for (const node of nodes) disp[node.id] = { x: 0, y: 0 };

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const idA = nodes[i].id;
        const idB = nodes[j].id;
        let dx = pos[idB].x - pos[idA].x;
        let dy = pos[idB].y - pos[idA].y;
        let dist = Math.hypot(dx, dy) || 0.01;
        const fr = (k * k) / dist;
        const fx = (dx / dist) * fr;
        const fy = (dy / dist) * fr;
        disp[idA].x -= fx;
        disp[idA].y -= fy;
        disp[idB].x += fx;
        disp[idB].y += fy;
      }
    }

    for (const e of edges) {
      const a = e.from;
      const b = e.to;
      if (!pos[a] || !pos[b]) continue;
      let dx = pos[b].x - pos[a].x;
      let dy = pos[b].y - pos[a].y;
      let dist = Math.hypot(dx, dy) || 0.01;
      const fa = (dist * dist) / k;
      const fx = (dx / dist) * fa;
      const fy = (dy / dist) * fa;
      disp[a].x += fx;
      disp[a].y += fy;
      disp[b].x -= fx;
      disp[b].y -= fy;
    }

    const t = 0.1 * (1 - iter / Math.max(1, iterations - 1)) + 0.02;
    for (const node of nodes) {
      const d = disp[node.id];
      const mag = Math.hypot(d.x, d.y) || 0.01;
      const lim = Math.min(mag, t * Math.min(w, h)) / mag;
      pos[node.id].x += d.x * lim;
      pos[node.id].y += d.y * lim;
      pos[node.id].x = Math.max(24, Math.min(w - 24, pos[node.id].x));
      pos[node.id].y = Math.max(24, Math.min(h - 24, pos[node.id].y));
    }
  }
  for (const node of nodes) out[node.id] = { ...pos[node.id] };
  return out;
}

function computeLayout(
  layout: RelationGraphLayout,
  nodes: GraphNode[],
  edges: GraphEdge[],
  w: number,
  h: number
): Record<string, Vec> {
  if (layout === "grid") return gridLayout(nodes, w, h);
  if (layout === "circular") return circularLayout(nodes, w, h);
  return forceLayout(nodes, edges, w, h);
}

function shortenEdge(x1: number, y1: number, x2: number, y2: number, r1: number, r2: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  return { x1: x1 + ux * r1, y1: y1 + uy * r1, x2: x2 - ux * r2, y2: y2 - uy * r2 };
}

/**
 * Graph relationnel SVG : mise en page force / grille / circulaire, zoom, panoramique et glisser-déposer des nœuds.
 */
export function RelationGraph({
  nodes,
  edges,
  layout = "force",
  width = 640,
  height = 420,
  className = "",
}: RelationGraphProps) {
  const sig = useMemo(() => layoutSignature(nodes, edges, layout), [nodes, edges, layout]);

  const computed = useMemo(
    () => computeLayout(layout, nodes, edges, width, height),
    [layout, nodes, edges, width, height]
  );

  const [positions, setPositions] = useState<Record<string, Vec>>({});
  const lastSig = useRef("");

  useEffect(() => {
    if (lastSig.current !== sig) {
      lastSig.current = sig;
      setPositions({ ...computed });
    }
  }, [sig, computed]);

  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragRef = useRef<{ id: string; gx: number; gy: number } | null>(null);
  const rawId = useId();
  const markerId = `bpm-rg-m${rawId.replace(/:/g, "")}`;

  const [panning, setPanning] = useState(false);
  const panRef = useRef<{ sx: number; sy: number; stx: number; sty: number } | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!draggingId || !dragRef.current) return;
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current;
      const svg = svgRef.current;
      if (!d || !svg) return;
      const rect = svg.getBoundingClientRect();
      const vx = ((e.clientX - rect.left) / rect.width) * width;
      const vy = ((e.clientY - rect.top) / rect.height) * height;
      const wx = (vx - tx) / scale;
      const wy = (vy - ty) / scale;
      setPositions((prev) => ({
        ...prev,
        [d.id]: {
          x: Math.max(16, Math.min(width - 16, wx - d.gx)),
          y: Math.max(16, Math.min(height - 16, wy - d.gy)),
        },
      }));
    };
    const onUp = () => {
      dragRef.current = null;
      setDraggingId(null);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [draggingId, scale, tx, ty, width, height]);

  useEffect(() => {
    if (!panning || !panRef.current) return;
    const onMove = (e: MouseEvent) => {
      const p = panRef.current;
      if (!p) return;
      setTx(p.stx + (e.clientX - p.sx));
      setTy(p.sty + (e.clientY - p.sy));
    };
    const onUp = () => {
      panRef.current = null;
      setPanning(false);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [panning]);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      setScale((s) => Math.min(3, Math.max(0.35, s + delta)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onNodeDown = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      const svg = svgRef.current;
      const p = positions[id];
      if (!svg || !p) return;
      const rect = svg.getBoundingClientRect();
      const vx = ((e.clientX - rect.left) / rect.width) * width;
      const vy = ((e.clientY - rect.top) / rect.height) * height;
      const wx = (vx - tx) / scale;
      const wy = (vy - ty) / scale;
      dragRef.current = { id, gx: wx - p.x, gy: wy - p.y };
      setDraggingId(id);
    },
    [positions, scale, tx, ty, width, height]
  );

  const onBackgroundDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    panRef.current = { sx: e.clientX, sy: e.clientY, stx: tx, sty: ty };
    setPanning(true);
  }, [tx, ty]);

  return (
    <div
      className={className}
      style={{
        border: "1px solid var(--bpm-border)",
        borderRadius: "var(--bpm-radius)",
        background: "var(--bpm-bg-secondary, var(--bpm-surface))",
        overflow: "hidden",
        touchAction: "none",
      }}
    >
      <svg
        ref={svgRef}
        width="100%"
        style={{ display: "block", maxHeight: height, cursor: panning ? "grabbing" : "default" }}
        viewBox={`0 0 ${width} ${height}`}
        onMouseDown={onBackgroundDown}
      >
        <defs>
          <marker id={markerId} markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="var(--bpm-text-secondary)" />
          </marker>
        </defs>
        <g transform={`translate(${tx},${ty}) scale(${scale})`}>
          <rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="transparent"
            style={{ cursor: panning ? "grabbing" : "grab" }}
          />
          {edges.map((e, i) => {
            const pa = positions[e.from];
            const pb = positions[e.to];
            if (!pa || !pb) return null;
            const { w: wa, h: ha } = nodeSize(nodes.find((n) => n.id === e.from) ?? { id: e.from, label: "" });
            const { w: wb, h: hb } = nodeSize(nodes.find((n) => n.id === e.to) ?? { id: e.to, label: "" });
            const ra = Math.hypot(wa, ha) / 2;
            const rb = Math.hypot(wb, hb) / 2;
            const { x1, y1, x2, y2 } = shortenEdge(pa.x, pa.y, pb.x, pb.y, ra * 0.85, rb * 0.85);
            return (
              <line
                key={`${e.from}-${e.to}-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="var(--bpm-text-secondary)"
                strokeWidth={1.25}
                markerEnd={`url(#${markerId})`}
              />
            );
          })}
          {nodes.map((n) => {
            const p = positions[n.id];
            if (!p) return null;
            const { w, h } = nodeSize(n);
            return (
              <g
                key={n.id}
                transform={`translate(${p.x - w / 2},${p.y - h / 2})`}
                onMouseDown={(e) => onNodeDown(e, n.id)}
                style={{ cursor: draggingId === n.id ? "grabbing" : "grab" }}
              >
                <rect
                  width={w}
                  height={h}
                  rx={8}
                  ry={8}
                  fill="var(--bpm-surface)"
                  stroke="var(--bpm-border)"
                  strokeWidth={1.5}
                />
                <text
                  x={w / 2}
                  y={h / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="var(--bpm-text-primary)"
                  fontSize={12}
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {n.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
