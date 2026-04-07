"use client";

import React, { useState } from "react";

export type PLCProtocol = "modbus-tcp" | "opc-ua" | "mqtt" | "ethernet-ip";

export interface PLCConnectorProps {
  className?: string;
}

export function PLCConnector({ className = "" }: PLCConnectorProps) {
  const [protocol, setProtocol] = useState<PLCProtocol>("modbus-tcp");
  const [endpoint, setEndpoint] = useState("192.168.1.10:502");
  const [topics, setTopics] = useState("line1/pressures/*");
  const [status, setStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected");

  const field: React.CSSProperties = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: "var(--bpm-radius-sm)",
    border: "1px solid var(--bpm-border)",
    background: "var(--bpm-surface)",
    color: "var(--bpm-text-primary)",
    fontSize: "var(--bpm-font-size-base)",
  };

  const statusColor =
    status === "connected"
      ? "var(--bpm-success-text)"
      : status === "connecting"
        ? "var(--bpm-warning-text)"
        : "var(--bpm-text-muted)";

  return (
    <div
      className={className}
      style={{
        border: "1px solid var(--bpm-border)",
        borderRadius: "var(--bpm-radius)",
        padding: 16,
        background: "var(--bpm-surface)",
        maxWidth: 420,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ fontWeight: 700, color: "var(--bpm-text-primary)" }}>Connexion automate</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ fontSize: 13, color: "var(--bpm-text-secondary)" }}>Protocole</label>
        <select
          value={protocol}
          onChange={(e) => setProtocol(e.target.value as PLCProtocol)}
          style={field}
        >
          <option value="modbus-tcp">Modbus TCP</option>
          <option value="opc-ua">OPC UA</option>
          <option value="mqtt">MQTT</option>
          <option value="ethernet-ip">EtherNet/IP</option>
        </select>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ fontSize: 13, color: "var(--bpm-text-secondary)" }}>Point de terminaison</label>
        <input
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          style={field}
          placeholder="hôte:port ou URL"
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <label style={{ fontSize: 13, color: "var(--bpm-text-secondary)" }}>
          Topics / tags (aperçu)
        </label>
        <textarea
          value={topics}
          onChange={(e) => setTopics(e.target.value)}
          rows={3}
          style={{ ...field, resize: "vertical", fontFamily: "inherit" }}
        />
      </div>
      <div style={{ fontSize: 13, color: statusColor }}>
        État :{" "}
        <strong>
          {status === "connected"
            ? "Connecté"
            : status === "connecting"
              ? "Connexion…"
              : "Déconnecté"}
        </strong>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => {
            setStatus("connecting");
            window.setTimeout(() => setStatus("connected"), 800);
          }}
          style={{
            padding: "8px 14px",
            borderRadius: "var(--bpm-radius-sm)",
            border: "1px solid var(--bpm-accent)",
            background: "var(--bpm-accent)",
            color: "var(--bpm-accent-contrast)",
            cursor: "pointer",
          }}
        >
          Connecter
        </button>
        <button
          type="button"
          onClick={() => setStatus("disconnected")}
          style={{
            padding: "8px 14px",
            borderRadius: "var(--bpm-radius-sm)",
            border: "1px solid var(--bpm-border)",
            background: "var(--bpm-bg-secondary)",
            color: "var(--bpm-text-primary)",
            cursor: "pointer",
          }}
        >
          Déconnecter
        </button>
        <button
          type="button"
          onClick={() => setStatus("connecting")}
          style={{
            padding: "8px 14px",
            borderRadius: "var(--bpm-radius-sm)",
            border: "1px solid var(--bpm-border)",
            background: "var(--bpm-surface)",
            color: "var(--bpm-text-primary)",
            cursor: "pointer",
          }}
        >
          Tester
        </button>
      </div>
    </div>
  );
}
