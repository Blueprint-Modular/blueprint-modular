"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { PromptInput } from "./PromptInput";
import { Avatar } from "./Avatar";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
}

export interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSend: (content: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  /** Contexte système affiché en haut si défini. */
  systemContext?: string;
  height?: string;
  className?: string;
}

export function ChatInterface({
  messages,
  onSend,
  isLoading = false,
  placeholder = "Écrivez votre message...",
  systemContext,
  height = "100%",
  className = "",
}: ChatInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleSubmit = useCallback(
    (value: string) => {
      onSend(value);
      setInputValue("");
    },
    [onSend]
  );

  const visibleMessages = messages.filter((m) => m.role !== "system");

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
      {systemContext && (
        <div
          style={{
            padding: 12,
            fontSize: "var(--bpm-font-size-sm)",
            color: "var(--bpm-text-muted)",
            borderBottom: "1px solid var(--bpm-border)",
            background: "var(--bpm-bg-secondary)",
          }}
        >
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
        {visibleMessages.map((m) => (
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
            {m.role !== "user" && (
              <Avatar size="small" initials={m.role === "assistant" ? "IA" : "S"} />
            )}
            <div
              style={{
                maxWidth: "80%",
                padding: "10px 14px",
                borderRadius: "var(--bpm-radius-md)",
                fontSize: "var(--bpm-font-size-base)",
                lineHeight: 1.5,
                background:
                  m.role === "user" ? "var(--bpm-accent)" : "var(--bpm-surface)",
                color:
                  m.role === "user"
                    ? "var(--bpm-accent-contrast)"
                    : "var(--bpm-text-primary)",
              }}
            >
              <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
            </div>
            {m.role === "user" && <Avatar size="small" initials="U" />}
          </div>
        ))}
        {isLoading && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: "var(--bpm-text-muted)",
              fontSize: "var(--bpm-font-size-base)",
            }}
          >
            <Avatar size="small" initials="IA" />
            <span>...</span>
          </div>
        )}
      </div>
      <div style={{ padding: 12, borderTop: "1px solid var(--bpm-border)" }}>
        <PromptInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSubmit}
          placeholder={placeholder}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
