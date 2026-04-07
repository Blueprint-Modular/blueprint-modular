"use client";

import React, { useState } from "react";
import { RichTextEditor } from "./RichTextEditor";

export interface EmailTemplate {
  id: string;
  label: string;
  subject: string;
  bodyHtml: string;
}

export interface EmailComposerProps {
  to?: string;
  subject?: string;
  body?: string;
  templates?: EmailTemplate[];
  useRichText?: boolean;
  onSend?: (payload: { to: string; subject: string; bodyHtml: string }) => void;
  onCancel?: () => void;
  className?: string;
}

export function EmailComposer({
  to: toInit = "",
  subject: subInit = "",
  body: bodyInit = "",
  templates = [],
  useRichText = true,
  onSend,
  onCancel,
  className = "",
}: EmailComposerProps) {
  const [to, setTo] = useState(toInit);
  const [subject, setSubject] = useState(subInit);
  const [bodyHtml, setBodyHtml] = useState(bodyInit);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: "var(--bpm-radius-sm)",
    border: "1px solid var(--bpm-border)",
    background: "var(--bpm-surface)",
    color: "var(--bpm-text-primary)",
    fontSize: "var(--bpm-font-size-base)",
  };

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: 16,
        border: "1px solid var(--bpm-border)",
        borderRadius: "var(--bpm-radius)",
        background: "var(--bpm-surface)",
      }}
    >
      {templates.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 13, color: "var(--bpm-text-secondary)" }}>Modèle</label>
          <select
            style={inputStyle}
            defaultValue=""
            onChange={(e) => {
              const t = templates.find((x) => x.id === e.target.value);
              if (t) {
                setSubject(t.subject);
                setBodyHtml(t.bodyHtml);
              }
            }}
          >
            <option value="">— Choisir —</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ fontSize: 13, color: "var(--bpm-text-secondary)" }}>À</label>
        <input type="email" value={to} onChange={(e) => setTo(e.target.value)} style={inputStyle} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ fontSize: 13, color: "var(--bpm-text-secondary)" }}>Objet</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={inputStyle}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ fontSize: 13, color: "var(--bpm-text-secondary)" }}>Message</label>
        {useRichText ? (
          <RichTextEditor
            value={bodyHtml}
            onChange={({ html }) => setBodyHtml(html)}
            minHeight={200}
            maxHeight={400}
          />
        ) : (
          <textarea
            value={bodyHtml}
            onChange={(e) => setBodyHtml(e.target.value)}
            rows={10}
            style={{
              ...inputStyle,
              resize: "vertical",
              fontFamily: "inherit",
            }}
          />
        )}
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "8px 16px",
              borderRadius: "var(--bpm-radius-sm)",
              border: "1px solid var(--bpm-border)",
              background: "var(--bpm-bg-secondary)",
              color: "var(--bpm-text-primary)",
              cursor: "pointer",
            }}
          >
            Annuler
          </button>
        )}
        {onSend && (
          <button
            type="button"
            onClick={() => onSend({ to, subject, bodyHtml })}
            style={{
              padding: "8px 16px",
              borderRadius: "var(--bpm-radius-sm)",
              border: "1px solid var(--bpm-accent)",
              background: "var(--bpm-accent)",
              color: "var(--bpm-accent-contrast)",
              cursor: "pointer",
            }}
          >
            Envoyer
          </button>
        )}
      </div>
    </div>
  );
}
