"use client";

import React, { useState } from "react";
import { Spinner } from "./Spinner";

export interface StatusBoxProps {
  label: string;
  state?: "running" | "complete" | "error";
  children?: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

export function StatusBox(p: StatusBoxProps) {
  const { label, state = "running", children, defaultExpanded = true, className = "" } = p;
  const [expanded, setExpanded] = useState(defaultExpanded);
  const icon = state === "running" ? <Spinner size="small" neutral /> : state === "complete" ? "\u2713" : "x";
  const iconColor = state === "running" ? "var(--bpm-text-secondary)" : state === "complete" ? "var(--bpm-accent-mint)" : "var(--bpm-accent)";
  return (
    <div className={"bpm-status-box rounded-lg border " + className} style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)" }}>
      <button type="button" onClick={() => setExpanded((e) => !e)} className="w-full flex items-center gap-2 px-4 py-3 text-left" style={{ color: "var(--bpm-text-primary)" }}>
        <span style={{ color: iconColor }}>{icon}</span>
        <span className="font-medium">{label}</span>
        <span className="ml-auto text-sm" style={{ color: "var(--bpm-text-secondary)" }}>{expanded ? "\u25BC" : "\u25B6"}</span>
      </button>
      {expanded && children && <div className="px-4 pb-3 pt-0 border-t" style={{ borderColor: "var(--bpm-border)" }}>{children}</div>}
    </div>
  );
}
