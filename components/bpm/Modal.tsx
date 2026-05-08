"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const MODAL_PORTAL_ZINDEX = 100000;

export type ModalSize = "small" | "medium" | "large";

/**
 * @component bpm.modal
 * @description Fenêtre modale avec backdrop, fermeture Échap/clic extérieur. Pattern: {isOpen && bpm.modal({...})}
 * @example
 * bpm.modal({ isOpen: true, onClose: () => setOpen(false), title: "Confirmation", children: <p>Contenu</p> })
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Contrôle l'affichage. Obligatoire.
 * @param {function} props.onClose - Callback de fermeture. Obligatoire.
 * @param {React.ReactNode} [props.title] - Titre de la modale. Optionnel.
 * @param {React.ReactNode} props.children - Contenu. Obligatoire.
 * @param {"small"|"medium"|"large"} [props.size="medium"] - Taille (400/600/800px). Optionnel.
 * @param {boolean} [props.showCloseButton=true] - Affiche le bouton fermer. Optionnel.
 *
 * @associated bpm.button, bpm.input, bpm.selectbox, bpm.confirmModal
 * @forbidden bpm.modal (pas d'imbrication)
 */
/** Modal dialog. PATTERN : {isOpen && bpm.modal({ isOpen:true, onClose, title, children })} — TOUJOURS dans return(), jamais après. */
export interface ModalProps {
  /** PARENT: dans le return() de la page — jamais dans un sous-composant. INTERDIT: bpm.modal imbriqué dans un autre bpm.modal. ASSOCIÉ: bpm.button (déclencheur), bpm.input (formulaire), bpm.selectbox. */
  /** Contrôle l'affichage. PATTERN OBLIGATOIRE : {isOpen && bpm.modal({ isOpen:true, ... })} */
  isOpen: boolean;
  /** Callback de fermeture — obligatoire. */
  onClose: () => void;
  title?: React.ReactNode;
  /** Contenu du modal. */
  children: React.ReactNode;
  /** Largeur : small=400px, medium=600px, large=800px. */
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
      className={`bpm-modal-backdrop fixed inset-0 flex items-center justify-center p-4 sm:p-8 transition-opacity ${
        !isOpen ? "opacity-0 invisible pointer-events-none" : ""
      }`}
      style={{
        zIndex: MODAL_PORTAL_ZINDEX,
        backgroundColor: "var(--bpm-overlay-bg)",
      }}
      onClick={handleBackdropClick}
    >
      <div
        className={`bpm-modal flex flex-col max-h-[90vh] overflow-hidden transition-all ${sizeClasses[size]} ${
          !isOpen ? "opacity-0 scale-95 pointer-events-none" : ""
        }`}
        style={{
          zIndex: MODAL_PORTAL_ZINDEX + 1,
          background: "var(--bpm-surface)",
          color: "var(--bpm-text-primary)",
          borderRadius: "var(--bpm-radius)",
          boxShadow: "var(--bpm-shadow)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="bpm-modal-header flex justify-between items-center border-b flex-shrink-0"
          style={{
            padding: "16px 20px",
            background: "var(--bpm-bg-secondary)",
            borderColor: "var(--bpm-border)",
            color: "var(--bpm-text)",
            fontWeight: 600,
            fontSize: "var(--bpm-font-size-lg)",
          }}
        >
          {title != null && (
            <h3 className="bpm-modal-title m-0" style={{ color: "var(--bpm-text)", fontWeight: 600, fontSize: "var(--bpm-font-size-lg)" }}>
              {title}
            </h3>
          )}
          {showCloseButton && (
            <button
              type="button"
              className="bpm-modal-close w-8 h-8 flex items-center justify-center text-2xl leading-none rounded transition-colors hover:opacity-80"
              onClick={handleCloseClick}
              aria-label="Fermer"
              style={{ color: "var(--bpm-text)", background: "transparent", border: "none" }}
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
