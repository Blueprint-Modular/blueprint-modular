"use client";

import React, { useState } from "react";

export interface TreeviewNode {
  id: string;
  label: React.ReactNode;
  children?: TreeviewNode[];
  defaultOpen?: boolean;
}

export interface TreeviewProps {
  nodes?: TreeviewNode[];
  onSelect?: (node: TreeviewNode) => void;
  selectedId?: string | null;
  className?: string;
}

function TreeNode(props: {
  node: TreeviewNode;
  level: number;
  onSelect?: (node: TreeviewNode) => void;
  selectedId?: string | null;
}) {
  const { node, level, onSelect, selectedId } = props;
  const [open, setOpen] = useState(node.defaultOpen ?? false);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;

  return (
    <div className="bpm-treeview-node">
      <div
        className="flex items-center gap-1 py-1 px-2 rounded cursor-pointer"
        style={{
          paddingLeft: level * 12 + 8,
          background: isSelected ? "var(--bpm-bg-secondary)" : "transparent",
          color: "var(--bpm-text-primary)",
        }}
        onClick={() => onSelect && onSelect(node)}
      >
        {hasChildren ? (
          <button
            type="button"
            className="w-5 h-5 flex items-center justify-center border-0 bg-transparent cursor-pointer text-xs"
            onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
            style={{ color: "var(--bpm-text-secondary)" }}
            aria-expanded={open}
          >
            {open ? "-" : ">"}
          </button>
        ) : (
          <span className="w-5 inline-block" />
        )}
        <span className="text-sm">{node.label}</span>
      </div>
      {hasChildren ? (
        <div className={`bpm-treeview-children ${open ? "bpm-treeview-children--expanded" : ""}`.trim()}>
          {node.children!.map((child) => (
            <TreeNode key={child.id} node={child} level={level + 1} onSelect={onSelect} selectedId={selectedId} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function Treeview(props: TreeviewProps) {
  const { nodes = [], onSelect, selectedId = null, className = "" } = props;
  return (
    <div
      className={"bpm-treeview border rounded-lg overflow-hidden " + className}
      style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)" }}
    >
      {nodes.map((node) => (
        <TreeNode key={node.id} node={node} level={0} onSelect={onSelect} selectedId={selectedId} />
      ))}
    </div>
  );
}
