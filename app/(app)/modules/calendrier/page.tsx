"use client";

import Link from "next/link";
import { Tabs, CodeBlock, Button } from "@/components/bpm";

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

export default function CalendrierModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → Calendrier</div>
        <h1>Calendrier</h1>
        <p className="doc-description">Agenda jour / semaine / mois, événements et rappels. Testez dans le Simulateur.</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">Contenu & productivité</span></div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link href="/modules/calendrier/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Ouvrir le simulateur</Link>
        </p>
      </div>
      <Tabs tabs={[{ label: "Documentation", content: docContent }, { label: "Simulateur", content: <SimuContent /> }]} defaultTab={0} />
    </div>
  );
}
