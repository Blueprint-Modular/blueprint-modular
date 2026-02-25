"use client";

import React from "react";

export interface FABProps {
  icon?: React.ReactNode;
  label?: string;
  onClick?: () => void;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  className?: string;
}

const positionClasses: Record<NonNullable<FABProps["position"]>, string> = {
  "bottom-right": "right-6 bottom-6 max-md:bottom-[calc(5rem+1rem)]",
  "bottom-left": "left-6 bottom-6 max-md:bottom-[calc(5rem+1rem)]",
  "top-right": "right-6 top-6",
  "top-left": "left-6 top-6",
};

export function FAB({ icon, label, onClick, position = "bottom-right", className = "" }: FABProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={"bpm-fab fixed z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg border-0 cursor-pointer " + positionClasses[position] + " " + className}
      style={{ background: "var(--bpm-accent-cyan)", color: "#fff" }}
      title={label}
      aria-label={label ?? "Action"}
    >
      {icon ?? <span className="text-2xl leading-none">+</span>}
    </button>
  );
}
