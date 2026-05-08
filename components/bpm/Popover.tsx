"use client";

import React, { useState, useRef, useEffect } from "react";

/**
 * @component bpm.popover
 * @description Bulle contextuelle positionnée autour d'un déclencheur avec fermeture au clic extérieur.
 * @example
 * bpm.popover({ trigger: <button>Info</button>, children: <p>Contenu</p>, placement: "bottom" })
 *
 * @param {object} props
 * @param {React.ReactNode} props.trigger - Élément déclencheur. Obligatoire.
 * @param {React.ReactNode} props.children - Contenu de la bulle. Obligatoire.
 * @param {"top"|"bottom"|"left"|"right"} [props.placement="bottom"] - Position de la bulle. Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 *
 * @associated bpm.tooltip, bpm.dropdown
 */
export interface PopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function Popover(p: PopoverProps) {
  const { trigger, children, placement = "bottom", className = "" } = p;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);
  const pos = placement === "top" ? "bottom-full left-0 mb-1" : placement === "left" ? "right-full top-0 mr-1" : placement === "right" ? "left-full top-0 ml-1" : "top-full left-0 mt-1";
  return (
    <div className={"bpm-popover relative inline-block " + className} ref={ref}>
      <div onClick={() => setOpen((o) => !o)} className="cursor-pointer">{trigger}</div>
      {open && (
        <div
          className={"absolute z-50 border p-2 min-w-[120px] " + pos}
          style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)", color: "var(--bpm-text)", borderRadius: "var(--bpm-radius)", boxShadow: "var(--bpm-shadow)" }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
