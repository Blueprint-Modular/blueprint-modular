"use client";

import React, { useEffect, useState } from "react";

export interface TourStep {
  target: string;
  title: string;
  content: string;
}

export interface TourProps {
  steps: TourStep[];
  isActive: boolean;
  onClose?: () => void;
  className?: string;
}

export function Tour({ steps, isActive, onClose, className = "" }: TourProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!isActive) setIndex(0);
  }, [isActive]);

  if (!isActive || steps.length === 0) return null;

  const step = steps[Math.min(index, steps.length - 1)];
  let rect: DOMRect | null = null;
  if (typeof document !== "undefined") {
    const el = document.querySelector(step.target);
    rect = el?.getBoundingClientRect() ?? null;
  }

  return (
    <div className={className} style={{ position: "fixed", inset: 0, zIndex: 9998, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--bpm-overlay-bg)",
          pointerEvents: "auto",
        }}
        onClick={onClose}
        aria-hidden
      />
      {rect && (
        <div
          style={{
            position: "fixed",
            left: rect.left - 4,
            top: rect.top - 4,
            width: rect.width + 8,
            height: rect.height + 8,
            borderRadius: "var(--bpm-radius-sm)",
            outline: "3px solid var(--bpm-accent)",
            outlineOffset: 0,
            boxShadow: "0 0 0 9999px var(--bpm-overlay-bg)",
            pointerEvents: "none",
            zIndex: 9999,
          }}
        />
      )}
        <div
        style={{
          position: "fixed",
          left: rect
            ? Math.min(rect.left, (typeof window !== "undefined" ? window.innerWidth : 800) - 300)
            : 24,
          top: rect
            ? Math.min(rect.bottom + 12, (typeof window !== "undefined" ? window.innerHeight : 600) - 160)
            : 80,
          width: 280,
          zIndex: 10000,
          pointerEvents: "auto",
          background: "var(--bpm-surface)",
          border: "1px solid var(--bpm-border)",
          borderRadius: "var(--bpm-radius)",
          padding: 16,
          boxShadow: "var(--bpm-shadow-md)",
        }}
      >
        <div style={{ fontWeight: 700, color: "var(--bpm-text-primary)", marginBottom: 8 }}>{step.title}</div>
        <p style={{ margin: 0, fontSize: 14, color: "var(--bpm-text-secondary)", lineHeight: 1.45 }}>
          {step.content}
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, gap: 8 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "6px 12px",
              borderRadius: "var(--bpm-radius-sm)",
              border: "1px solid var(--bpm-border)",
              background: "var(--bpm-bg-secondary)",
              color: "var(--bpm-text-primary)",
              cursor: "pointer",
            }}
          >
            Fermer
          </button>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              disabled={index === 0}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              style={{
                padding: "6px 12px",
                borderRadius: "var(--bpm-radius-sm)",
                border: "1px solid var(--bpm-border)",
                background: "var(--bpm-surface)",
                color: "var(--bpm-text-primary)",
                cursor: index === 0 ? "not-allowed" : "pointer",
                opacity: index === 0 ? 0.5 : 1,
              }}
            >
              Préc.
            </button>
            <button
              type="button"
              disabled={index >= steps.length - 1}
              onClick={() => setIndex((i) => Math.min(steps.length - 1, i + 1))}
              style={{
                padding: "6px 12px",
                borderRadius: "var(--bpm-radius-sm)",
                border: "1px solid var(--bpm-accent)",
                background: "var(--bpm-accent)",
                color: "var(--bpm-accent-contrast)",
                cursor: index >= steps.length - 1 ? "not-allowed" : "pointer",
                opacity: index >= steps.length - 1 ? 0.5 : 1,
              }}
            >
              Suiv.
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
