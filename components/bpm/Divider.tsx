"use client";

import React from "react";

export interface DividerProps {
  label?: string;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function Divider({
  label,
  orientation = "horizontal",
  className = "",
}: DividerProps) {
  const lineClass = "flex-1 h-px";
  const lineStyle = { background: "var(--bpm-border)" };
  if (orientation === "vertical") {
    return (
      <div
        className={`bpm-divider w-px self-stretch ${className}`.trim()}
        role="separator"
        aria-orientation="vertical"
        style={lineStyle}
      />
    );
  }
  return (
    <div
      className={`bpm-divider flex items-center gap-2 ${className}`.trim()}
      role="separator"
      aria-orientation="horizontal"
    >
      <span className={lineClass} style={lineStyle} />
      {label != null && (
        <span className="text-sm px-2" style={{ color: "var(--bpm-text-secondary)" }}>{label}</span>
      )}
      <span className={lineClass} style={lineStyle} />
    </div>
  );
}
