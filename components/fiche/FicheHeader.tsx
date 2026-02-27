"use client";

import React from "react";
import { Card, Divider, Title } from "@/components/bpm";

export interface FicheHeaderProps {
  breadcrumb: React.ReactNode;
  title: string;
  /** Subtitle line: badges and/or text (e.g. reference, type, status badges). */
  subtitle?: React.ReactNode;
  className?: string;
}

export function FicheHeader({ breadcrumb, title, subtitle, className = "" }: FicheHeaderProps) {
  return (
    <>
      <Card variant="elevated" className={className}>
        <nav className="doc-breadcrumb mb-2" aria-label="Fil d'Ariane">
          {breadcrumb}
        </nav>
        <Title level={1}>{title}</Title>
        {subtitle != null && (
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {subtitle}
          </div>
        )}
      </Card>
      <Divider thickness={1} color="var(--bpm-border)" className="my-4" />
    </>
  );
}
