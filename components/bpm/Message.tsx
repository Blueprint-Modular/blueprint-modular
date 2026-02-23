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
