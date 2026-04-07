"use client";

import React, { useMemo, useState } from "react";

export interface ApprovalStep {
  id: string;
  approver: string;
  role?: string;
  status: "pending" | "approved" | "rejected" | "skipped";
  comment?: string;
  date?: string;
  avatar?: string;
}

export interface ApprovalFlowProps {
  steps: ApprovalStep[];
  onApprove?: (stepId: string, comment?: string) => void;
  onReject?: (stepId: string, comment?: string) => void;
  direction?: "horizontal" | "vertical";
  showCommentInput?: boolean;
  className?: string;
}

function initial(s: string): string {
  return s.trim().slice(0, 1).toUpperCase() || "?";
}

export function ApprovalFlow({
  steps,
  onApprove,
  onReject,
  direction: dirProp,
  showCommentInput = true,
  className = "",
}: ApprovalFlowProps) {
  const direction = dirProp ?? (steps.length < 5 ? "horizontal" : "vertical");
  const [comment, setComment] = useState("");
  const currentId = useMemo(() => steps.find((s) => s.status === "pending")?.id, [steps]);

  return (
    <div className={`bpm-approval-flow ${className}`.trim()} role="list" aria-label="Circuit de validation">
      <div
        style={{
          display: "flex",
          flexDirection: direction === "horizontal" ? "row" : "column",
          alignItems: direction === "horizontal" ? "flex-start" : "stretch",
          flexWrap: direction === "horizontal" ? "wrap" : undefined,
        }}
      >
        {steps.map((s, i) => (
          <React.Fragment key={s.id}>
            <div role="listitem" style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: direction === "horizontal" ? 140 : undefined }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 14,
                  border:
                    s.status === "approved"
                      ? "2px solid var(--bpm-success)"
                      : s.status === "rejected"
                        ? "2px solid var(--bpm-error)"
                        : s.status === "skipped"
                          ? "2px dashed var(--bpm-border)"
                          : "2px solid var(--bpm-border)",
                  background:
                    s.status === "approved"
                      ? "color-mix(in srgb, var(--bpm-success) 18%, var(--bpm-surface))"
                      : s.status === "rejected"
                        ? "color-mix(in srgb, var(--bpm-error) 18%, var(--bpm-surface))"
                        : "var(--bpm-surface)",
                  color: "var(--bpm-text-primary)",
                }}
              >
                {initial(s.approver)}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, marginTop: 6, textAlign: "center" }}>{s.approver}</div>
              {s.role && <div style={{ fontSize: 10, color: "var(--bpm-text-secondary)" }}>{s.role}</div>}
              <div style={{ fontSize: 10, marginTop: 4, color: "var(--bpm-text-secondary)" }}>{s.status}</div>
              {s.id === currentId && (onApprove || onReject) && (
                <div style={{ marginTop: 8, width: "100%" }}>
                  {showCommentInput && (
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={2}
                      placeholder="Commentaire"
                      style={{
                        width: "100%",
                        fontSize: 12,
                        padding: 6,
                        borderRadius: "var(--bpm-radius-sm)",
                        border: "1px solid var(--bpm-border)",
                        marginBottom: 6,
                        background: "var(--bpm-surface)",
                        color: "var(--bpm-text-primary)",
                      }}
                    />
                  )}
                  <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                    {onApprove && (
                      <button
                        type="button"
                        onClick={() => {
                          onApprove(s.id, comment || undefined);
                          setComment("");
                        }}
                        style={{
                          padding: "4px 10px",
                          fontSize: 11,
                          border: "none",
                          borderRadius: "var(--bpm-radius-sm)",
                          background: "var(--bpm-success)",
                          color: "var(--bpm-accent-contrast)",
                          cursor: "pointer",
                        }}
                      >
                        Approuver
                      </button>
                    )}
                    {onReject && (
                      <button
                        type="button"
                        onClick={() => {
                          onReject(s.id, comment || undefined);
                          setComment("");
                        }}
                        style={{
                          padding: "4px 10px",
                          fontSize: 11,
                          border: "1px solid var(--bpm-error)",
                          borderRadius: "var(--bpm-radius-sm)",
                          background: "transparent",
                          color: "var(--bpm-error)",
                          cursor: "pointer",
                        }}
                      >
                        Rejeter
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            {i < steps.length - 1 && (
              <div
                aria-hidden
                style={{
                  flex: direction === "horizontal" ? 1 : undefined,
                  minWidth: direction === "horizontal" ? 16 : undefined,
                  minHeight: direction === "vertical" ? 16 : undefined,
                  borderTop: direction === "horizontal" ? "2px dashed var(--bpm-border)" : undefined,
                  borderLeft: direction === "vertical" ? "2px dashed var(--bpm-border)" : undefined,
                  margin: direction === "horizontal" ? "24px 4px 0" : "0 0 0 22px",
                  alignSelf: direction === "horizontal" ? "flex-start" : "stretch",
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
