"use client";

import React from "react";

export interface EmptyProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Empty({ children, className = "", style = {} }: EmptyProps) {
  return (
    <div
      className={"bpm-empty min-h-[1rem] " + className}
      style={{
        width: "100%",
        minWidth: 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
