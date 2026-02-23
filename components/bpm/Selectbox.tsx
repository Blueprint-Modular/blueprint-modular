"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export type SelectboxOption = string | { value: string; label: string };

export interface SelectboxProps {
  label?: string;
  options?: SelectboxOption[];
  value?: string | null;
  onChange?: (value: string) => void;
  disabled?: boolean;
  help?: string | null;
  placeholder?: string;
  required?: boolean;
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
      className="bpm-selectbox-dropdown rounded-lg border shadow-lg py-1 overflow-auto"
      style={{
        ...dropdownStyle,
        background: "var(--bpm-surface)",
        borderColor: "var(--bpm-border)",
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
              className="bpm-selectbox-option px-3 py-2 cursor-pointer text-sm"
              style={{
                background: isSelected ? "var(--bpm-bg-secondary)" : "transparent",
                color: "var(--bpm-text-primary)",
              }}
              onClick={() => handleSelect(optValue)}
            >
              {optLabel}
            </div>
          );
        })
      ) : (
        <div className="px-3 py-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
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
