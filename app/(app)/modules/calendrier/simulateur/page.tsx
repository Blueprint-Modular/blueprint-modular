"use client";

import { useState } from "react";
import Link from "next/link";
import { Panel, Button, Table } from "@/components/bpm";

const events = [
  { date: "2025-02-25", titre: "Réunion équipe", heure: "10h" },
  { date: "2025-02-26", titre: "Revue livrables", heure: "14h" },
  { date: "2025-02-27", titre: "Point client", heure: "09h" },
  { date: "2025-02-28", titre: "Rétro sprint", heure: "16h" },
];

type View = "jour" | "semaine" | "mois";

export default function CalendrierSimulateurPage() {
  const [view, setView] = useState<View>("semaine");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/calendrier">Calendrier</Link> → Simulateur
        </div>
        <h1>Simulateur — Calendrier</h1>
        <p className="doc-description">
          Testez les vues Jour, Semaine et Mois avec des événements de démo.
        </p>
      </div>

      <Panel variant="info" title="Vue calendrier">
        <div className="flex gap-2 mb-4">
          <Button
            size="small"
            variant={view === "jour" ? "primary" : "secondary"}
            onClick={() => setView("jour")}
          >
            Jour
          </Button>
          <Button
            size="small"
            variant={view === "semaine" ? "primary" : "secondary"}
            onClick={() => setView("semaine")}
          >
            Semaine
          </Button>
          <Button
            size="small"
            variant={view === "mois" ? "primary" : "secondary"}
            onClick={() => setView("mois")}
          >
            Mois
          </Button>
        </div>

        {view === "jour" && (
          <div className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
            <p className="font-medium mb-2" style={{ color: "var(--bpm-text-primary)" }}>Vue Jour — 25 février 2025</p>
            <ul className="space-y-2">
              {events.filter((e) => e.date === "2025-02-25").map((e, i) => (
                <li key={i} className="flex gap-3" style={{ color: "var(--bpm-text-primary)" }}>
                  <span className="shrink-0 w-12">{e.heure}</span>
                  <span>{e.titre}</span>
                </li>
              ))}
              {events.filter((e) => e.date === "2025-02-25").length === 0 && (
                <li>Aucun événement ce jour.</li>
              )}
            </ul>
          </div>
        )}

        {view === "semaine" && (
          <Table
            columns={[{ key: "date", label: "Date" }, { key: "heure", label: "Heure" }, { key: "titre", label: "Événement" }]}
            data={events}
            striped
            hover
          />
        )}

        {view === "mois" && (
          <div className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
            <p className="font-medium mb-2" style={{ color: "var(--bpm-text-primary)" }}>Vue Mois — Février 2025</p>
            <p className="mb-2">Grille des jours avec indicateurs (points) pour les jours contenant des événements.</p>
            <div className="inline-grid grid-cols-7 gap-1 text-center" style={{ maxWidth: 320 }}>
              {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
                <span key={d} className="text-xs font-medium" style={{ color: "var(--bpm-text-secondary)" }}>{d}</span>
              ))}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28].map((d) => {
                const dateStr = `2025-02-${String(d).padStart(2, "0")}`;
                const hasEvent = events.some((e) => e.date === dateStr);
                return (
                  <span
                    key={d}
                    className="p-1 rounded"
                    style={{
                      background: hasEvent ? "rgba(0,163,226,0.15)" : "transparent",
                      color: "var(--bpm-text-primary)",
                    }}
                  >
                    {d}
                    {hasEvent && <span className="block w-1 h-1 rounded-full mx-auto mt-0.5" style={{ background: "var(--bpm-accent-cyan)" }} />}
                  </span>
                );
              })}
            </div>
            <p className="mt-3 text-xs">Cliquez sur un jour (dans une version complète) pour afficher la vue jour.</p>
          </div>
        )}
      </Panel>

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/calendrier" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>← Retour au module Calendrier</Link>
      </p>
    </div>
  );
}
