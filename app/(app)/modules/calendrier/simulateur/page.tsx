"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Button, Modal, Input, Textarea, Chip, Selectbox } from "@/components/bpm";

type View = "jour" | "semaine" | "mois";

export type CalEvent = {
  id: string;
  date: string;
  titre: string;
  heure: string;
  duree?: number;
  couleur?: string;
  description?: string;
  lieu?: string;
  categorie?: string;
  statut?: "confirmé" | "annulé" | "tentative";
  participants?: string[];
  /** Récurrence (affichage détail) */
  recurrence?: "daily" | "weekly" | "monthly";
  /** true si créé par l'utilisateur dans le simulateur (supprimable) */
  _user?: boolean;
};

const COULEURS = [
  { id: "cyan", label: "Cyan", value: "var(--bpm-accent-cyan)" },
  { id: "orange", label: "Orange", value: "#e67e22" },
  { id: "vert", label: "Vert", value: "#27ae60" },
  { id: "violet", label: "Violet", value: "#9b59b6" },
  { id: "rouge", label: "Rouge", value: "#e74c3c" },
];

/** Parse "09h" ou "09h30" en minutes depuis minuit */
function hourStringToMinutes(h: string): number {
  const m = h.match(/(\d{1,2})h(\d{0,2})/);
  if (!m) return 0;
  return parseInt(m[1], 10) * 60 + (parseInt(m[2] || "0", 10) || 0);
}

/** Affiche l'heure de façon uniforme (09h00, 10h30) quel que soit le format stocké (9h, 10h, 09h00). */
function formatHeureDisplay(heure: string): string {
  const m = heure.match(/(\d{1,2})h(\d{0,2})/);
  if (!m) return heure;
  const h = m[1].padStart(2, "0");
  const min = (m[2] || "0").padStart(2, "0");
  return `${h}h${min}`;
}

/** Génère des événements de démo enrichis (P1, P14). */
function buildDemoEvents(anchorMonth: Date): CalEvent[] {
  const y = anchorMonth.getFullYear();
  const m = anchorMonth.getMonth();
  const last = new Date(y, m + 1, 0);
  const events: CalEvent[] = [];
  const titles = [
    "Réunion équipe",
    "Revue livrables",
    "Point client",
    "Rétro sprint",
    "Formation",
    "Stand-up",
    "Prépa démo",
    "Audit technique",
    "Planification",
    "Validation budget",
  ];
  const lieux = ["Salle A", "Visio", "Open space", "Salle de conférence", ""];
  const categories = ["Réunion", "Formation", "Client", "Interne", "Planification"];
  let id = 0;
  for (let d = 1; d <= last.getDate(); d++) {
    const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dayOfWeek = new Date(y, m, d).getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      const color = COULEURS[d % COULEURS.length];
      events.push({
        id: `demo-${++id}`,
        date: dateStr,
        titre: titles[d % titles.length],
        heure: "09h",
        duree: 60,
        couleur: color.value,
        categorie: categories[d % categories.length],
        statut: "confirmé",
        lieu: lieux[d % lieux.length] || undefined,
        description: d % 4 === 0 ? "Points à l'ordre du jour : suivi des actions, prochaines étapes." : undefined,
        participants: d % 3 === 0 ? ["Alice", "Bob", "Charlie"] : undefined,
      });
      if (d % 3 === 0) {
        const c2 = COULEURS[(d + 1) % COULEURS.length];
        events.push({
          id: `demo-${++id}`,
          date: dateStr,
          titre: titles[(d + 2) % titles.length],
          heure: "14h",
          duree: 30,
          couleur: c2.value,
          categorie: "Client",
          statut: "tentative",
          lieu: "Visio",
          _user: false,
        });
      }
      if (d % 5 === 0) {
        events.push({
          id: `demo-${++id}`,
          date: dateStr,
          titre: "Réunion courte",
          heure: "16h",
          couleur: COULEURS[(d + 2) % COULEURS.length].value,
          categorie: "Interne",
          _user: false,
        });
      }
    }
  }
  const prevMonth = new Date(y, m - 1, 1);
  const prevLast = new Date(y, m - 1, 0);
  for (let d = Math.max(1, prevLast.getDate() - 6); d <= prevLast.getDate(); d++) {
    const dateStr = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const c = COULEURS[d % COULEURS.length];
    events.push({
      id: `demo-${++id}`,
      date: dateStr,
      titre: titles[d % titles.length],
      heure: "10h",
      duree: 45,
      couleur: c.value,
      categorie: categories[d % categories.length],
      _user: false,
    });
  }
  const nextMonth = new Date(y, m + 1, 1);
  for (let d = 1; d <= 7; d++) {
    const dateStr = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const c = COULEURS[d % COULEURS.length];
    events.push({
      id: `demo-${++id}`,
      date: dateStr,
      titre: titles[d % titles.length],
      heure: "09h",
      duree: 60,
      couleur: c.value,
      categorie: categories[d % categories.length],
      _user: false,
    });
  }
  return events;
}

function formatDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getWeekRange(d: Date): { start: Date; end: Date } {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const start = new Date(d);
  start.setDate(d.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

const MONTHS = "janvier,février,mars,avril,mai,juin,juillet,août,septembre,octobre,novembre,décembre".split(",");
const WEEKDAYS_SHORT = "dim.,lun.,mar.,mer.,jeu.,ven.,sam.".split(",");
const WEEKDAYS_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const WEEKDAYS_FULL = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

/** Numéro de semaine ISO (1–53) */
function getISOWeekNumber(d: Date): number {
  const { start } = getWeekRange(d);
  const jan4 = new Date(start.getFullYear(), 0, 4);
  const jan4Start = getWeekRange(jan4).start;
  const diffDays = (start.getTime() - jan4Start.getTime()) / (24 * 3600 * 1000);
  return Math.floor(diffDays / 7) + 1;
}

function formatTitle(view: View, focusDate: Date): string {
  if (view === "jour") {
    const weekday = WEEKDAYS_SHORT[focusDate.getDay()];
    return `${weekday} ${focusDate.getDate()} ${MONTHS[focusDate.getMonth()]} ${focusDate.getFullYear()}`;
  }
  if (view === "semaine") {
    const { start, end } = getWeekRange(focusDate);
    const weekNum = getISOWeekNumber(focusDate);
    const fmt = (x: Date) => `${x.getDate()} ${MONTHS[x.getMonth()].slice(0, 3)}. ${x.getFullYear()}`;
    return `Semaine ${weekNum} - du ${fmt(start)} au ${fmt(end)}`;
  }
  return `${MONTHS[focusDate.getMonth()]} ${focusDate.getFullYear()}`;
}

function addDays(d: Date, delta: number): Date {
  const out = new Date(d);
  out.setDate(d.getDate() + delta);
  return out;
}

function addMonths(d: Date, delta: number): Date {
  const out = new Date(d);
  out.setMonth(d.getMonth() + delta);
  return out;
}

/** Calcule les "lanes" pour événements qui se chevauchent (P12) */
function computeLanes<T extends { heure: string; duree?: number }>(events: T[]): Map<T, number> {
  const lanes = new Map<T, number>();
  const sorted = [...events].sort((a, b) => hourStringToMinutes(a.heure) - hourStringToMinutes(b.heure));
  for (const ev of sorted) {
    const start = hourStringToMinutes(ev.heure);
    const end = start + (ev.duree ?? 60);
    let lane = 0;
    while (true) {
      let ok = true;
      for (const [other, l] of Array.from(lanes)) {
        if (l !== lane) continue;
        const oStart = hourStringToMinutes(other.heure);
        const oEnd = oStart + (other.duree ?? 60);
        if (start < oEnd && end > oStart) {
          ok = false;
          break;
        }
      }
      if (ok) break;
      lane++;
    }
    lanes.set(ev, lane);
  }
  return lanes;
}

const DAY_START_MIN = 8 * 60;
const DAY_END_MIN = 20 * 60;
const TOTAL_MIN = DAY_END_MIN - DAY_START_MIN;

export default function CalendrierSimulateurPage() {
  const today = useMemo(() => new Date(), []);
  const todayKey = formatDateKey(today);

  const [view, setView] = useState<View>("semaine");
  const [focusDate, setFocusDate] = useState<Date>(() => new Date(today.getFullYear(), today.getMonth(), today.getDate()));
  const [userEvents, setUserEvents] = useState<CalEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalEvent | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [filterCouleur, setFilterCouleur] = useState<string | null>(null);

  const demoEvents = useMemo(() => buildDemoEvents(focusDate), [focusDate]);
  const allEvents = useMemo(() => [...demoEvents, ...userEvents], [demoEvents, userEvents]);
  const filteredEvents = useMemo(() => {
    if (!filterCouleur) return allEvents;
    return allEvents.filter((e) => e.couleur === filterCouleur);
  }, [allEvents, filterCouleur]);

  const eventsForDay = useCallback((dateKey: string) => filteredEvents.filter((e) => e.date === dateKey), [filteredEvents]);
  const focusKey = formatDateKey(focusDate);
  const weekEvents = useMemo(() => {
    const { start, end } = getWeekRange(focusDate);
    return filteredEvents.filter((e) => e.date >= formatDateKey(start) && e.date <= formatDateKey(end));
  }, [focusDate, filteredEvents]);

  const uniqueCouleurs = useMemo(() => {
    const set = new Set(allEvents.map((e) => e.couleur).filter(Boolean));
    return Array.from(set) as string[];
  }, [allEvents]);

  const goPrev = () => {
    if (view === "jour") setFocusDate((d) => addDays(d, -1));
    else if (view === "semaine") setFocusDate((d) => addDays(d, -7));
    else setFocusDate((d) => addMonths(d, -1));
  };
  const goNext = () => {
    if (view === "jour") setFocusDate((d) => addDays(d, 1));
    else if (view === "semaine") setFocusDate((d) => addDays(d, 7));
    else setFocusDate((d) => addMonths(d, 1));
  };
  const goToday = () => setFocusDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()));

  const handleDeleteEvent = (ev: CalEvent) => {
    if (ev._user) setUserEvents((prev) => prev.filter((e) => e.id !== ev.id));
    setSelectedEvent(null);
  };

  const handleAddEvent = (ev: Omit<CalEvent, "id" | "_user"> | Omit<CalEvent, "id" | "_user">[]) => {
    const list = Array.isArray(ev) ? ev : [ev];
    const baseId = `user-${Date.now()}`;
    setUserEvents((prev) => [...prev, ...list.map((e, i) => ({ ...e, id: `${baseId}-${i}`, _user: true }))]);
    setFormOpen(false);
  };

  const year = focusDate.getFullYear();
  const month = focusDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const daysInMonth = lastDay.getDate();

  const dayEvents = eventsForDay(focusKey);
  const dayLanes = useMemo(() => computeLanes(dayEvents), [dayEvents]);
  const maxLaneDay = dayEvents.length ? Math.max(...Array.from(dayLanes.values())) + 1 : 1;

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → Calendrier
        </div>
        <h1>Simulateur — Calendrier</h1>
        <p className="doc-description">
          Vues Jour (timeline), Semaine (grille), Mois. Navigation, filtres, détail et création d&apos;événements.
        </p>
      </div>

      <div
        className="rounded-2xl overflow-hidden min-w-0"
        style={{ border: "1px solid var(--bpm-border)", background: "var(--bpm-bg-primary)" }}
      >
        {/* Navigation temporelle + Nouvel événement */}
        <div
          className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b"
          style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-sidebar-bg)" }}
        >
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button size="small" variant="secondary" onClick={goPrev} aria-label="Période précédente">←</Button>
            <Button size="small" variant="secondary" onClick={goNext} aria-label="Période suivante">→</Button>
            <Button size="small" variant="secondary" onClick={goToday}>Aujourd&apos;hui</Button>
            <Button size="small" variant="primary" onClick={() => setFormOpen(true)} className="ml-2">
              + Nouvel événement
            </Button>
          </div>
          <p className="text-sm font-medium m-0 flex-1 min-w-0 truncate text-center px-2" style={{ color: "var(--bpm-text-primary)" }} title={formatTitle(view, focusDate)}>
            {view === "semaine" || view === "jour" || view === "mois" ? null : formatTitle(view, focusDate)}
          </p>
          <div className="w-4 flex-shrink-0 sm:w-10" />
        </div>

        {/* Filtres par couleur (P13) */}
        <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-sidebar-bg)" }}>
          <span className="text-xs font-medium" style={{ color: "var(--bpm-text-secondary)" }}>Filtrer :</span>
          <Chip
            label="Tous"
            variant={filterCouleur === null ? "primary" : "default"}
            onClick={() => setFilterCouleur(null)}
          />
          {uniqueCouleurs.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilterCouleur(c)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs border transition-colors"
              style={{
                borderColor: filterCouleur === c ? c : "var(--bpm-border)",
                background: filterCouleur === c ? (c.startsWith("var") ? "var(--bpm-accent-cyan)" : c) : "var(--bpm-bg-primary)",
                color: filterCouleur === c ? "#fff" : "var(--bpm-text-primary)",
              }}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: filterCouleur === c ? "#fff" : c }} />
              {COULEURS.find((x) => x.value === c)?.label ?? "Couleur"}
            </button>
          ))}
        </div>

        {/* Onglets vues */}
        <div className="flex gap-1 p-2 border-b" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-sidebar-bg)" }}>
          <Button size="small" variant={view === "jour" ? "primary" : "secondary"} onClick={() => setView("jour")}>Jour</Button>
          <Button size="small" variant={view === "semaine" ? "primary" : "secondary"} onClick={() => setView("semaine")}>Semaine</Button>
          <Button size="small" variant={view === "mois" ? "primary" : "secondary"} onClick={() => setView("mois")}>Mois</Button>
        </div>

        <div className="p-4 min-h-[320px] min-w-0 overflow-hidden">
          {/* Vue Jour — Timeline verticale (P5) + événements simultanés (P12) */}
          {view === "jour" && (
            <div className="text-sm">
              <p
                className="text-xs font-medium mb-2 px-3 py-2 rounded-lg"
                style={
                  focusKey === todayKey
                    ? { background: "var(--bpm-accent)", color: "#fff" }
                    : { color: "var(--bpm-text-secondary)" }
                }
              >
                {formatTitle("jour", focusDate)}
                {focusKey === todayKey && (
                  <span className="ml-2 opacity-90">Aujourd&apos;hui</span>
                )}
              </p>
              <div className="flex gap-0 min-w-0">
              <div className="cal-time-col shrink-0 w-14 flex flex-col" style={{ color: "var(--bpm-text-secondary)", minWidth: 56 }}>
                {Array.from({ length: (DAY_END_MIN - DAY_START_MIN) / 30 }, (_, i) => (
                  <div key={i} className="h-8 text-xs flex items-center" style={{ minHeight: 32 }}>
                    {(DAY_START_MIN / 60 + i / 2) | 0}h{i % 2 === 1 ? "30" : "00"}
                  </div>
                ))}
              </div>
              <div className="flex-1 min-w-0 relative" style={{ minHeight: (TOTAL_MIN / 30) * 32 }}>
                {dayEvents.length === 0 && (
                  <p className="absolute top-4 left-0 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Aucun événement ce jour.</p>
                )}
                {dayEvents.map((ev, i) => {
                  const startMin = hourStringToMinutes(ev.heure);
                  const dur = ev.duree ?? 60;
                  const top = ((startMin - DAY_START_MIN) / TOTAL_MIN) * 100;
                  const height = (dur / TOTAL_MIN) * 100;
                  const lane = dayLanes.get(ev) ?? 0;
                  const widthPercent = 100 / maxLaneDay;
                  const left = lane * widthPercent;
                  return (
                    <button
                      key={ev.id}
                      type="button"
                      className="absolute left-0 right-0 rounded border text-left px-2 py-1 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                      style={{
                        top: `${top}%`,
                        height: `${height}%`,
                        left: `${left}%`,
                        width: `${widthPercent}%`,
                        marginLeft: lane === 0 ? 0 : "2px",
                        borderColor: ev.couleur ?? "var(--bpm-border)",
                        background: (ev.couleur ?? "var(--bpm-accent-cyan)") + "22",
                        color: "var(--bpm-text-primary)",
                        fontSize: 12,
                      }}
                      onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev); }}
                    >
                      <span className="block w-1 h-full rounded absolute left-0 top-0" style={{ background: ev.couleur ?? "var(--bpm-accent-cyan)" }} />
                      <span className="font-medium truncate block">{ev.titre}</span>
                      <span className="text-xs opacity-80">{formatHeureDisplay(ev.heure)}{ev.duree ? ` — ${ev.duree} min` : ""}</span>
                    </button>
                  );
                })}
              </div>
              </div>
            </div>
          )}

          {/* Vue Semaine — Grille temporelle (P4) : colonnes = jours, lignes = créneaux 30 min */}
          {view === "semaine" && (
            <div className="overflow-x-auto min-w-0 -mx-1 px-1" style={{ WebkitOverflowScrolling: "touch" }}>
              <div
                className="grid text-sm w-full"
                style={{
                  gridTemplateColumns: "56px repeat(7, minmax(0, 1fr))",
                  gridTemplateRows: `auto repeat(${(DAY_END_MIN - DAY_START_MIN) / 30}, 32px)`,
                  minWidth: 0,
                }}
              >
                {/* Coin haut gauche : S9 centré */}
                <div
                  className="py-1 pr-1 text-xs font-medium border-b border-r flex items-center justify-center"
                  style={{ gridColumn: 1, gridRow: 1, borderColor: "var(--bpm-border)", color: "var(--bpm-text-secondary)", background: "var(--bpm-sidebar-bg)" }}
                  title={formatTitle("semaine", focusDate)}
                >
                  S{getISOWeekNumber(focusDate)}
                </div>
                {[0, 1, 2, 3, 4, 5, 6].map((dayOffset) => {
                  const { start } = getWeekRange(focusDate);
                  const d = new Date(start);
                  d.setDate(start.getDate() + dayOffset);
                  const dateKey = formatDateKey(d);
                  const isToday = dateKey === todayKey;
                  return (
                    <div
                      key={dayOffset}
                      className={`py-1 text-center font-medium border-b truncate text-xs sm:text-sm ${isToday ? "rounded-t" : ""}`}
                      style={{
                        gridColumn: dayOffset + 2,
                        borderColor: "var(--bpm-border)",
                        ...(isToday ? { background: "var(--bpm-accent)", color: "#fff" } : { color: "var(--bpm-text-secondary)" }),
                      }}
                      title={`${WEEKDAYS_FULL[dayOffset]} ${d.getDate()}`}
                    >
                      <span className="hidden sm:inline">{WEEKDAYS_FULL[dayOffset]} </span>{d.getDate()}
                    </div>
                  );
                })}
                {Array.from({ length: (DAY_END_MIN - DAY_START_MIN) / 30 }, (_, rowIdx) => (
                  <React.Fragment key={rowIdx}>
                    <div className="cal-time-col text-xs flex items-center justify-end pr-2 border-b min-h-[32px]" style={{ gridColumn: 1, gridRow: rowIdx + 2, borderColor: "var(--bpm-border)", color: "var(--bpm-text-secondary)" }}>
                      {(DAY_START_MIN / 60 + rowIdx / 2) | 0}h{rowIdx % 2 === 1 ? "30" : "00"}
                    </div>
                    {[0, 1, 2, 3, 4, 5, 6].map((dayOffset) => {
                      const { start } = getWeekRange(focusDate);
                      const d = new Date(start);
                      d.setDate(start.getDate() + dayOffset);
                      const dateKey = formatDateKey(d);
                      const cellEvents = weekEvents.filter((e) => e.date === dateKey).filter((e) => {
                        const startMin = hourStringToMinutes(e.heure);
                        const slotStart = DAY_START_MIN + rowIdx * 30;
                        return startMin >= slotStart && startMin < slotStart + 30;
                      });
                      return (
                        <div
                          key={`${dayOffset}-${rowIdx}`}
                          className="border-b border-r relative min-h-[32px]"
                          style={{ gridColumn: dayOffset + 2, gridRow: rowIdx + 2, borderColor: "var(--bpm-border)" }}
                        >
                          {cellEvents.map((ev) => (
                            <button
                              key={ev.id}
                              type="button"
                              className="absolute inset-0.5 rounded px-1 text-left text-xs truncate cursor-pointer hover:opacity-90"
                              style={{
                                background: (ev.couleur ?? "var(--bpm-accent-cyan)") + "33",
                                borderLeft: `3px solid ${ev.couleur ?? "var(--bpm-accent-cyan)"}`,
                                color: "var(--bpm-text-primary)",
                              }}
                              onClick={(e) => { e.stopPropagation(); setSelectedEvent(ev); }}
                            >
                              {formatHeureDisplay(ev.heure)} {ev.titre}
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
              {weekEvents.length === 0 && (
                <p className="py-4 text-center text-sm col-span-full" style={{ color: "var(--bpm-text-secondary)" }}>Aucun événement cette semaine.</p>
              )}
            </div>
          )}

          {/* Vue Mois */}
          {view === "mois" && (
            <div className="text-sm">
              <div className="inline-grid grid-cols-7 gap-1.5 text-center w-full max-w-full sm:max-w-[480px]">
                <div
                  className="text-sm font-semibold py-1.5 pb-2 col-span-full flex items-center justify-center"
                  style={{ color: "var(--bpm-text-primary)" }}
                >
                  {MONTHS[month].charAt(0).toUpperCase() + MONTHS[month].slice(1)} {year}
                </div>
                {WEEKDAYS_LABELS.map((d) => (
                  <span key={d} className="text-xs font-medium py-1" style={{ color: "var(--bpm-text-secondary)" }}>{d}</span>
                ))}
                {Array.from({ length: startPad }, (_, i) => (
                  <span key={`pad-${i}`} className="p-1.5 rounded-md text-sm opacity-40" style={{ color: "var(--bpm-text-secondary)" }}>—</span>
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const d = i + 1;
                  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                  const dayEvs = filteredEvents.filter((e) => e.date === dateStr);
                  const hasEvent = dayEvs.length > 0;
                  const isToday = dateStr === todayKey;
                  return (
                    <button
                      key={d}
                      type="button"
                      className="p-1.5 rounded-md text-sm text-center hover:bg-[var(--bpm-bg-secondary)] transition-colors"
                      style={{
                        background: isToday ? "var(--bpm-accent)" : hasEvent ? "rgba(0,163,226,0.1)" : "transparent",
                        color: isToday ? "#fff" : "var(--bpm-text-primary)",
                        fontWeight: isToday ? 600 : undefined,
                      }}
                      onClick={() => { setFocusDate(new Date(year, month, d)); setView("jour"); }}
                    >
                      {d}
                      {hasEvent && (
                        <span className="flex justify-center gap-0.5 mt-0.5 flex-wrap">
                          {dayEvs.slice(0, 3).map((e, j) => (
                            <span key={j} className="block w-1.5 h-1.5 rounded-full shrink-0" style={{ background: e.couleur ?? "var(--bpm-accent-cyan)" }} />
                          ))}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
                Cliquez sur un jour pour afficher la vue Jour. Le jour en surbrillance est aujourd&apos;hui.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modale détail événement (P10) */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.titre}
        size="small"
      >
        {selectedEvent && (
          <div className="space-y-3 text-sm">
            <p className="m-0"><strong>Date :</strong> {selectedEvent.date}</p>
            <p className="m-0"><strong>Heure :</strong> {formatHeureDisplay(selectedEvent.heure)}{selectedEvent.duree ? ` (${selectedEvent.duree} min)` : ""}</p>
            {selectedEvent.recurrence && (
              <p className="m-0"><strong>Récurrence :</strong> {selectedEvent.recurrence === "daily" ? "Tous les jours" : selectedEvent.recurrence === "weekly" ? "Toutes les semaines" : "Tous les mois"}</p>
            )}
            {selectedEvent.lieu && <p className="m-0"><strong>Lieu :</strong> {selectedEvent.lieu}</p>}
            {selectedEvent.categorie && <p className="m-0"><strong>Catégorie :</strong> {selectedEvent.categorie}</p>}
            {selectedEvent.statut && <p className="m-0"><strong>Statut :</strong> {selectedEvent.statut}</p>}
            {selectedEvent.description && <p className="m-0"><strong>Description :</strong> {selectedEvent.description}</p>}
            {selectedEvent.participants && selectedEvent.participants.length > 0 && (
              <p className="m-0"><strong>Participants :</strong> {selectedEvent.participants.join(", ")}</p>
            )}
            <div className="flex gap-2 pt-2">
              {selectedEvent._user && (
                <Button variant="secondary" size="small" onClick={() => handleDeleteEvent(selectedEvent)}>
                  Supprimer
                </Button>
              )}
              <Button variant="secondary" size="small" onClick={() => setSelectedEvent(null)}>Fermer</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modale formulaire Nouvel événement (P11) */}
      <EventFormModal open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleAddEvent} defaultDate={focusKey} />

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>← Retour aux modules</Link>
      </p>
    </div>
  );
}

const RECURRENCE_OPTIONS = [
  { value: "", label: "Aucune" },
  { value: "daily", label: "Tous les jours" },
  { value: "weekly", label: "Toutes les semaines" },
  { value: "monthly", label: "Tous les mois" },
];

/** Génère les dates pour une récurrence à partir de la date de début. */
function generateRecurrenceDates(
  startDateStr: string,
  recurrence: "daily" | "weekly" | "monthly",
  count: number
): string[] {
  const [y, m, d] = startDateStr.split("-").map(Number);
  const dates: string[] = [];
  let current = new Date(y, m - 1, d);
  for (let i = 0; i < count; i++) {
    dates.push(
      `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`
    );
    if (recurrence === "daily") current.setDate(current.getDate() + 1);
    else if (recurrence === "weekly") current.setDate(current.getDate() + 7);
    else current.setMonth(current.getMonth() + 1);
  }
  return dates;
}

/** Retourne toutes les dates entre du et au (inclus), au format YYYY-MM-DD. */
function getDatesBetween(du: string, au: string): string[] {
  if (au < du) return [du];
  const [y1, m1, d1] = du.split("-").map(Number);
  const [y2, m2, d2] = au.split("-").map(Number);
  const start = new Date(y1, m1 - 1, d1);
  const end = new Date(y2, m2 - 1, d2);
  const dates: string[] = [];
  const current = new Date(start);
  while (current <= end) {
    dates.push(
      `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`
    );
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function EventFormModal({
  open,
  onClose,
  onSubmit,
  defaultDate,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (ev: Omit<CalEvent, "id" | "_user"> | Omit<CalEvent, "id" | "_user">[]) => void;
  defaultDate: string;
}) {
  const [date, setDate] = useState(defaultDate);
  const [dateFin, setDateFin] = useState("");
  const [heure, setHeure] = useState("09h00");
  const [titre, setTitre] = useState("");
  const [duree, setDuree] = useState("");
  const [lieu, setLieu] = useState("");
  const [description, setDescription] = useState("");
  const [couleur, setCouleur] = useState(COULEURS[0].value);
  const [recurrence, setRecurrence] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim()) return;
    const h = heure.includes("h") ? heure : `${heure.slice(0, 2)}h${heure.slice(2) || "00"}`;
    const base: Omit<CalEvent, "id" | "_user" | "date"> = {
      titre: titre.trim(),
      heure: h,
      duree: duree ? parseInt(duree, 10) : undefined,
      lieu: lieu.trim() || undefined,
      description: description.trim() || undefined,
      couleur,
      recurrence: recurrence ? (recurrence as "daily" | "weekly" | "monthly") : undefined,
    };
    if (recurrence === "daily" || recurrence === "weekly" || recurrence === "monthly") {
      const count = recurrence === "daily" ? 60 : recurrence === "weekly" ? 12 : 12;
      const dates = generateRecurrenceDates(date, recurrence as "daily" | "weekly" | "monthly", count);
      onSubmit(dates.map((d) => ({ ...base, date: d })));
    } else if (dateFin && dateFin >= date) {
      const dates = getDatesBetween(date, dateFin);
      onSubmit(dates.map((d) => ({ ...base, date: d })));
    } else {
      onSubmit({ ...base, date });
    }
    setTitre("");
    setHeure("09h00");
    setDuree("");
    setLieu("");
    setDescription("");
    setDate(defaultDate);
    setDateFin("");
    setCouleur(COULEURS[0].value);
    setRecurrence("");
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="Nouvel événement" size="small">
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input label="Titre" value={titre} onChange={setTitre} placeholder="Titre de l'événement" required />
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>Du</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm"
            style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)", color: "var(--bpm-text-primary)" }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>Au (optionnel)</label>
          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            min={date}
            className="w-full px-3 py-2 rounded-lg border text-sm"
            style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)", color: "var(--bpm-text-primary)" }}
            title="Laisser vide pour un événement sur un seul jour"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>Heure</label>
            <input
              type="time"
              value={(() => {
                const [h, m] = heure.split("h");
                return `${(h ?? "09").padStart(2, "0")}:${(m ?? "00").padStart(2, "0")}`;
              })()}
              onChange={(e) => {
                const v = e.target.value;
                const [h, m] = v.split(":").map((x) => x || "0");
                setHeure(`${h}h${m.padStart(2, "0")}`);
              }}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)", color: "var(--bpm-text-primary)" }}
            />
          </div>
          <div>
            <Input label="Durée (min)" value={duree} onChange={setDuree} type="number" placeholder="60" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>Récurrence</label>
          <Selectbox
            options={RECURRENCE_OPTIONS}
            value={recurrence}
            onChange={(v) => setRecurrence(v ?? "")}
            placeholder="Aucune"
          />
        </div>
        <Input label="Lieu" value={lieu} onChange={setLieu} placeholder="Salle, Visio..." />
        <Textarea label="Description" value={description} onChange={setDescription} placeholder="Optionnel" rows={2} />
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>Couleur</label>
          <div className="flex flex-wrap gap-2">
            {COULEURS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCouleur(c.value)}
                className="w-8 h-8 rounded-full border-2 transition-transform"
                style={{
                  background: c.value,
                  borderColor: couleur === c.value ? "var(--bpm-text-primary)" : "transparent",
                }}
                title={c.label}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button type="submit" size="small">Créer</Button>
          <Button type="button" variant="secondary" size="small" onClick={onClose}>Annuler</Button>
        </div>
      </form>
    </Modal>
  );
}
