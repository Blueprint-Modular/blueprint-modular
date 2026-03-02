"use client";

import Link from "next/link";
import { Suspense } from "react";
import { DemoPeriodProvider } from "./DemoPeriodContext";
import { DemoNav } from "./DemoNav";

export function DemoProductionLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--bpm-bg-secondary, #f5f5f5)" }}
    >
      <header
        className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 print:hidden"
        style={{
          background: "var(--bpm-bg-primary)",
          borderColor: "var(--bpm-border)",
        }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-lg font-semibold"
            style={{ color: "var(--bpm-text-primary)" }}
          >
            Blueprint Modular
          </Link>
          <span
            className="rounded px-2 py-1 text-sm"
            style={{
              background: "var(--bpm-bg-secondary)",
              color: "var(--bpm-text-secondary)",
            }}
          >
            Démo Production
          </span>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <Link
            href="/docs"
            className="underline"
            style={{ color: "var(--bpm-accent-cyan)" }}
          >
            Documentation
          </Link>
          <Link
            href="/sandbox"
            className="underline"
            style={{ color: "var(--bpm-accent-cyan)" }}
          >
            App Builder
          </Link>
        </nav>
      </header>

      <div
        className="mx-auto max-w-4xl px-4 py-3 text-center text-sm print:hidden"
        style={{
          background: "rgba(245, 158, 11, 0.12)",
          color: "#8a5a00",
          borderBottom: "1px solid rgba(245, 158, 11, 0.3)",
        }}
      >
        Démo — données fictives. Déployez votre propre instance pour connecter
        vos lignes et indicateurs.
      </div>

      <Suspense fallback={<div className="h-12" />}>
        <DemoPeriodProvider>
          <div className="print:hidden">
            <DemoNav />
          </div>
          <main className="max-w-6xl mx-auto px-4 py-6 print:py-2">{children}</main>
        </DemoPeriodProvider>
      </Suspense>
    </div>
  );
}
