"use client";

import React, { useState } from "react";

export interface JsonViewerProps {
  /** Objet ou chaîne JSON à afficher. */
  data: unknown;
  /** Nombre de niveaux ouverts par défaut (0 = tout replié). */
  defaultExpandedLevel?: number;
  /** Hauteur max en px pour scroll. */
  maxHeight?: number;
  className?: string;
}

function formatValue(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") return `"${value.replace(/"/g, '\\"')}"`;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return `[${value.length} items]`;
  if (typeof value === "object") return `{${Object.keys(value).length} keys}`;
  return String(value);
}

function JsonNode({
  name,
  value,
  level,
  defaultExpandedLevel,
}: {
  name?: string;
  value: unknown;
  level: number;
  defaultExpandedLevel: number;
}) {
  const [open, setOpen] = useState(level < defaultExpandedLevel);
  const isObj = value !== null && typeof value === "object" && !Array.isArray(value);
  const isArr = Array.isArray(value);
  const expandable = isObj || isArr;

  if (!expandable) {
    return (
      <div className="flex gap-2 flex-wrap" style={{ paddingLeft: `${level * 12}px` }}>
        {name != null && (
          <span style={{ color: "var(--bpm-accent-cyan)" }}>&quot;{name}&quot;:</span>
        )}
        <span style={{ color: value === null ? "var(--bpm-text-secondary)" : "var(--bpm-accent-mint)" }}>
          {formatValue(value)}
        </span>
      </div>
    );
  }

  const keys = isArr ? value.map((_, i) => String(i)) : Object.keys(value as object);
  const len = isArr ? (value as unknown[]).length : keys.length;

  return (
    <div style={{ paddingLeft: level > 0 ? 12 : 0 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-left w-full py-0.5 rounded hover:opacity-80"
        style={{ color: "var(--bpm-text-primary)" }}
      >
        <span className="shrink-0 w-4">{open ? "▼" : "▶"}</span>
        {name != null && (
          <span style={{ color: "var(--bpm-accent-cyan)" }}>&quot;{name}&quot;:</span>
        )}
        <span style={{ color: "var(--bpm-text-secondary)" }}>
          {isArr ? `[${len}]` : `{${len}}`}
        </span>
      </button>
      {open && (
        <div className="border-l pl-2 ml-2" style={{ borderColor: "var(--bpm-border)" }}>
          {keys.map((k) => (
            <JsonNode
              key={k}
              name={isArr ? undefined : k}
              value={isArr ? (value as unknown[])[Number(k)] : (value as Record<string, unknown>)[k]}
              level={level + 1}
              defaultExpandedLevel={defaultExpandedLevel}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * @component bpm.jsonViewer
 * @description Affiche un objet JSON de façon repliable et lisible pour debug ou inspection de réponses API.
 * @example
 * bpm.jsonViewer({ data: { contrat: "Premium", ca: 125000 }, defaultExpandedLevel: 1 })
 * @props
 * - data (unknown) — Objet ou chaîne JSON à afficher.
 * - defaultExpandedLevel (number, optionnel) — Niveaux ouverts par défaut (0 = tout replié). Default: 1.
 * - maxHeight (number, optionnel) — Hauteur max en px avec scroll. Default: 400.
 * - className (string, optionnel) — Classes CSS.
 * @usage Inspection de payload API, logs structurés, configuration.
 * @context PARENT: bpm.panel | bpm.modal. ASSOCIATED: bpm.codeBlock, bpm.message. FORBIDDEN: aucun.
 */
export function JsonViewer({
  data,
  defaultExpandedLevel = 1,
  maxHeight = 400,
  className = "",
}: JsonViewerProps) {
  let parsed: unknown = data;
  if (typeof data === "string") {
    try {
      parsed = JSON.parse(data);
    } catch {
      return (
        <pre
          className={`p-3 rounded-lg text-sm overflow-x-auto ${className}`}
          style={{
            background: "var(--bpm-code-bg)",
            border: "1px solid var(--bpm-border)",
            color: "var(--bpm-text-primary)",
          }}
        >
          {data}
        </pre>
      );
    }
  }

  return (
    <div
      className={`bpm-json-viewer overflow-auto rounded-lg border p-3 text-sm font-mono ${className}`.trim()}
      style={{
        maxHeight,
        borderColor: "var(--bpm-border)",
        background: "var(--bpm-bg-primary)",
        color: "var(--bpm-text-primary)",
      }}
    >
      <JsonNode value={parsed} level={0} defaultExpandedLevel={defaultExpandedLevel} />
    </div>
  );
}
