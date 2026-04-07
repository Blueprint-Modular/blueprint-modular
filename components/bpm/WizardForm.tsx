"use client";

import React, { useState } from "react";
import { Stepper } from "./Stepper";
import type { StepperStep } from "./Stepper";

export interface WizardStep {
  title: string;
  description?: string;
  content: React.ReactNode;
  validate?: () => boolean | string;
}

export interface WizardFormProps {
  steps: WizardStep[];
  onComplete: () => void;
  onCancel?: () => void;
  submitLabel?: string;
  showSummary?: boolean;
  className?: string;
}

/**
 * @component bpm.wizardForm
 * @description Assistant multi-étapes avec stepper, validation et transition slide.
 */
export function WizardForm({
  steps,
  onComplete,
  onCancel,
  submitLabel = "Terminer",
  showSummary = false,
  className = "",
}: WizardFormProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const lastIndex = steps.length - 1;
  const onSummaryStep = showSummary && stepIndex === lastIndex && lastIndex >= 0;

  const stepperSteps: StepperStep[] = steps.map((s) => ({
    label: s.title,
    description: s.description,
  }));

  const goNext = () => {
    if (onSummaryStep) {
      const v = steps[lastIndex]?.validate?.();
      if (v === false || (typeof v === "string" && v)) {
        setError(typeof v === "string" && v ? v : "Validation impossible.");
        return;
      }
      setError(null);
      onComplete();
      return;
    }
    const step = steps[stepIndex];
    if (!step) return;
    const v = step.validate?.();
    if (v === false || (typeof v === "string" && v)) {
      setError(typeof v === "string" && v ? v : "Veuillez corriger les champs.");
      return;
    }
    setError(null);
    if (stepIndex >= lastIndex) {
      onComplete();
      return;
    }
    setStepIndex((i) => i + 1);
  };

  const goPrev = () => {
    setError(null);
    if (stepIndex <= 0) return;
    setStepIndex((i) => i - 1);
  };

  const body = onSummaryStep ? (
    <div
      style={{
        border: "1px solid var(--bpm-border)",
        borderRadius: "var(--bpm-radius)",
        padding: 16,
        background: "var(--bpm-surface)",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 12 }}>Récapitulatif</div>
      <ol style={{ margin: 0, paddingLeft: 18, color: "var(--bpm-text-secondary)", fontSize: 14 }}>
        {steps.slice(0, -1).map((s, i) => (
          <li key={i} style={{ marginBottom: 8 }}>
            <strong style={{ color: "var(--bpm-text-primary)" }}>{s.title}</strong>
            {s.description && <div style={{ fontSize: 13 }}>{s.description}</div>}
          </li>
        ))}
      </ol>
      {steps[lastIndex]?.content != null && <div style={{ marginTop: 16 }}>{steps[lastIndex]!.content}</div>}
    </div>
  ) : (
    <div style={{ color: "var(--bpm-text-primary)" }}>{steps[stepIndex]?.content}</div>
  );

  return (
    <div className={`bpm-wizard-form ${className}`.trim()} style={{ maxWidth: 640, margin: "0 auto" }}>
      <Stepper steps={stepperSteps} currentStep={stepIndex} direction="horizontal" size="sm" />
      <p style={{ fontSize: 13, color: "var(--bpm-text-secondary)", marginTop: 12, marginBottom: 8 }}>
        Étape {stepIndex + 1} sur {steps.length}
      </p>
      <style>{`
        @keyframes bpm-wizard-slide-in {
          from { opacity: 0; transform: translateX(16px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .bpm-wizard-step-body {
          animation: bpm-wizard-slide-in 0.22s ease forwards;
        }
      `}</style>
      <div className="bpm-wizard-step-body" key={stepIndex}>
        {body}
      </div>
      {error && (
        <p role="alert" style={{ color: "var(--bpm-error)", fontSize: 13, marginTop: 8 }}>
          {error}
        </p>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 20, justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 10 }}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: "10px 16px",
                borderRadius: "var(--bpm-radius)",
                border: "1px solid var(--bpm-border)",
                background: "var(--bpm-surface)",
                cursor: "pointer",
                color: "var(--bpm-text-primary)",
              }}
            >
              Annuler
            </button>
          )}
          <button
            type="button"
            onClick={goPrev}
            disabled={stepIndex === 0}
            style={{
              padding: "10px 16px",
              borderRadius: "var(--bpm-radius)",
              border: "1px solid var(--bpm-border)",
              background: "transparent",
              cursor: stepIndex === 0 ? "not-allowed" : "pointer",
              opacity: stepIndex === 0 ? 0.5 : 1,
              color: "var(--bpm-text-primary)",
            }}
          >
            Précédent
          </button>
        </div>
        <button
          type="button"
          onClick={goNext}
          style={{
            padding: "10px 18px",
            borderRadius: "var(--bpm-radius)",
            border: "none",
            background: "var(--bpm-accent)",
            color: "var(--bpm-accent-contrast)",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {stepIndex >= lastIndex ? submitLabel : "Suivant"}
        </button>
      </div>
    </div>
  );
}
