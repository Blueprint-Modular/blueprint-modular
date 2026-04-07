"use client";

import React, { useId, useMemo } from "react";

export interface PrintLayoutMarginsMm {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface PrintLayoutProps {
  children: React.ReactNode;
  orientation?: "portrait" | "landscape";
  header?: React.ReactNode;
  footer?: React.ReactNode;
  marginsMm?: PrintLayoutMarginsMm;
  className?: string;
}

/**
 * Mise en page écran + règles @page / @media print (marges mm, orientation).
 */
export function PrintLayout({
  children,
  orientation = "portrait",
  header,
  footer,
  marginsMm,
  className = "",
}: PrintLayoutProps) {
  const uid = useId().replace(/:/g, "");
  const rootClass = `bpm-print-${uid}`;

  const marginCss = useMemo(() => {
    const m = marginsMm ?? {};
    const t = m.top ?? 14;
    const r = m.right ?? 12;
    const b = m.bottom ?? 14;
    const l = m.left ?? 12;
    return `${t}mm ${r}mm ${b}mm ${l}mm`;
  }, [marginsMm]);

  const size = orientation === "landscape" ? "A4 landscape" : "A4 portrait";

  return (
    <div className={`${rootClass} ${className}`.trim()} style={{ color: "var(--bpm-text-primary)" }}>
      <style>{`
        @media print {
          @page {
            size: ${size};
            margin: ${marginCss};
          }
          .${rootClass} {
            background: var(--bpm-surface) !important;
            color: var(--bpm-text-primary) !important;
          }
          .${rootClass} .bpm-print-header-block,
          .${rootClass} .bpm-print-footer-block {
            display: block !important;
          }
        }
        .${rootClass} .bpm-print-header-block {
          padding-bottom: 12px;
          margin-bottom: 16px;
          border-bottom: 1px solid var(--bpm-border);
        }
        .${rootClass} .bpm-print-footer-block {
          padding-top: 12px;
          margin-top: 24px;
          border-top: 1px solid var(--bpm-border);
          font-size: 11px;
          color: var(--bpm-text-secondary);
        }
      `}</style>
      {header ? <header className="bpm-print-header-block">{header}</header> : null}
      <main>{children}</main>
      {footer ? <footer className="bpm-print-footer-block">{footer}</footer> : null}
    </div>
  );
}
