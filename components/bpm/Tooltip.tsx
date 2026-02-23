"use client";

import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";

export type TooltipPlacement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "right";

export interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: TooltipPlacement;
}

export function Tooltip({
  text,
  children,
  position = "top",
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);

  const updatePosition = () => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const gap = 8;
    const tooltipHeight = 32;
    let top = 0;
    let left = rect.left + rect.width / 2;
    if (position.startsWith("top")) {
      top = rect.top - gap - tooltipHeight;
    } else if (position.startsWith("bottom")) {
      top = rect.bottom + gap;
    } else {
      top = rect.top + rect.height / 2 - tooltipHeight / 2;
    }
    if (position.includes("start")) left = rect.left;
    if (position.includes("end")) left = rect.right;
    if (position === "left") left = rect.left - gap;
    if (position === "right") left = rect.right + gap;
    setCoords({ top, left });
  };

  const show = () => {
    setVisible(true);
    requestAnimationFrame(updatePosition);
  };
  const hide = () => setVisible(false);

  const tooltipEl = visible && text && (
    <div
      className="bpm-tooltip-popover fixed z-[10002] px-3 py-2 rounded text-sm max-w-[380px] min-w-[140px] shadow-lg pointer-events-none"
      style={{
        left: coords.left,
        top: coords.top,
        transform: "translate(-50%, 0)",
        background: "var(--bpm-text-primary)",
        color: "var(--bpm-bg-primary)",
      }}
    >
      {text}
    </div>
  );

  return (
    <>
      <span
        ref={triggerRef}
        className="bpm-tooltip-container inline"
        onMouseEnter={show}
        onMouseLeave={hide}
      >
        {children}
      </span>
      {typeof document !== "undefined" && tooltipEl && createPortal(tooltipEl, document.body)}
    </>
  );
}
