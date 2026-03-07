"use client";
import React from "react";

export interface MetricRowProps {
  children: React.ReactNode;
  className?: string;
}

export function MetricRow({ children, className = "" }: MetricRowProps) {
  return (
    <div
      className={"bpm-metric-row " + className}
      style={{
        display: "flex",
        gap: 16,
        overflowX: "auto",
        paddingBottom: 4,
        scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <style>{`.bpm-metric-row::-webkit-scrollbar { display: none; }`}</style>
      {React.Children.map(children, (child) => (
        <div style={{ minWidth: 180, flex: "0 0 auto" }}>
          {child}
        </div>
      ))}
    </div>
  );
}
