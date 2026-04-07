"use client";

import React, { useMemo } from "react";

export type DecisionNode = {
  id: string;
  kind: "question" | "action" | "result";
  label: string;
  branches?: { label: string; targetId: string }[];
};

export type DecisionTreeProps = {
  rootId: string;
  nodes: DecisionNode[];
  currentNodeId?: string;
  onNodeClick: (nodeId: string, branch?: { label: string; targetId: string }) => void;
};

function NodeBox({
  node,
  isCurrent,
  onSelect,
}: {
  node: DecisionNode;
  isCurrent: boolean;
  onSelect: () => void;
}) {
  const baseBorder = isCurrent ? "2px solid var(--bpm-accent)" : "1px solid var(--bpm-border)";
  const baseBg = isCurrent
    ? "color-mix(in srgb, var(--bpm-accent) 14%, var(--bpm-surface))"
    : "var(--bpm-surface)";

  if (node.kind === "question") {
    const size = 88;
    return (
      <button
        type="button"
        onClick={onSelect}
        style={{
          width: size + 32,
          height: size + 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          padding: 0,
        }}
        aria-current={isCurrent ? "step" : undefined}
      >
        <div
          style={{
            width: size,
            height: size,
            transform: "rotate(45deg)",
            border: baseBorder,
            borderRadius: "var(--bpm-radius-sm)",
            background: baseBg,
            boxShadow: isCurrent ? "var(--bpm-shadow-sm)" : undefined,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              transform: "rotate(-45deg)",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--bpm-text-primary)",
              padding: 8,
              textAlign: "center",
              maxWidth: size - 16,
            }}
          >
            {node.label}
          </span>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        minWidth: 120,
        maxWidth: 220,
        padding: "12px 14px",
        borderRadius: "var(--bpm-radius)",
        border: baseBorder,
        background: baseBg,
        color: "var(--bpm-text-primary)",
        fontSize: 13,
        fontWeight: node.kind === "action" ? 600 : 500,
        cursor: "pointer",
        textAlign: "center",
        boxShadow: isCurrent ? "var(--bpm-shadow-sm)" : undefined,
      }}
      aria-current={isCurrent ? "step" : undefined}
    >
      {node.label}
    </button>
  );
}

function BranchRow({
  branch,
  onBranch,
}: {
  branch: { label: string; targetId: string };
  onBranch: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onBranch}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        borderRadius: "var(--bpm-radius-sm)",
        border: "1px solid var(--bpm-border)",
        background: "var(--bpm-bg-secondary, var(--bpm-surface))",
        color: "var(--bpm-text-primary)",
        fontSize: 12,
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "var(--bpm-radius-sm)",
          background: "var(--bpm-accent)",
          flexShrink: 0,
        }}
      />
      {branch.label}
    </button>
  );
}

function TreeSubtree({
  nodeId,
  nodeMap,
  currentNodeId,
  onNodeClick,
}: {
  nodeId: string;
  nodeMap: Map<string, DecisionNode>;
  currentNodeId?: string;
  onNodeClick: DecisionTreeProps["onNodeClick"];
}) {
  const node = nodeMap.get(nodeId);
  if (!node) {
    return (
      <div style={{ fontSize: 12, color: "var(--bpm-error)" }}>Unknown node: {nodeId}</div>
    );
  }

  const isCurrent = node.id === currentNodeId;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <NodeBox
        node={node}
        isCurrent={isCurrent}
        onSelect={() => onNodeClick(node.id)}
      />

      {node.branches && node.branches.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 10,
            maxWidth: 480,
            marginTop: 4,
          }}
        >
          {node.branches.map((b) => (
            <div key={`${node.id}-${b.label}-${b.targetId}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <BranchRow
                branch={b}
                onBranch={() => onNodeClick(node.id, b)}
              />
              <div
                style={{
                  width: 2,
                  minHeight: 16,
                  background: "var(--bpm-border)",
                  flexShrink: 0,
                }}
              />
              <TreeSubtree
                nodeId={b.targetId}
                nodeMap={nodeMap}
                currentNodeId={currentNodeId}
                onNodeClick={onNodeClick}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function DecisionTree({ rootId, nodes, currentNodeId, onNodeClick }: DecisionTreeProps) {
  const nodeMap = useMemo(() => {
    const m = new Map<string, DecisionNode>();
    for (const n of nodes) {
      m.set(n.id, n);
    }
    return m;
  }, [nodes]);

  return (
    <div
      style={{
        border: "1px solid var(--bpm-border)",
        borderRadius: "var(--bpm-radius)",
        background: "var(--bpm-surface)",
        color: "var(--bpm-text-primary)",
        padding: 20,
        overflow: "auto",
      }}
    >
      <TreeSubtree
        nodeId={rootId}
        nodeMap={nodeMap}
        currentNodeId={currentNodeId}
        onNodeClick={onNodeClick}
      />
    </div>
  );
}
