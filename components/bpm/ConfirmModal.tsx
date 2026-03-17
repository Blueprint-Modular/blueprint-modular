"use client";

import React, { useEffect } from "react";

export type ConfirmModalVariant = "danger" | "warning" | "info";

export interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmModalVariant;
  isLoading?: boolean;
}

const VARIANT_STYLES: Record<
  ConfirmModalVariant,
  { buttonBg: string; buttonColor: string; icon: string }
> = {
  danger: { buttonBg: "var(--bpm-error)", buttonColor: "var(--bpm-accent-contrast)", icon: "delete" },
  warning: { buttonBg: "var(--bpm-warning)", buttonColor: "var(--bpm-accent-contrast)", icon: "warning" },
  info: { buttonBg: "var(--bpm-accent)", buttonColor: "var(--bpm-accent-contrast)", icon: "info" },
};

export function ConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "info",
  isLoading = false,
}: ConfirmModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onCancel();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const styles = VARIANT_STYLES[variant];

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onCancel();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "var(--bpm-overlay-bg)",
      }}
      onClick={handleBackdropClick}
    >
      <div
        className="bpm-confirm-modal"
        style={{
          background: "var(--bpm-bg-primary)",
          borderRadius: "var(--bpm-radius)",
          boxShadow: "var(--bpm-shadow)",
          maxWidth: 420,
          width: "100%",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="bpm-confirm-modal-header"
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--bpm-border)",
            background: "var(--bpm-bg-secondary)",
            fontWeight: 600,
            fontSize: "var(--bpm-font-size-lg)",
            color: "var(--bpm-text)",
          }}
        >
          <h2
            id="confirm-modal-title"
            style={{
              margin: 0,
              fontSize: "var(--bpm-font-size-lg)",
              fontWeight: 600,
              color: "var(--bpm-text)",
            }}
          >
            {title}
          </h2>
        </div>
        <div
          style={{
            padding: "16px 24px",
            flex: 1,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "var(--bpm-font-size-base)",
              color: "var(--bpm-text-muted)",
              lineHeight: 1.5,
            }}
          >
            {message}
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            gap: 12,
            padding: "16px 24px",
            borderTop: "1px solid var(--bpm-border)",
            background: "var(--bpm-bg-primary)",
          }}
        >
          <button
            type="button"
            className="bpm-confirm-modal-cancel"
            onClick={onCancel}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "8px 16px",
              border: "1px solid var(--bpm-border)",
              borderRadius: "var(--bpm-radius)",
              background: "transparent",
              color: "var(--bpm-text-primary)",
              fontSize: "var(--bpm-font-size-base)",
              fontWeight: 500,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="bpm-confirm-modal-confirm"
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "8px 16px",
              border: "none",
              borderRadius: "var(--bpm-radius)",
              background: styles.buttonBg,
              color: styles.buttonColor,
              fontSize: "var(--bpm-font-size-base)",
              fontWeight: 600,
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.8 : 1,
            }}
          >
            {isLoading ? "..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
