"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Panel, Spinner, Button } from "@/components/bpm";

type ChangeRequest = {
  id: string;
  reference: string;
  title: string;
  status: string;
  type: string;
  riskLevel: string;
  plannedStart: string | null;
  plannedEnd: string | null;
};

export default function AssetManagerChangesCalendarPage() {
  const params = useParams();
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const [changes, setChanges] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  useEffect(() => {
    if (!domainId) return;
    setLoading(true);
    fetch(`/api/asset-manager/changes?domainId=${encodeURIComponent(domainId)}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setChanges(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [domainId]);

  const firstDay = new Date(viewDate.year, viewDate.month, 1);
  const lastDay = new Date(viewDate.year, viewDate.month + 1, 0);
  const startPad = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const daysInMonth = lastDay.getDate();
  const totalCells = Math.ceil((startPad + daysInMonth) / 7) * 7;

  const changesByDay: Record<string, ChangeRequest[]> = {};
  changes.forEach((c) => {
    if (!c.plannedStart) return;
    const d = new Date(c.plannedStart);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!changesByDay[key]) changesByDay[key] = [];
    changesByDay[key].push(c);
  });

  const prevMonth = () => {
    setViewDate((v) => (v.month === 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: v.month - 1 }));
  };
  const nextMonth = () => {
    setViewDate((v) => (v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 }));
  };
  const monthLabel = new Date(viewDate.year, viewDate.month).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  if (!domainId) {
    return (
      <div className="doc-page">
        <Panel variant="warning" title="Domaine requis" />
      </div>
    );
  }

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <nav className="doc-breadcrumb">
          <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>Modules</Link> →{" "}
          <Link href="/modules/asset-manager" style={{ color: "var(--bpm-accent-cyan)" }}>Gestion d&apos;actifs</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>Tableau de bord</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}/changes`} style={{ color: "var(--bpm-accent-cyan)" }}>Changements</Link> → Calendrier
        </nav>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
            Calendrier des changements
          </h1>
          <div className="flex items-center gap-2">
            <Button size="small" variant="outline" onClick={prevMonth}>
              ←
            </Button>
            <span className="capitalize font-medium min-w-[180px] text-center" style={{ color: "var(--bpm-text-primary)" }}>
              {monthLabel}
            </span>
            <Button size="small" variant="outline" onClick={nextMonth}>
              →
            </Button>
          </div>
        </div>
        <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
          Changements avec date de début prévue.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="medium" />
        </div>
      ) : (
        <Panel variant="info" title="Vue mensuelle">
          <div className="grid grid-cols-7 gap-px rounded-lg overflow-hidden" style={{ background: "var(--bpm-border)" }}>
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
              <div
                key={day}
                className="p-2 text-center text-xs font-medium"
                style={{ background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-secondary)" }}
              >
                {day}
              </div>
            ))}
            {Array.from({ length: totalCells }, (_, i) => {
              const dayNum = i - startPad + 1;
              const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth;
              const key = isCurrentMonth
                ? `${viewDate.year}-${String(viewDate.month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`
                : "";
              const dayChanges = key ? changesByDay[key] ?? [] : [];
              return (
                <div
                  key={i}
                  className="min-h-[80px] p-1 flex flex-col"
                  style={{
                    background: isCurrentMonth ? "var(--bpm-bg)" : "var(--bpm-bg-secondary)",
                    color: isCurrentMonth ? "var(--bpm-text-primary)" : "var(--bpm-text-secondary)",
                  }}
                >
                  <span className="text-xs font-medium mb-1">{isCurrentMonth ? dayNum : ""}</span>
                  <div className="flex-1 space-y-0.5 overflow-auto">
                    {dayChanges.slice(0, 3).map((c) => (
                      <Link
                        key={c.id}
                        href={`/modules/asset-manager/${domainId}/changes/${c.id}`}
                        className="block text-xs truncate rounded px-1 py-0.5 hover:underline"
                        style={{ background: "var(--bpm-accent-cyan)", color: "#fff" }}
                        title={`${c.reference} — ${c.title}`}
                      >
                        {c.reference}
                      </Link>
                    ))}
                    {dayChanges.length > 3 && (
                      <span className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>+{dayChanges.length - 3}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href={`/modules/asset-manager/${domainId}/changes`} style={{ color: "var(--bpm-accent-cyan)" }}>
          ← Liste des changements
        </Link>
        <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>
          Tableau de bord
        </Link>
      </nav>
    </div>
  );
}
