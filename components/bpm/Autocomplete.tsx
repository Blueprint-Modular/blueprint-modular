"use client";

import React, { useState, useRef, useEffect } from "react";

export interface AutocompleteOption {
  value: string;
  label: string;
}

export interface AutocompleteProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: AutocompleteOption[];
  className?: string;
}

export function Autocomplete(props: AutocompleteProps) {
  const { label, placeholder = "", value = "", onChange, options, className = "" } = props;
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const q = value.trim().toLowerCase();
  const filtered = q
    ? options.filter((o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)).slice(0, 20)
    : options.slice(0, 20);

  useEffect(() => { setHighlight(0); }, [value, open]);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const select = (opt: AutocompleteOption) => {
    if (onChange) onChange(opt.value);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className={"bpm-autocomplete relative " + className}>
      {label ? <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>{label}</label> : null}
      <input
        type="text"
        value={value}
        onChange={(e) => { if (onChange) onChange(e.target.value); setOpen(true); }}
        onFocus={(e) => {
          e.target.style.outline = "none";
          e.target.style.borderColor = "var(--bpm-accent)";
          e.target.style.boxShadow = "var(--bpm-focus-ring)";
          setOpen(true);
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "var(--bpm-border)";
          e.target.style.boxShadow = "none";
        }}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border text-sm min-h-[40px]"
        style={{ background: "var(--bpm-bg-primary)", borderColor: "var(--bpm-border)", color: "var(--bpm-text-primary)", minHeight: 40, boxSizing: "border-box" }}
      />
      {open && filtered.length > 0 ? (
        <ul className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border shadow-lg list-none m-0 p-1" style={{ background: "var(--bpm-bg-primary)", borderColor: "var(--bpm-border)" }}>
          {filtered.map((opt, i) => (
            <li
              key={opt.value}
              className="px-3 py-2 rounded cursor-pointer text-sm"
              style={{ background: i === highlight ? "var(--bpm-accent)" : "transparent", color: i === highlight ? "var(--bpm-accent-contrast)" : "var(--bpm-text)" }}
              onMouseDown={() => select(opt)}
              onMouseEnter={() => setHighlight(i)}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
