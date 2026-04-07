"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

export interface SignaturePadProps {
  width?: number;
  height?: number;
  lineColor?: string;
  className?: string;
  onChangeDataUrl?: (dataUrl: string | null) => void;
}

export function SignaturePad({
  width = 400,
  height = 160,
  lineColor = "var(--bpm-text-primary)",
  className = "",
  onChangeDataUrl,
}: SignaturePadProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [, setTick] = useState(0);

  const getCtx = useCallback(() => {
    const c = ref.current;
    if (!c) return null;
    const ctx = c.getContext("2d");
    if (!ctx) return null;
    return { c, ctx };
  }, []);

  const pos = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const c = ref.current;
      if (!c) return { x: 0, y: 0 };
      const r = c.getBoundingClientRect();
      const scaleX = c.width / r.width;
      const scaleY = c.height / r.height;
      if ("touches" in e && e.touches[0]) {
        return {
          x: (e.touches[0].clientX - r.left) * scaleX,
          y: (e.touches[0].clientY - r.top) * scaleY,
        };
      }
      const me = e as React.MouseEvent;
      return {
        x: (me.clientX - r.left) * scaleX,
        y: (me.clientY - r.top) * scaleY,
      };
    },
    [],
  );

  const resolveStroke = useCallback(
    (canvas: HTMLCanvasElement) => {
      const m = /^var\(\s*(--[^),]+)\s*\)$/.exec(lineColor.trim());
      if (m) {
        const v = getComputedStyle(canvas).getPropertyValue(m[1]).trim();
        return v || getComputedStyle(document.documentElement).getPropertyValue(m[1]).trim() || "#333";
      }
      return lineColor;
    },
    [lineColor],
  );

  const start = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      drawing.current = true;
      const g = getCtx();
      if (!g) return;
      const { x, y } = pos(e);
      g.ctx.strokeStyle = resolveStroke(g.c);
      g.ctx.lineWidth = 2;
      g.ctx.lineCap = "round";
      g.ctx.lineJoin = "round";
      g.ctx.beginPath();
      g.ctx.moveTo(x, y);
    },
    [getCtx, pos, resolveStroke],
  );

  const move = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!drawing.current) return;
      e.preventDefault();
      const g = getCtx();
      if (!g) return;
      const { x, y } = pos(e);
      g.ctx.lineTo(x, y);
      g.ctx.stroke();
    },
    [getCtx, pos],
  );

  const end = useCallback(() => {
    drawing.current = false;
    const c = ref.current;
    if (c && onChangeDataUrl) {
      onChangeDataUrl(c.toDataURL("image/png"));
    }
    setTick((t) => t + 1);
  }, [onChangeDataUrl]);

  const clear = useCallback(() => {
    const g = getCtx();
    if (!g) return;
    g.ctx.clearRect(0, 0, g.c.width, g.c.height);
    onChangeDataUrl?.(null);
    setTick((t) => t + 1);
  }, [getCtx, onChangeDataUrl]);

  const save = useCallback(() => {
    const c = ref.current;
    return c ? c.toDataURL("image/png") : "";
  }, []);

  useEffect(() => {
    const g = getCtx();
    if (!g) return;
    const fill =
      getComputedStyle(g.c).getPropertyValue("--bpm-surface").trim() ||
      getComputedStyle(document.documentElement).getPropertyValue("--bpm-surface").trim() ||
      "#fff";
    g.ctx.fillStyle = fill;
    g.ctx.fillRect(0, 0, g.c.width, g.c.height);
  }, [getCtx, width, height]);

  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <canvas
        ref={ref}
        width={width}
        height={height}
        style={{
          width: "100%",
          maxWidth: width,
          height: "auto",
          touchAction: "none",
          border: "1px solid var(--bpm-border)",
          borderRadius: "var(--bpm-radius-sm)",
          cursor: "crosshair",
          background: "var(--bpm-surface)",
        }}
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={end}
      />
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={clear}
          style={{
            padding: "6px 12px",
            borderRadius: "var(--bpm-radius-sm)",
            border: "1px solid var(--bpm-border)",
            background: "var(--bpm-bg-secondary)",
            color: "var(--bpm-text-primary)",
            cursor: "pointer",
            fontSize: "var(--bpm-font-size-base)",
          }}
        >
          Effacer
        </button>
        <button
          type="button"
          onClick={() => {
            const u = save();
            if (u && onChangeDataUrl) onChangeDataUrl(u);
          }}
          style={{
            padding: "6px 12px",
            borderRadius: "var(--bpm-radius-sm)",
            border: "1px solid var(--bpm-accent)",
            background: "var(--bpm-accent)",
            color: "var(--bpm-accent-contrast)",
            cursor: "pointer",
            fontSize: "var(--bpm-font-size-base)",
          }}
        >
          Enregistrer (data URL)
        </button>
      </div>
    </div>
  );
}
