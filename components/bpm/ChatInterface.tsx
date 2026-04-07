"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { PromptInput } from "./PromptInput";
import { Avatar } from "./Avatar";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  /** ISO ou texte libre, ou Date (affichage localisé court). */
  timestamp?: string | Date;
}

export interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSend: (content: string) => void;
  /** @deprecated Préférez `typing`. */
  isLoading?: boolean;
  /** Indicateur « en cours de frappe » côté assistant. */
  typing?: boolean;
  placeholder?: string;
  /** Contexte système affiché en haut si défini. */
  systemContext?: string;
  /** Titre dans l’en-tête du panneau. */
  title?: string;
  disabled?: boolean;
  height?: string;
  className?: string;
}

function formatMsgTime(ts: string | Date | undefined): string | null {
  if (ts == null) return null;
  if (typeof ts === "string") return ts;
  try {
    return ts.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return null;
  }
}

export function ChatInterface({
  messages,
  onSend,
  isLoading = false,
  typing,
  placeholder = "Écrivez votre message...",
  systemContext,
  title,
  disabled = false,
  height = "100%",
  className = "",
}: ChatInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");
  const assistantBusy = Boolean(isLoading || typing);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, assistantBusy]);

  const handleSubmit = useCallback(
    (value: string) => {
      onSend(value);
      setInputValue("");
    },
    [onSend]
  );

  return (
    <div
      className={className ? `bpm-chat-interface ${className}`.trim() : "bpm-chat-interface"}
      style={{
        display: "flex",
        flexDirection: "column",
        height,
        background: "var(--bpm-bg-primary)",
        borderRadius: "var(--bpm-radius)",
        border: "1px solid var(--bpm-border)",
        overflow: "hidden",
      }}
    >
      {(title || systemContext) && (
        <div
          style={{
            padding: 12,
            fontSize: "var(--bpm-font-size-sm)",
            color: "var(--bpm-text-muted)",
            borderBottom: "1px solid var(--bpm-border)",
            background: "var(--bpm-bg-secondary)",
          }}
        >
          {title && (
            <div
              style={{
                fontWeight: 600,
                color: "var(--bpm-text-primary)",
                marginBottom: systemContext ? 6 : 0,
                fontSize: "var(--bpm-font-size-base)",
              }}
            >
              {title}
            </div>
          )}
          {systemContext}
        </div>
      )}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {messages.map((m) => {
          if (m.role === "system") {
            const t = formatMsgTime(m.timestamp);
            return (
              <div
                key={m.id}
                role="status"
                style={{
                  textAlign: "center",
                  fontSize: "var(--bpm-font-size-sm)",
                  color: "var(--bpm-text-secondary)",
                  padding: "4px 8px",
                }}
              >
                <span style={{ whiteSpace: "pre-wrap" }}>{m.content}</span>
                {t != null && (
                  <span style={{ display: "block", fontSize: 11, marginTop: 4, color: "var(--bpm-text-muted)" }}>
                    {t}
                  </span>
                )}
              </div>
            );
          }
          const t = formatMsgTime(m.timestamp);
          return (
            <div
              key={m.id}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 12,
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              {m.role !== "user" && <Avatar size="small" initials={m.role === "assistant" ? "IA" : "S"} />}
              <div
                style={{
                  maxWidth: "80%",
                  padding: "10px 14px",
                  borderRadius: "var(--bpm-radius-md)",
                  fontSize: "var(--bpm-font-size-base)",
                  lineHeight: 1.5,
                  background:
                    m.role === "user"
                      ? "var(--bpm-accent)"
                      : "color-mix(in srgb, var(--bpm-accent) 12%, var(--bpm-surface))",
                  color:
                    m.role === "user" ? "var(--bpm-accent-contrast)" : "var(--bpm-text-primary)",
                  border: m.role === "user" ? "none" : "1px solid var(--bpm-border)",
                }}
              >
                <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
                {t != null && (
                  <div style={{ fontSize: 11, marginTop: 6, opacity: 0.75, textAlign: m.role === "user" ? "right" : "left" }}>
                    {t}
                  </div>
                )}
              </div>
              {m.role === "user" && <Avatar size="small" initials="U" />}
            </div>
          );
        })}
        {assistantBusy && (
          <div
            role="status"
            aria-live="polite"
            aria-label="Assistant en cours de réponse"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: "var(--bpm-text-muted)",
              fontSize: "var(--bpm-font-size-base)",
            }}
          >
            <Avatar size="small" initials="IA" />
            <span className="bpm-chat-typing-dots" style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", opacity: 0.9 }} />
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", opacity: 0.6 }} />
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", opacity: 0.35 }} />
            </span>
          </div>
        )}
      </div>
      <div style={{ padding: 12, borderTop: "1px solid var(--bpm-border)" }}>
        <PromptInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSubmit}
          placeholder={placeholder}
          isLoading={assistantBusy}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
