"use client";

import React, { useCallback, useRef, useState } from "react";
import { Button } from "./Button";

export interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  maxLength?: number;
  showTokenCount?: boolean;
  minRows?: number;
  maxRows?: number;
  className?: string;
}

const DEFAULT_MIN_ROWS = 3;
const DEFAULT_MAX_ROWS = 8;
const LINE_HEIGHT_PX = 24;

export function PromptInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Écrivez votre message...",
  isLoading = false,
  maxLength,
  showTokenCount = false,
  minRows = DEFAULT_MIN_ROWS,
  maxRows = DEFAULT_MAX_ROWS,
  className = "",
}: PromptInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [rows, setRows] = useState(minRows);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const v = e.target.value;
      if (maxLength != null && v.length > maxLength) return;
      onChange(v);
      // Auto-resize
      const ta = e.target;
      const lineCount = (ta.value.match(/\n/g) || []).length + 1;
      const next = Math.min(maxRows, Math.max(minRows, lineCount));
      setRows(next);
    },
    [onChange, maxLength, minRows, maxRows]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (!value.trim() || isLoading) return;
        onSubmit(value);
      }
      if (e.key === "Escape") {
        if (value === "") (textareaRef.current as HTMLTextAreaElement | null)?.blur();
        else onChange("");
      }
    },
    [value, isLoading, onSubmit, onChange]
  );

  const handleSubmitClick = () => {
    if (!value.trim() || isLoading) return;
    onSubmit(value);
  };

  const tokenCount = showTokenCount ? Math.ceil(value.length / 4) : null;
  const disabled = isLoading || !value.trim();

  return (
    <div
      className={className ? `bpm-prompt-input ${className}`.trim() : "bpm-prompt-input"}
      style={{
        border: "1px solid var(--bpm-border)",
        borderRadius: "var(--bpm-radius-md)",
        background: "var(--bpm-bg-primary)",
        overflow: "hidden",
      }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isLoading}
        rows={rows}
        maxLength={maxLength}
        style={{
          width: "100%",
          minHeight: minRows * LINE_HEIGHT_PX,
          maxHeight: maxRows * LINE_HEIGHT_PX,
          padding: 12,
          border: "none",
          outline: "none",
          resize: "none",
          fontFamily: "inherit",
          fontSize: "var(--bpm-font-size-base)",
          lineHeight: LINE_HEIGHT_PX / 14,
          color: "var(--bpm-text-primary)",
          background: "transparent",
          boxSizing: "border-box",
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          borderTop: "1px solid var(--bpm-border)",
          background: "var(--bpm-bg-secondary)",
        }}
      >
        <span style={{ fontSize: "var(--bpm-font-size-sm)", color: "var(--bpm-text-muted)" }}>
          {maxLength != null && `${value.length} / ${maxLength}`}
          {showTokenCount && tokenCount != null && (maxLength != null ? " · " : "")}
          {showTokenCount && tokenCount != null && `~${tokenCount} tokens`}
        </span>
        <Button
          type="button"
          variant="primary"
          size="small"
          onClick={handleSubmitClick}
          disabled={disabled}
        >
          {isLoading ? "..." : "Envoyer"}
        </Button>
      </div>
    </div>
  );
}
