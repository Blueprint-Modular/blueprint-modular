"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDemoPeriod } from "./DemoPeriodContext";
import type { DemoPeriod } from "./DemoPeriodContext";

const TABS: { label: string; href: string }[] = [
  { label: "Vue globale", href: "/demo/production" },
  { label: "Lignes", href: "/demo/production/lines" },
  { label: "Alertes", href: "/demo/production/alerts" },
  { label: "Saisir une session", href: "/demo/production/sessions/new" },
];

const PERIOD_LABELS: Record<DemoPeriod, string> = {
  "7d": "7j",
  "30d": "30j",
  "90d": "90j",
};

export function DemoNav() {
  const pathname = usePathname();
  const { period, setPeriod } = useDemoPeriod();

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3"
      style={{
        background: "var(--bpm-bg-primary)",
        borderColor: "var(--bpm-border)",
      }}
    >
      <div className="flex flex-wrap items-center gap-1 sm:gap-2">
        {TABS.map((tab) => {
          const base = pathname.replace(/\?.*$/, "").replace(/\/$/, "") || "/";
          const isActive =
            tab.href === "/demo/production"
              ? base === "/demo/production"
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="rounded px-3 py-2 text-sm font-medium transition"
              style={{
                background: isActive ? "var(--bpm-accent-cyan)" : "transparent",
                color: isActive ? "#fff" : "var(--bpm-text-primary)",
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
      <div className="flex items-center gap-1">
        {(["7d", "30d", "90d"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className="rounded px-2 py-1.5 text-xs font-medium transition"
            style={{
              background: period === p ? "var(--bpm-accent-cyan)" : "var(--bpm-bg-secondary)",
              color: period === p ? "#fff" : "var(--bpm-text-primary)",
            }}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>
    </nav>
  );
}
