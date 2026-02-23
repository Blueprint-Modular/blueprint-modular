"use client";

import React, { useState } from "react";

export interface ExpanderProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

export function Expander({
  title,
  children,
  defaultExpanded = false,
  className = "",
}: ExpanderProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`bpm-expander border rounded-lg overflow-hidden ${className}`.trim()} style={{ borderColor: "var(--bpm-border)" }}>
      <button
        type="button"
        className={`bpm-expander-header w-full flex items-center gap-2 px-4 py-3 text-left text-sm font-medium border-0 cursor-pointer transition-colors ${
          isExpanded ? "bpm-expander-open" : "bpm-expander-closed"
        }`}
        style={{
          background: "var(--bpm-bg-secondary)",
          color: "var(--bpm-text-primary)",
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="bpm-expander-icon flex-shrink-0" style={{ color: "var(--bpm-text-secondary)" }}>
          {isExpanded ? "▾" : "▸"}
        </span>
        <span className="bpm-expander-title">{title}</span>
      </button>
      {isExpanded && (
        <div className="bpm-expander-content px-4 py-3 border-t" style={{ borderColor: "var(--bpm-border)", color: "var(--bpm-text-primary)" }}>
          {children}
        </div>
      )}
    </div>
  );
}
