"use client";

import React from "react";

export type MessageType = "info" | "success" | "warning" | "error";

export interface MessageProps {
  type?: MessageType;
  children: React.ReactNode;
  className?: string;
}

const typeStyles: Record<MessageType, { bg: string; border: string }> = {
  info: { bg: "rgba(0,163,224,0.1)", border: "var(--bpm-accent-cyan)" },
  success: { bg: "rgba(69,208,158,0.15)", border: "var(--bpm-accent-mint)" },
  warning: { bg: "rgba(245,158,11,0.15)", border: "#f59e0b" },
  error: { bg: "rgba(239,68,68,0.15)", border: "#ef4444" },
};

/**
 * @component bpm.message
 * @description Bandeau de message contextuel (succès, avertissement, erreur) pour retours utilisateur après action.
 * @example
 * bpm.message({ type: "success", children: "Devis enregistré et envoyé au client." })
 * @props
 * - type ('info' | 'success' | 'warning' | 'error', optionnel) — Type de message. Default: 'info'.
 * - children (ReactNode) — Texte du message.
 * - className (string, optionnel) — Classes CSS.
 * @usage Retour après enregistrement, validation formulaire, erreur API.
 * @context PARENT: bpm.panel | bpm.modal | page directe. ASSOCIATED: bpm.button, bpm.input. FORBIDDEN: aucun.
 */
export function Message({
  type = "info",
  children,
  className = "",
}: MessageProps) {
  const style = typeStyles[type];
  return (
    <div
      className={`bpm-message bpm-message-${type} rounded-lg border px-4 py-3 ${className}`}
      role="alert"
      style={{
        backgroundColor: style.bg,
        borderColor: style.border,
        color: "var(--bpm-text-primary)",
      }}
    >
      {children}
    </div>
  );
}
