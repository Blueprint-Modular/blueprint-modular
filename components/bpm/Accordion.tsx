"use client";

import React, { useState } from "react";

export interface AccordionSection {
  id?: string;
  title: React.ReactNode;
  content: React.ReactNode;
}

export interface AccordionProps {
  sections?: AccordionSection[];
  allowMultiple?: boolean;
  defaultOpenIds?: string[];
  className?: string;
}

/**
 * @component bpm.accordion
 * @description Liste de sections repliables (FAQ, procedures) avec une ou plusieurs ouvertes.
 * @example
 * bpm.accordion({ sections: [{ title: "Livraison", content: "Delai 48h." }] })
 * @props
 * - sections (AccordionSection[], optionnel) — title et content par section. Default: [].
 * - allowMultiple (boolean, optionnel) — Plusieurs sections ouvertes. Default: false.
 * - defaultOpenIds (string[], optionnel) — IDs sections ouvertes au montage. Default: [].
 * - className (string, optionnel) — Classes CSS.
 * @usage FAQ, procedures, aide par theme.
 * @context PARENT: bpm.panel | bpm.tabs. ASSOCIATED: bpm.expander, bpm.markdown. FORBIDDEN: bpm.accordion imbriqué dans bpm.accordion.
 */
export function Accordion({
  sections = [],
  allowMultiple = false,
  defaultOpenIds = [],
  className = "",
}: AccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(defaultOpenIds));

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        if (!allowMultiple) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className={`bpm-accordion border rounded-lg overflow-hidden ${className}`.trim()} style={{ borderColor: "var(--bpm-border)" }}>
      {sections.map((section, i) => {
        const id = section.id ?? `acc-${i}`;
        const isOpen = openIds.has(id);
        return (
          <div key={id} className="bpm-accordion-item border-b last:border-b-0" style={{ borderColor: "var(--bpm-border)" }}>
            <button
              type="button"
              className={`bpm-accordion-header w-full flex items-center gap-2 px-4 py-3 text-left text-sm font-medium border-0 cursor-pointer ${
                isOpen ? "bpm-accordion-open" : ""
              }`}
              style={{
                background: isOpen ? "var(--bpm-bg-secondary)" : "var(--bpm-bg-primary)",
                color: "var(--bpm-text-primary)",
              }}
              onClick={() => toggle(id)}
              aria-expanded={isOpen}
              aria-controls={`${id}-panel`}
              id={`${id}-head`}
            >
              <span className="bpm-accordion-icon w-5 text-center" aria-hidden style={{ color: "var(--bpm-text-secondary)" }}>
                {isOpen ? "−" : "+"}
              </span>
              <span className="bpm-accordion-title">{section.title}</span>
            </button>
            <div
              id={`${id}-panel`}
              role="region"
              aria-labelledby={`${id}-head`}
              className={`bpm-accordion-panel ${isOpen ? "bpm-accordion-panel--open" : ""}`.trim()}
            >
              <div className="bpm-accordion-panel-inner">
                <div className="bpm-accordion-content px-4 py-3 border-t" style={{ borderColor: "var(--bpm-border)", color: "var(--bpm-text-primary)" }}>
                  {section.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
