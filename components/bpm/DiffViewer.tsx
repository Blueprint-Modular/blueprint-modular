"use client";

import React from "react";

export interface DiffViewerProps {
  original: string;
  modified: string;
  language?: string;
  mode?: "split" | "unified";
  title?: { original?: string; modified?: string };
  className?: string;
}

type LineKind = "add" | "remove" | "same";

interface DiffLine {
  kind: LineKind;
  content: string;
  oldNum?: number;
  newNum?: number;
}

function computeUnifiedLines(original: string, modified: string): DiffLine[] {
  const a = original.split(/\r?\n/);
  const b = modified.split(/\r?\n/);
  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;
  let oldNum = 1;
  let newNum = 1;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) {
      result.push({ kind: "same", content: a[i], oldNum: oldNum++, newNum: newNum++ });
      i++;
      j++;
    } else if (j < b.length && (i >= a.length || (i < a.length && b[j] !== a[i] && (i + 1 >= a.length || a[i + 1] !== b[j])))) {
      result.push({ kind: "add", content: b[j], newNum: newNum++ });
      j++;
    } else if (i < a.length) {
      result.push({ kind: "remove", content: a[i], oldNum: oldNum++ });
      i++;
    }
  }
  return result;
}

function computeSplitLines(original: string, modified: string): { left: DiffLine[]; right: DiffLine[] } {
  const a = original.split(/\r?\n/);
  const b = modified.split(/\r?\n/);
  const left: DiffLine[] = [];
  const right: DiffLine[] = [];
  let i = 0;
  let j = 0;
  let oldNum = 1;
  let newNum = 1;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) {
      left.push({ kind: "same", content: a[i], oldNum: oldNum++ });
      right.push({ kind: "same", content: b[j], newNum: newNum++ });
      i++;
      j++;
      newNum++;
    } else if (j < b.length && (i >= a.length || (i < a.length && b[j] !== a[i] && (i + 1 >= a.length || a[i + 1] !== b[j])))) {
      left.push({ kind: "same", content: "", oldNum: undefined });
      right.push({ kind: "add", content: b[j], newNum: newNum++ });
      j++;
    } else if (i < a.length) {
      left.push({ kind: "remove", content: a[i], oldNum: oldNum++ });
      right.push({ kind: "same", content: "", newNum: undefined });
      i++;
    }
  }
  return { left, right };
}

export function DiffViewer({
  original,
  modified,
  mode = "split",
  title,
  className = "",
}: DiffViewerProps) {
  const fontFamily = "ui-monospace, monospace";
  const lineHeight = 20;
  const lineNumWidth = 48;

  if (mode === "unified") {
    const lines = computeUnifiedLines(original, modified);
    return (
      <div
        className={className ? `bpm-diff-viewer ${className}`.trim() : "bpm-diff-viewer"}
        style={{
          border: "1px solid var(--bpm-border)",
          borderRadius: "var(--bpm-radius)",
          overflow: "hidden",
          fontSize: "var(--bpm-font-size-base)",
          background: "var(--bpm-bg-primary)",
        }}
      >
        <div style={{ display: "flex", fontFamily }}>
          <div
            style={{
              width: lineNumWidth,
              minWidth: lineNumWidth,
              padding: "8px 8px 8px 12px",
              background: "var(--bpm-bg-secondary)",
              color: "var(--bpm-text-muted)",
              borderRight: "1px solid var(--bpm-border)",
              lineHeight,
              userSelect: "none",
            }}
          >
            {lines.map((_, idx) => (
              <div key={idx} style={{ height: lineHeight }} />
            ))}
          </div>
          <div style={{ flex: 1, overflow: "auto", minWidth: 0 }}>
            {lines.map((line, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  minHeight: lineHeight,
                  lineHeight,
                  padding: "0 12px",
                  background:
                    line.kind === "add"
                      ? "var(--bpm-diff-add-bg)"
                      : line.kind === "remove"
                        ? "var(--bpm-diff-remove-bg)"
                        : "transparent",
                  color: "var(--bpm-text)",
                }}
              >
                <span
                  style={{
                    width: 20,
                    flexShrink: 0,
                    color:
                      line.kind === "add"
                        ? "var(--bpm-success)"
                        : line.kind === "remove"
                          ? "var(--bpm-error)"
                          : "var(--bpm-text-muted)",
                  }}
                >
                  {line.kind === "add" ? "+" : line.kind === "remove" ? "-" : " "}
                </span>
                <span style={{ whiteSpace: "pre", wordBreak: "break-all" }}>{line.content || " "}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { left, right } = computeSplitLines(original, modified);
  const renderColumn = (lines: DiffLine[], side: "left" | "right") => (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", fontFamily, flex: 1 }}>
        <div
          style={{
            width: lineNumWidth,
            minWidth: lineNumWidth,
            padding: "8px 8px 8px 12px",
            background: "var(--bpm-bg-secondary)",
            color: "var(--bpm-text-muted)",
            borderRight: "1px solid var(--bpm-border)",
            lineHeight,
            userSelect: "none",
          }}
        >
          {lines.map((l, idx) => (
            <div key={idx} style={{ height: lineHeight }}>
              {(side === "left" ? l.oldNum : l.newNum) ?? ""}
            </div>
          ))}
        </div>
        <div style={{ flex: 1, overflow: "auto", minWidth: 0 }}>
          {lines.map((line, idx) => (
            <div
              key={idx}
              style={{
                minHeight: lineHeight,
                lineHeight,
                padding: "0 12px",
                background:
                  line.kind === "add"
                    ? "var(--bpm-diff-add-bg)"
                    : line.kind === "remove"
                      ? "var(--bpm-diff-remove-bg)"
                      : "transparent",
                color: "var(--bpm-text)",
                whiteSpace: "pre",
                wordBreak: "break-all",
              }}
            >
              {line.content || " "}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={className ? `bpm-diff-viewer ${className}`.trim() : "bpm-diff-viewer"}
      style={{
        border: "1px solid var(--bpm-border)",
        borderRadius: "var(--bpm-radius)",
        overflow: "hidden",
        fontSize: "var(--bpm-font-size-base)",
        background: "var(--bpm-bg-primary)",
      }}
    >
      {title && (title.original || title.modified) && (
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--bpm-border)",
            background: "var(--bpm-bg-secondary)",
            padding: "8px 12px",
            fontSize: "var(--bpm-font-size-sm)",
            fontWeight: 600,
            color: "var(--bpm-text-secondary)",
          }}
        >
          <div style={{ flex: 1 }}>{title.original ?? ""}</div>
          <div style={{ flex: 1 }}>{title.modified ?? ""}</div>
        </div>
      )}
      <div style={{ display: "flex", minHeight: 120 }}>
        {renderColumn(left, "left")}
        <div style={{ width: 1, background: "var(--bpm-border)" }} />
        {renderColumn(right, "right")}
      </div>
    </div>
  );
}
