"use client";

import React, { useMemo, useState } from "react";

export interface OrgChartNode {
  id: string;
  name: string;
  role?: string;
  avatar?: string;
  parentId?: string | null;
  children?: OrgChartNode[];
  metadata?: Record<string, string>;
}

export interface OrgChartProps {
  nodes: OrgChartNode[];
  direction?: "vertical" | "horizontal";
  onNodeClick?: (node: OrgChartNode) => void;
  expandable?: boolean;
  rootId?: string;
  className?: string;
}

function isUrl(s: string): boolean {
  return /^https?:\/\//i.test(s) || s.startsWith("data:");
}

function buildForest(nodes: OrgChartNode[], rootId?: string): OrgChartNode[] {
  const map = new Map(nodes.map((n) => [n.id, { ...n, children: [] as OrgChartNode[] }]));
  const roots: OrgChartNode[] = [];
  if (rootId && map.has(rootId)) {
    const r = map.get(rootId)!;
    for (const node of map.values()) {
      if (node.id === rootId) continue;
      if (node.parentId && map.has(node.parentId)) {
        map.get(node.parentId)!.children!.push(node);
      }
    }
    return [r];
  }
  for (const node of map.values()) {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

interface NodeCardProps {
  node: OrgChartNode;
  onNodeClick?: (node: OrgChartNode) => void;
  expandable?: boolean;
  expanded: Set<string>;
  toggle: (id: string) => void;
}

function NodeCard({ node, onNodeClick, expandable, expanded, toggle }: NodeCardProps) {
  const hasKids = (node.children?.length ?? 0) > 0;
  const isOpen = expanded.has(node.id);
  const av = node.avatar?.trim() ?? "";

  return (
    <div
      className="bpm-org-node"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
      }}
    >
      <button
        type="button"
        onClick={() => onNodeClick?.(node)}
        style={{
          width: "100%",
          maxWidth: 220,
          padding: 12,
          borderRadius: "var(--bpm-radius)",
          border: "1px solid var(--bpm-border)",
          background: "var(--bpm-surface)",
          boxShadow: "var(--bpm-shadow-sm)",
          cursor: onNodeClick ? "pointer" : "default",
          textAlign: "left",
          transition: "box-shadow 0.15s ease",
        }}
        onMouseEnter={(e) => {
          if (onNodeClick) e.currentTarget.style.boxShadow = "var(--bpm-shadow-md)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "var(--bpm-shadow-sm)";
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {av && isUrl(av) ? (
            <img src={av} alt="" width={40} height={40} style={{ borderRadius: "50%", objectFit: "cover" }} />
          ) : (
            <div
              aria-hidden
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "color-mix(in srgb, var(--bpm-accent) 22%, var(--bpm-surface))",
                color: "var(--bpm-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {(av || node.name).slice(0, 2).toUpperCase()}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--bpm-text-primary)" }}>{node.name}</div>
            {node.role && <div style={{ fontSize: 12, color: "var(--bpm-text-secondary)", marginTop: 2 }}>{node.role}</div>}
            {node.metadata &&
              Object.entries(node.metadata).map(([k, v]) => (
                <div key={k} style={{ fontSize: 11, color: "var(--bpm-text-secondary)", marginTop: 4 }}>
                  {k}: {v}
                </div>
              ))}
          </div>
          {expandable && hasKids && (
            <span
              role="button"
              tabIndex={0}
              aria-expanded={isOpen}
              aria-label={isOpen ? "Replier" : "Déplier"}
              className="material-symbols-outlined"
              onClick={(e) => {
                e.stopPropagation();
                toggle(node.id);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  toggle(node.id);
                }
              }}
              style={{
                cursor: "pointer",
                fontSize: 22,
                color: "var(--bpm-text-secondary)",
                fontFamily: "Material Symbols Outlined",
                fontVariationSettings: "'FILL' 0, 'wght' 400",
              }}
            >
              {isOpen ? "expand_less" : "expand_more"}
            </span>
          )}
        </div>
      </button>
    </div>
  );
}

function Subtree({
  node,
  direction,
  depth,
  onNodeClick,
  expandable,
  expanded,
  toggle,
}: {
  node: OrgChartNode;
  direction: "vertical" | "horizontal";
  depth: number;
  onNodeClick?: (node: OrgChartNode) => void;
  expandable?: boolean;
  expanded: Set<string>;
  toggle: (id: string) => void;
}) {
  const kids = node.children ?? [];
  const showKids = !expandable || expanded.has(node.id) || depth === 0;

  const childrenClass = direction === "vertical" ? "bpm-org-children-vertical" : "bpm-org-children-horizontal";

  return (
    <div style={{ display: "flex", flexDirection: direction === "vertical" ? "column" : "row", alignItems: "center", gap: 0 }}>
      <style>{`
        .bpm-org-children-vertical {
          display: flex;
          gap: 24px;
          position: relative;
          padding-top: 24px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .bpm-org-children-vertical::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          width: 0;
          height: 24px;
          border-left: 2px solid var(--bpm-border);
          transform: translateX(-1px);
        }
        .bpm-org-node-line::before {
          content: '';
          position: absolute;
          top: -24px;
          left: 50%;
          width: 2px;
          height: 24px;
          margin-left: -1px;
          background: var(--bpm-border);
        }
        .bpm-org-children-horizontal {
          display: flex;
          flex-direction: row;
          gap: 24px;
          position: relative;
          padding-left: 24px;
          align-items: center;
        }
        .bpm-org-children-horizontal::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          width: 24px;
          height: 0;
          border-top: 2px solid var(--bpm-border);
          transform: translateY(-1px);
        }
      `}</style>
      <div className={depth > 0 ? "bpm-org-node-line" : undefined} style={{ position: "relative" }}>
        <NodeCard node={node} onNodeClick={onNodeClick} expandable={expandable} expanded={expanded} toggle={toggle} />
      </div>
      {showKids && kids.length > 0 && (
        <div className={childrenClass} role="group" aria-label={`Équipe de ${node.name}`}>
          {kids.map((c) => (
            <Subtree
              key={c.id}
              node={c}
              direction={direction}
              depth={depth + 1}
              onNodeClick={onNodeClick}
              expandable={expandable}
              expanded={expanded}
              toggle={toggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * @component bpm.orgChart
 * @description Organigramme hiérarchique HTML/CSS, repliable.
 */
export function OrgChart({
  nodes,
  direction = "vertical",
  onNodeClick,
  expandable = false,
  rootId,
  className = "",
}: OrgChartProps) {
  const roots = useMemo(() => buildForest(nodes, rootId), [nodes, rootId]);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(roots.map((r) => r.id)));

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className={`bpm-org-chart ${className}`.trim()} style={{ overflowX: "auto", padding: 8 }} role="tree">
      <div style={{ display: "flex", flexDirection: direction === "vertical" ? "row" : "column", gap: 32, justifyContent: "center", flexWrap: "wrap" }}>
        {roots.map((r) => (
          <Subtree
            key={r.id}
            node={r}
            direction={direction}
            depth={0}
            onNodeClick={onNodeClick}
            expandable={expandable}
            expanded={expanded}
            toggle={toggle}
          />
        ))}
      </div>
    </div>
  );
}
