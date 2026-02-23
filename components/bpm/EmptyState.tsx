"use client";

import React from "react";

export interface EmptyStateProps {
  title?: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = "Aucune donnée",
  description,
  icon,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`bpm-emptystate text-center py-8 px-4 ${className}`.trim()}
      style={{ color: "var(--bpm-text-secondary)" }}
    >
      {icon != null && <div className="bpm-emptystate-icon mb-3 flex justify-center">{icon}</div>}
      <h3 className="bpm-emptystate-title text-lg font-semibold m-0 mb-1" style={{ color: "var(--bpm-text-primary)" }}>
        {title}
      </h3>
      {description != null && <p className="bpm-emptystate-desc text-sm m-0 mb-3">{description}</p>}
      {action != null && <div className="bpm-emptystate-action">{action}</div>}
    </div>
  );
}
