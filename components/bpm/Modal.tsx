"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const MODAL_PORTAL_ZINDEX = 100000;

export type ModalSize = "small" | "medium" | "large";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  size?: ModalSize;
  showCloseButton?: boolean;
}

const sizeClasses: Record<ModalSize, string> = {
  small: "max-w-[400px] w-full",
  medium: "max-w-[600px] w-full",
  large: "max-w-[800px] w-full",
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "medium",
  showCloseButton = true,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const modalContent = (
    <div
      className={`bpm-modal-backdrop fixed inset-0 flex items-center justify-center p-8 transition-opacity ${
        !isOpen ? "opacity-0 invisible pointer-events-none" : ""
      }`}
      style={{
        zIndex: MODAL_PORTAL_ZINDEX,
        backgroundColor: "rgba(0,0,0,0.5)",
      }}
      onClick={handleBackdropClick}
    >
      <div
        className={`bpm-modal flex flex-col max-h-[90vh] overflow-hidden rounded-lg shadow-lg transition-all ${sizeClasses[size]} ${
          !isOpen ? "opacity-0 scale-95 pointer-events-none" : ""
        }`}
        style={{
          zIndex: MODAL_PORTAL_ZINDEX + 1,
          background: "var(--bpm-surface)",
          color: "var(--bpm-text-primary)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="bpm-modal-header flex justify-between items-center px-6 py-4 border-b flex-shrink-0"
          style={{
            background: "var(--bpm-sidebar-bg)",
            borderColor: "var(--bpm-sidebar-border)",
            color: "var(--bpm-sidebar-text)",
          }}
        >
          {title != null && (
            <h3 className="bpm-modal-title m-0 text-lg font-semibold" style={{ color: "var(--bpm-sidebar-text)" }}>
              {title}
            </h3>
          )}
          {showCloseButton && (
            <button
              type="button"
              className="bpm-modal-close w-8 h-8 flex items-center justify-center text-2xl leading-none rounded transition-colors hover:opacity-80"
              onClick={handleCloseClick}
              aria-label="Fermer"
              style={{ color: "var(--bpm-sidebar-text)", background: "transparent", border: "none" }}
            >
              ×
            </button>
          )}
        </div>
        <div
          className="bpm-modal-content p-6 overflow-y-auto overflow-x-visible flex-1 min-h-0"
          style={{ background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
        >
          {children}
        </div>
      </div>
    </div>
  );

  if (!mounted || typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
}
