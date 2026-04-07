"use client";

import React, { useMemo, useState } from "react";

export type AddressInputMode = "single" | "fields";

export interface AddressInputProps {
  mode?: AddressInputMode;
  value?: {
    line1?: string;
    line2?: string;
    city?: string;
    postal?: string;
  };
  onChange?: (v: { line1: string; line2: string; city: string; postal: string }) => void;
  className?: string;
}

const FR_POSTAL = /^\d{5}$/;

export function AddressInput({
  mode = "fields",
  value,
  onChange,
  className = "",
}: AddressInputProps) {
  const [line1, setLine1] = useState(value?.line1 ?? "");
  const [line2, setLine2] = useState(value?.line2 ?? "");
  const [city, setCity] = useState(value?.city ?? "");
  const [postal, setPostal] = useState(value?.postal ?? "");
  const [single, setSingle] = useState(
    [value?.line1, value?.postal, value?.city].filter(Boolean).join(", "),
  );

  const emit = (next: {
    line1: string;
    line2: string;
    city: string;
    postal: string;
  }) => {
    onChange?.(next);
  };

  const postalError = useMemo(() => {
    if (!postal) return null;
    return FR_POSTAL.test(postal) ? null : "Code postal FR : 5 chiffres.";
  }, [postal]);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: "var(--bpm-radius-sm)",
    border: "1px solid var(--bpm-border)",
    background: "var(--bpm-surface)",
    color: "var(--bpm-text-primary)",
    fontSize: "var(--bpm-font-size-base)",
  };

  if (mode === "single") {
    return (
      <div className={className} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontSize: 13, color: "var(--bpm-text-secondary)" }}>Adresse</label>
        <input
          type="text"
          value={single}
          onChange={(e) => {
            setSingle(e.target.value);
            emit({
              line1: e.target.value,
              line2,
              city,
              postal,
            });
          }}
          placeholder="Rue, code postal, ville…"
          style={inputStyle}
        />
      </div>
    );
  }

  return (
    <div className={className} style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ fontSize: 13, color: "var(--bpm-text-secondary)" }}>Ligne 1</label>
        <input
          type="text"
          value={line1}
          onChange={(e) => {
            setLine1(e.target.value);
            emit({ line1: e.target.value, line2, city, postal });
          }}
          style={inputStyle}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ fontSize: 13, color: "var(--bpm-text-secondary)" }}>Ligne 2</label>
        <input
          type="text"
          value={line2}
          onChange={(e) => {
            setLine2(e.target.value);
            emit({ line1, line2: e.target.value, city, postal });
          }}
          style={inputStyle}
        />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "120px 1fr",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 13, color: "var(--bpm-text-secondary)" }}>Code postal</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={5}
            value={postal}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 5);
              setPostal(v);
              emit({ line1, line2, city, postal: v });
            }}
            style={{
              ...inputStyle,
              borderColor: postalError ? "var(--bpm-error)" : "var(--bpm-border)",
            }}
            aria-invalid={!!postalError}
          />
          {postalError && (
            <span style={{ fontSize: 12, color: "var(--bpm-error-text)" }}>{postalError}</span>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 13, color: "var(--bpm-text-secondary)" }}>Ville</label>
          <input
            type="text"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              emit({ line1, line2, city: e.target.value, postal });
            }}
            style={inputStyle}
          />
        </div>
      </div>
    </div>
  );
}
