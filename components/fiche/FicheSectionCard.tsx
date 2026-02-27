"use client";

import React from "react";
import { Card, Title } from "@/components/bpm";

export interface FicheSectionCardProps {
  title: string;
  /** Section title is rendered as Title level 3 with bar and accent color. */
  children: React.ReactNode;
  variant?: "elevated" | "outlined" | "default";
  className?: string;
  role?: string;
  "aria-label"?: string;
}

export function FicheSectionCard({
  title,
  children,
  variant = "elevated",
  className = "",
  role = "region",
  "aria-label": ariaLabel,
}: FicheSectionCardProps) {
  return (
    <Card
      variant={variant}
      className={className}
      {...(ariaLabel ? { "aria-label": ariaLabel } : {})}
    >
      <Title level={3} bar barColor="var(--bpm-accent)">
        {title}
      </Title>
      <div className="mt-3" role={role}>
        {children}
      </div>
    </Card>
  );
}
