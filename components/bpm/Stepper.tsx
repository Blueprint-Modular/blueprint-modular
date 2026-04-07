"use client";

import React from "react";

export interface StepperStep {
  id?: string;
  label: string;
  description?: string;
  icon?: string;
  optional?: boolean;
  content?: React.ReactNode;
}

export interface StepperProps {
  steps?: StepperStep[];
  currentStep?: number;
  direction?: "horizontal" | "vertical";
  onStepClick?: (stepIndex: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_PX: Record<NonNullable<StepperProps["size"]>, number> = {
  sm: 32,
  md: 40,
  lg: 48,
};

/**
 * @component bpm.stepper
 * @description Progression multi-étapes horizontale ou verticale, complété / courant / à venir.
 */
export function Stepper({
  steps = [],
  currentStep = 0,
  direction = "horizontal",
  onStepClick,
  size = "md",
  className = "",
}: StepperProps) {
  const dim = SIZE_PX[size];
  const canClick = typeof onStepClick === "function";

  const track =
    direction === "horizontal"
      ? {
          flexDir: "row" as const,
          align: "flex-start" as const,
          lineW: "100%" as const,
          lineH: 2,
          lineBetween: true,
        }
      : {
          flexDir: "column" as const,
          align: "stretch" as const,
          lineW: 2,
          lineH: "100%" as const,
          lineBetween: true,
        };

  return (
    <>
      <style>{`
        @keyframes bpm-stepper-pulse {
          0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--bpm-accent) 40%, transparent); }
          50% { box-shadow: 0 0 0 6px transparent; }
        }
        .bpm-stepper-current-dot {
          animation: bpm-stepper-pulse 2s ease-in-out infinite;
        }
      `}</style>
      <nav
        className={`bpm-stepper ${className}`.trim()}
        aria-label="Étapes"
        style={{
          display: "flex",
          flexDirection: track.flexDir,
          gap: direction === "horizontal" ? 0 : 8,
          width: "100%",
        }}
      >
        {steps.map((step, i) => {
          const id = step.id ?? `step-${i}`;
          const isActive = i === currentStep;
          const isPast = i < currentStep;
          const isFuture = i > currentStep;
          const clickableBack = canClick && isPast;

          const circle = (
            <button
              type="button"
              className={`bpm-stepper-dot flex items-center justify-center rounded-full border-2 flex-shrink-0 font-medium ${isActive ? "bpm-stepper-current-dot" : ""}`.trim()}
              style={{
                width: dim,
                height: dim,
                minWidth: dim,
                fontSize: dim > 36 ? 15 : 13,
                borderColor: isPast || isActive ? "var(--bpm-accent)" : "var(--bpm-border)",
                background: isPast ? "var(--bpm-accent)" : "var(--bpm-surface)",
                color: isPast ? "var(--bpm-accent-contrast)" : "var(--bpm-text-secondary)",
                cursor: clickableBack ? "pointer" : isFuture ? "default" : "default",
                outlineOffset: 2,
              }}
              disabled={isFuture}
              aria-current={isActive ? "step" : undefined}
              aria-label={step.label}
              onClick={clickableBack ? () => onStepClick!(i) : undefined}
            >
              {step.icon ? (
                <span
                  className="material-symbols-outlined"
                  aria-hidden
                  style={{
                    fontFamily: "Material Symbols Outlined",
                    fontSize: dim * 0.55,
                    fontVariationSettings: "'FILL' 0, 'wght' 400",
                  }}
                >
                  {step.icon}
                </span>
              ) : isPast ? (
                "✓"
              ) : (
                i + 1
              )}
            </button>
          );

          const labelBlock = (
            <div style={{ flex: direction === "horizontal" ? 1 : undefined, minWidth: direction === "horizontal" ? 80 : undefined }}>
              <div
                style={{
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 14,
                  color: isFuture ? "var(--bpm-text-secondary)" : "var(--bpm-text-primary)",
                }}
              >
                {step.label}
                {step.optional ? <span style={{ opacity: 0.7 }}> (optionnel)</span> : null}
              </div>
              {step.description && (
                <div style={{ fontSize: 12, color: "var(--bpm-text-secondary)", marginTop: 4 }}>{step.description}</div>
              )}
            </div>
          );

          const connector =
            i < steps.length - 1 ? (
              <div
                aria-hidden
                style={
                  direction === "horizontal"
                    ? {
                        flex: 1,
                        height: 2,
                        minWidth: 12,
                        marginTop: dim / 2 - 1,
                        alignSelf: "flex-start",
                        background: isPast ? "var(--bpm-accent)" : "transparent",
                        borderTop: isPast ? undefined : "2px dashed var(--bpm-border)",
                      }
                    : {
                        width: 2,
                        minHeight: 16,
                        marginLeft: dim / 2 - 1,
                        background: isPast ? "var(--bpm-accent)" : "transparent",
                        borderLeft: isPast ? undefined : "2px dashed var(--bpm-border)",
                      }
                }
              />
            ) : null;

          if (direction === "horizontal") {
            return (
              <React.Fragment key={id}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 0 }}>
                  {circle}
                  {labelBlock}
                </div>
                {connector}
              </React.Fragment>
            );
          }

          return (
            <div key={id} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                {circle}
                {connector}
              </div>
              <div style={{ paddingBottom: i < steps.length - 1 ? 8 : 0 }}>{labelBlock}</div>
            </div>
          );
        })}
      </nav>
      {steps[currentStep]?.content != null && (
        <div className="bpm-stepper-content mt-4" style={{ color: "var(--bpm-text-primary)" }}>
          {steps[currentStep].content}
        </div>
      )}
    </>
  );
}
