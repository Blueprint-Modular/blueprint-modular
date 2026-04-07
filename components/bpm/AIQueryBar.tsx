"use client";

import React, { useState } from "react";
import { Spinner } from "./Spinner";

export interface AIQueryBarProps {
  onQuery: (question: string) => Promise<string>;
  placeholder?: string;
  suggestions?: string[];
  loading?: boolean;
  className?: string;
}

export function AIQueryBar({
  onQuery,
  placeholder = "Posez une question sur vos données...",
  suggestions = [],
  loading: loadingProp,
  className = "",
}: AIQueryBarProps) {
  const [q, setQ] = useState("");
  const [ans, setAns] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [hist, setHist] = useState<string[]>([]);
  const [openHist, setOpenHist] = useState(false);
  const loading = loadingProp ?? busy;

  const run = async () => {
    const t = q.trim();
    if (!t) return;
    setBusy(true);
    setAns(null);
    try {
      const r = await onQuery(t);
      setAns(r);
      setHist((h) => [t, ...h.filter((x) => x !== t)].slice(0, 3));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`bpm-ai-query-bar ${className}`.trim()} style={{ maxWidth: 560 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          border: "1px solid var(--bpm-border)",
          borderRadius: "var(--bpm-radius)",
          background: "var(--bpm-surface)",
        }}
      >
        <span className="material-symbols-outlined" aria-hidden style={{ color: "var(--bpm-accent)", fontSize: 22 }}>
          auto_awesome
        </span>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder={placeholder}
          aria-label={placeholder}
          disabled={loading}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: 15,
            background: "transparent",
            color: "var(--bpm-text-primary)",
          }}
        />
        {loading ? (
          <Spinner size="small" text="" />
        ) : (
          <button
            type="button"
            onClick={run}
            style={{
              padding: "6px 12px",
              borderRadius: "var(--bpm-radius-sm)",
              border: "none",
              background: "var(--bpm-accent)",
              color: "var(--bpm-accent-contrast)",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Envoyer
          </button>
        )}
      </div>
      {suggestions.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setQ(s);
              }}
              style={{
                padding: "4px 10px",
                fontSize: 12,
                borderRadius: 999,
                border: "1px solid var(--bpm-border)",
                background: "var(--bpm-bg-secondary)",
                cursor: "pointer",
                color: "var(--bpm-text-primary)",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
      {ans != null && (
        <div
          role="status"
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: "var(--bpm-radius)",
            border: "1px solid var(--bpm-border)",
            background: "var(--bpm-bg-secondary)",
            fontSize: 14,
            color: "var(--bpm-text-primary)",
            whiteSpace: "pre-wrap",
          }}
        >
          {ans}
        </div>
      )}
      {hist.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <button
            type="button"
            onClick={() => setOpenHist(!openHist)}
            style={{ fontSize: 12, border: "none", background: "none", color: "var(--bpm-accent)", cursor: "pointer" }}
          >
            Historique ({hist.length})
          </button>
          {openHist && (
            <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 13, color: "var(--bpm-text-secondary)" }}>
              {hist.map((h) => (
                <li key={h}>
                  <button type="button" onClick={() => setQ(h)} style={{ border: "none", background: "none", cursor: "pointer", color: "inherit", textAlign: "left" }}>
                    {h}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
