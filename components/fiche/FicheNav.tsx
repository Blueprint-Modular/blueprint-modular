"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/bpm";

export interface FicheNavLink {
  href: string;
  label: string;
  variant?: "outline" | "secondary";
}

export interface FicheNavProps {
  /** First link (e.g. "← Liste des actifs") - rendered as outline. */
  backLink: string;
  backLabel: string;
  /** Additional links (e.g. Tableau de bord, Documentation) - rendered as secondary. */
  secondaryLinks?: FicheNavLink[];
  className?: string;
}

export function FicheNav({ backLink, backLabel, secondaryLinks = [], className = "" }: FicheNavProps) {
  return (
    <nav className={`doc-pagination mt-8 flex flex-wrap gap-3 ${className}`.trim()} aria-label="Navigation de fin de page">
      <Link href={backLink}>
        <Button variant="outline" size="medium">
          {backLabel}
        </Button>
      </Link>
      {secondaryLinks.map((link) => (
        <Link key={link.href} href={link.href}>
          <Button variant={link.variant ?? "secondary"} size="medium">
            {link.label}
          </Button>
        </Link>
      ))}
    </nav>
  );
}
