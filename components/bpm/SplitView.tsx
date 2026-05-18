"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

/**
 * @component bpm.splitView
 * @description Deux volets redimensionnables avec séparateur draggable. Empile verticalement sous 640px.
 * @example
 * bpm.splitView({ left: <List />, right: <Detail />, defaultSplit: 30, direction: "horizontal" })
 *
 * @param {object} props
 * @param {React.ReactNode} props.left - Contenu du volet gauche/haut. Obligatoire.
 * @param {React.ReactNode} props.right - Contenu du volet droit/bas. Obligatoire.
 * @param {number} [props.defaultSplit=50] - Pourcentage initial du premier volet. Optionnel.
 * @param {number} [props.minLeft=15] - Pourcentage minimum du premier volet. Optionnel.
 * @param {number} [props.minRight=15] - Pourcentage minimum du second volet. Optionnel.
 * @param {"horizontal"|"vertical"} [props.direction="horizontal"] - Direction du split. Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 *
 * @associated bpm.masterDetail, bpm.panel
 */
export interface SplitViewProps {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultSplit?: number;
  minLeft?: number;
  minRight?: number;
  direction?: "horizontal" | "vertical";
  className?: string;
}

const BP = 640;

/**
 * Deux volets redimensionnables ; en dessous de 640px les volets s’empilent.
 */
export function SplitView({
  left,
  right,
  defaultSplit = 50,
  minLeft = 15,
  minRight = 15,
  direction = "horizontal",
  className = "",
}: SplitViewProps) {
  const [split, setSplit] = useState(defaultSplit);
  const [stacked, setStacked] = useState(false);
  const [dragging, setDragging] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${BP - 1}px)`);
    const apply = () => setStacked(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const el = rootRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (direction === "horizontal") {
        const x = e.clientX - rect.left;
        const pct = (x / rect.width) * 100;
        setSplit(Math.min(100 - minRight, Math.max(minLeft, pct)));
      } else {
        const y = e.clientY - rect.top;
        const pct = (y / rect.height) * 100;
        setSplit(Math.min(100 - minRight, Math.max(minLeft, pct)));
      }
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, direction, minLeft, minRight]);

  const startDrag = useCallback(() => setDragging(true), []);

  if (stacked) {
    return (
      <div
        ref={rootRef}
        className={className}
        style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}
      >
        <div style={{ width: "100%", minHeight: 0 }}>{left}</div>
        <div style={{ width: "100%", minHeight: 0 }}>{right}</div>
      </div>
    );
  }

  const isH = direction === "horizontal";

  return (
    <div
      ref={rootRef}
      className={className}
      style={{
        display: "flex",
        flexDirection: isH ? "row" : "column",
        width: "100%",
        minHeight: 200,
        alignItems: "stretch",
      }}
    >
      <div
        style={{
          flex: isH ? `0 0 ${split}%` : `0 0 ${split}%`,
          minWidth: isH ? 0 : undefined,
          minHeight: isH ? undefined : 0,
          overflow: "auto",
        }}
      >
        {left}
      </div>
      <button
        type="button"
        aria-label="Redimensionner les panneaux"
        onMouseDown={startDrag}
        style={{
          [isH ? "width" : "height"]: 6,
          [isH ? "minWidth" : "minHeight"]: 6,
          cursor: isH ? "col-resize" : "row-resize",
          border: "none",
          padding: 0,
          flexShrink: 0,
          background: "var(--bpm-border)",
        }}
      />
      <div
        style={{
          flex: "1 1 0",
          minWidth: isH ? 0 : undefined,
          minHeight: isH ? undefined : 0,
          overflow: "auto",
        }}
      >
        {right}
      </div>
    </div>
  );
}
