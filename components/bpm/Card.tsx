"use client";

import React from "react";

export type CardVariant = "default" | "elevated" | "outlined";

export interface CardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  image?: string;
  imageAlt?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  variant?: CardVariant;
  className?: string;
}

export function Card({
  title,
  subtitle,
  image,
  imageAlt = "",
  children,
  actions,
  variant = "default",
  className = "",
}: CardProps) {
  return (
    <div
      className={`bpm-card rounded-lg overflow-hidden ${className}`.trim()}
      style={{
        background: "var(--bpm-surface)",
        border: variant === "outlined" ? "1px solid var(--bpm-border)" : "none",
        boxShadow: variant === "elevated" ? "0 4px 12px rgba(0,0,0,0.08)" : "none",
      }}
    >
      {image && (
        <div className="bpm-card-image-wrap overflow-hidden">
          <img src={image} alt={imageAlt} className="bpm-card-image w-full h-auto object-cover" />
        </div>
      )}
      {(title != null || subtitle != null || actions != null || children != null) && (
        <div className="bpm-card-body p-4">
          {title != null && (
            <h3 className="bpm-card-title text-lg font-semibold m-0 mb-1" style={{ color: "var(--bpm-text-primary)" }}>
              {title}
            </h3>
          )}
          {subtitle != null && (
            <p className="bpm-card-subtitle text-sm m-0 mb-2" style={{ color: "var(--bpm-text-secondary)" }}>
              {subtitle}
            </p>
          )}
          {children != null && <div className="bpm-card-content">{children}</div>}
          {actions != null && <div className="bpm-card-actions mt-3">{actions}</div>}
        </div>
      )}
    </div>
  );
}
