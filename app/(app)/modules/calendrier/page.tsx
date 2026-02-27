"use client";

import { useState } from "react";
import Link from "next/link";
import { Tabs, CodeBlock, Button, Panel } from "@/components/bpm";
import { useIsMobile } from "@/hooks/useIsMobile";

const docContent = (
  <>
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
    <p className="mb-6" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
      Le module <strong>Calendrier</strong> fournit des vues jour, semaine et mois pour afficher des événements et rappels. Optionnellement synchronisable avec un backend ou un calendrier externe.
    </p>
    <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>Intégration</h2>
    <CodeBlock code={'# bpm — afficher un calendrier (exemple)\nbpm.title("Agenda")\n# Les événements sont passés en data (date, titre, durée, couleur)'} language="python" />
  </>
);

function SimuContent() {
  const events = [
    { date: "2025-02-25", titre: "Réunion équipe", heure: "10h" },
    { date: "2025-02-26", titre: "Revue livrables", heure: "14h" },
    { date: "2025-02-27", titre: "Point client", heure: "09h" },
  ];
  return (
    <>
      <p className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>Événements de démo. En production : vues jour / semaine / mois avec sélection de date.</p>
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          border: "1px solid var(--bpm-border)",
          background: "var(--bpm-bg-primary)",
        }}
      >
        <div className="flex gap-1 p-2 border-b" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-sidebar-bg)" }}>
          <Button size="small" variant="secondary">Jour</Button>
          <Button size="small" variant="primary">Semaine</Button>
          <Button size="small" variant="secondary">Mois</Button>
        </div>
        <div className="p-4">
          <ul className="space-y-3 text-sm m-0 list-none p-0">
            {events.map((e, i) => (
              <li key={i} className="flex gap-4 items-baseline" style={{ color: "var(--bpm-text-primary)" }}>
                <span className="shrink-0 text-xs font-medium w-24" style={{ color: "var(--bpm-text-secondary)" }}>{e.date}</span>
                <span className="shrink-0 w-12" style={{ color: "var(--bpm-text-secondary)" }}>{e.heure}</span>
                <span>{e.titre}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

function CalendarMonthView() {
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const firstDay = new Date(viewDate.year, viewDate.month, 1);
  const lastDay = new Date(viewDate.year, viewDate.month + 1, 0);
  const startPad = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const daysInMonth = lastDay.getDate();
  const totalCells = Math.ceil((startPad + daysInMonth) / 7) * 7;
  const monthLabel = new Date(viewDate.year, viewDate.month).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const prevMonth = () => setViewDate((v) => (v.month === 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: v.month - 1 }));
  const nextMonth = () => setViewDate((v) => (v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 }));

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold m-0" style={{ color: "var(--bpm-text-primary)" }}>Vue mensuelle</h2>
          <p className="text-sm m-0 mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
            Agenda du mois. <Link href="/modules/calendrier/simulateur" className="underline" style={{ color: "var(--bpm-accent-cyan)" }}>Ouvrir le simulateur</Link> pour les événements jour / semaine / mois.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="small" variant="outline" onClick={prevMonth} aria-label="Mois précédent">←</Button>
          <span className="capitalize font-medium min-w-[180px] text-center" style={{ color: "var(--bpm-text-primary)" }}>
            {monthLabel}
          </span>
          <Button size="small" variant="outline" onClick={nextMonth} aria-label="Mois suivant">→</Button>
        </div>
      </div>
      <Panel variant="info" title="VUE MENSUELLE">
        <div className="grid grid-cols-7 gap-px rounded-lg overflow-hidden calendar-month-grid" style={{ background: "var(--bpm-border)" }}>
          {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
            <div
              key={day}
              className="p-2 text-center text-xs font-medium"
              style={{ background: "var(--bpm-sidebar-bg)", color: "var(--bpm-text-secondary)" }}
            >
              {day}
            </div>
          ))}
          {Array.from({ length: totalCells }, (_, i) => {
            const dayNum = i - startPad + 1;
            const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth;
            return (
              <div
                key={i}
                className="min-h-[80px] flex flex-col calendar-month-cell"
                style={{
                  background: isCurrentMonth ? "var(--bpm-bg-primary)" : "var(--bpm-sidebar-bg)",
                  color: isCurrentMonth ? "var(--bpm-text-primary)" : "var(--bpm-text-secondary)",
                }}
              >
                <span className="calendar-month-day-num text-xs font-medium">{isCurrentMonth ? dayNum : ""}</span>
                <div className="flex-1 overflow-auto" />
              </div>
            );
          })}
        </div>
      </Panel>
    </>
  );
}

export default function CalendrierModulePage() {
  const isMobile = useIsMobile();

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → Calendrier</div>
        <h1>Calendrier</h1>
        <p className="doc-description">Agenda jour / semaine / mois, événements et rappels. Testez dans le Simulateur.</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">Contenu & productivité</span></div>
        {isMobile ? (
          <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
            <Link href="/modules/calendrier/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Ouvrir le simulateur</Link>
          </p>
        ) : null}
      </div>
      {isMobile ? (
        <Tabs tabs={[{ label: "Documentation", content: docContent }, { label: "Simulateur", content: <SimuContent /> }]} defaultTab={0} />
      ) : (
        <CalendarMonthView />
      )}
    </div>
  );
}
