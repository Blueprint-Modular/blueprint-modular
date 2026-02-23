"use client";

import React from "react";

export type SpinnerSize = "small" | "medium" | "large";

export interface SpinnerProps {
  text?: string;
  size?: SpinnerSize;
  className?: string;
}

const sizeMap = { small: "w-5 h-5 border-2", medium: "w-8 h-8 border-2", large: "w-10 h-10 border-3" };

export function Spinner({
  text = "Chargement...",
  size = "medium",
  className = "",
}: SpinnerProps) {
  return (
    <div
      className={`bpm-spinner-container inline-flex flex-col items-center gap-2 ${className}`}
    >
      <div
        className={`bpm-spinner rounded-full border-solid border-t-transparent animate-spin ${sizeMap[size]}`}
        style={{
          borderColor: "var(--bpm-border)",
          borderTopColor: "var(--bpm-accent)",
        }}
      />
      {text && (
        <span className="bpm-spinner-text text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          {text}
        </span>
      )}
    </div>
  );
}
