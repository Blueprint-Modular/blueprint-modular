"use client";

import React from "react";

export interface StepperStep {
  id?: string;
  label: string;
  optional?: boolean;
  content?: React.ReactNode;
}

export interface StepperProps {
  steps?: StepperStep[];
  currentStep?: number;
  onStepClick?: (index: number) => void;
  className?: string;
}

/**
 * @component bpm.stepper
 * @description Indicateur d'etapes (workflow, onboarding) avec etape courante et navigation optionnelle.
 * @example
 * bpm.stepper({ steps: [{ label: "Infos" }, { label: "Validation" }], currentStep: 0, onStepClick: setStep })
 * @props
 * - steps (StepperStep[], optionnel) — Liste des etapes (label, optional, content). Default: [].
 * - currentStep (number, optionnel) — Index etape active (0-based). Default: 0.
 * - onStepClick (function, optionnel) — Callback (index: number) au clic sur une etape.
 * - className (string, optionnel) — Classes CSS.
 * @usage Wizard de saisie, processus de validation, onboarding.
 * @context PARENT: bpm.panel | bpm.modal. ASSOCIATED: bpm.transition, bpm.button. FORBIDDEN: aucun.
 */
export function Stepper({
  steps = [],
  currentStep = 0,
  onStepClick,
  className = "",
}: StepperProps) {
  return (
    <div className={`bpm-stepper ${className}`.trim()}>
      <div className="flex flex-col gap-0" role="list">
        {steps.map((step, i) => {
          const id = step.id ?? `step-${i}`;
          const isActive = i === currentStep;
          const isPast = i < currentStep;
          const isClickable = typeof onStepClick === "function";
          return (
            <div
              key={id}
              className={`bpm-stepper-step relative flex items-start gap-3 min-h-[64px] last:min-h-0 ${isActive ? "bpm-stepper-step-active" : ""}`.trim()}
              role="listitem"
            >
              <button
                type="button"
                className={`bpm-stepper-dot w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 border-2 disabled:cursor-default ${isActive ? "bpm-stepper-dot--active" : ""} ${isPast ? "bpm-stepper-dot--completed" : ""}`.trim()}
                style={{
                  borderColor: isPast || isActive ? "var(--bpm-accent)" : "var(--bpm-border)",
                  background: isPast ? "var(--bpm-accent)" : "var(--bpm-bg-primary)",
                  color: isPast || isActive ? "var(--bpm-accent-contrast)" : "var(--bpm-text-muted)",
                }}
                onClick={isClickable ? () => onStepClick(i) : undefined}
                disabled={!isClickable}
                aria-current={isActive ? "step" : undefined}
                aria-label={step.label}
                title={step.label}
              >
                {isPast ? "✓" : i + 1}
              </button>
              <span className="text-sm pt-1" style={{ color: "var(--bpm-text-primary)" }}>
                {step.label}
                {step.optional && <span className="opacity-70"> (optionnel)</span>}
              </span>
              {i < steps.length - 1 && (
                <span
                  className="absolute left-4 top-10 w-0.5 h-6 -ml-px"
                  style={{ background: "var(--bpm-border)" }}
                  aria-hidden
                />
              )}
            </div>
          );
        })}
      </div>
      {steps[currentStep]?.content != null && (
        <div className="bpm-stepper-content mt-4 pl-11" style={{ color: "var(--bpm-text-primary)" }}>
          {steps[currentStep].content}
        </div>
      )}
    </div>
  );
}
