"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export type SelectboxOption = string | { value: string; label: string };

export interface SelectboxProps {
  /** PARENT: bpm.panel | bpm.modal (formulaire) | bpm.card. INTERDIT: options=[] sans placeholder — UI bloquée. ASSOCIÉ: bpm.input (filtres combinés), bpm.table (filtre colonne), bpm.button. */
  /** Label affiché au-dessus. */
  label?: string;
  /** Liste d'options. Format : string[] ou [{value, label}]. */
  options?: SelectboxOption[];
  /** Valeur sélectionnée (contrôlé). */
  value?: string | null;
  /** Callback — reçoit la valeur string sélectionnée. */
  onChange?: (value: string) => void;
  disabled?: boolean;
  help?: string | null;
  placeholder?: string;
  required?: boolean;
  /** Hauteur du trigger (px) pour alignement avec d'autres champs (ex. FilterPanel). */
  triggerHeight?: number;
}

function getOptionValue(opt: SelectboxOption): string {
  return typeof opt === "string" ? opt : opt.value;
}
function getOptionLabel(opt: SelectboxOption): string {
  return typeof opt === "string" ? opt : opt.label;
}

export function Selectbox({
  label,
  options = [],
  value,
  onChange,
  disabled = false,
  help = null,
  placeholder = "Sélectionner...",
  required = false,
  triggerHeight,
}: SelectboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const selectboxRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current?.contains(e.target as Node) ||
        selectboxRef.current?.contains(e.target as Node)
      )
        return;
      setIsOpen(false);
    };
    const t = setTimeout(() => document.addEventListener("click", handleClickOutside, true), 100);
    return () => {
      clearTimeout(t);
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setDropdownStyle({});
      return;
    }
    const update = () => {
      if (!selectboxRef.current) return;
      const rect = selectboxRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        maxHeight: 280,
        zIndex: 10002,
        overflow: "auto",
      });
    };
    const t = setTimeout(update, 10);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [isOpen, options.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }
  }, [isOpen]);

  const selectedOption = options.find((o) => getOptionValue(o) === value);
  const displayValue = selectedOption
    ? getOptionLabel(selectedOption)
    : placeholder && !required
      ? placeholder
      : "";

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsOpen((prev) => !prev);
  };

  const handleSelect = (optionValue: string) => {
    if (disabled) return;
    onChange?.(optionValue);
    setIsOpen(false);
  };

  const dropdownContent = isOpen && !disabled && (
    <div
      ref={dropdownRef as React.RefObject<HTMLDivElement>}
      className="bpm-selectbox-dropdown overflow-auto"
      style={{
        ...dropdownStyle,
        background: "var(--bpm-surface)",
        border: "1px solid var(--bpm-border)",
        borderRadius: "var(--bpm-radius)",
        boxShadow: "var(--bpm-shadow)",
        padding: "4px 0",
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {options.length > 0 ? (
        options.map((opt, idx) => {
          const optValue = getOptionValue(opt);
          const optLabel = getOptionLabel(opt);
          const isSelected = optValue === value;
          return (
            <div
              key={idx}
              role="option"
              aria-selected={isSelected}
              className="bpm-selectbox-option cursor-pointer"
              style={{
                padding: "8px 12px",
                fontSize: "var(--bpm-font-size-base)",
                background: isSelected ? "var(--bpm-accent)" : "transparent",
                color: isSelected ? "var(--bpm-accent-contrast)" : "var(--bpm-text)",
                transition: "var(--bpm-transition)",
              }}
              onClick={() => handleSelect(optValue)}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.background = "var(--bpm-bg-secondary)";
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.background = "transparent";
              }}
            >
              {optLabel}
            </div>
          );
        })
      ) : (
        <div style={{ padding: "8px 12px", fontSize: "var(--bpm-font-size-base)", color: "var(--bpm-text-muted)" }}>
          Aucune option disponible
        </div>
      )}
    </div>
  );

  return (
    <div className="bpm-selectbox-container" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
          {label}
          {help && <span className="ml-1 opacity-70" title={help}>ⓘ</span>}
        </label>
      )}
      <div className="bpm-selectbox-wrapper relative">
        <div
          ref={selectboxRef}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className={`bpm-selectbox flex items-center justify-between gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm ${
            disabled ? "opacity-60 cursor-not-allowed" : ""
          } ${isOpen ? "ring-2 ring-offset-1" : ""}`}
          style={{
            borderColor: "var(--bpm-border)",
            background: "var(--bpm-bg-primary)",
            color: displayValue && displayValue !== placeholder ? "var(--bpm-text-primary)" : "var(--bpm-text-secondary)",
            minHeight: triggerHeight ?? 40,
            height: triggerHeight ?? 40,
            boxSizing: "border-box",
          }}
          onClick={handleToggle}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleToggle(e as unknown as React.MouseEvent);
            }
          }}
        >
          <span className="truncate">{displayValue}</span>
        </div>
        {typeof document !== "undefined" && dropdownContent && createPortal(dropdownContent, document.body)}
      </div>
    </div>
  );
}
