"use client";

import Link from "next/link";
import { Tabs, CodeBlock, Panel, Selectbox, Button } from "@/components/bpm";

const docContent = (
  <>
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
    <p className="mb-6" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
      Choix de créneaux ou de ressources avec disponibilités.
    </p>
    <CodeBlock code={'bpm.title("Reservation Creneaux")'} language="python" />
  </>
);

function SimuContent() {
  return (
    <Panel variant="info" title="Choisir un créneau">
      <Selectbox options={[{ value: "09", label: "09h-10h" }, { value: "10", label: "10h-11h" }]} value={null} onChange={() => {}} placeholder="Créneau" label="Créneau" />
      <Button className="mt-4">Réserver</Button>
    </Panel>
  );
}

export default function ReservationCreneauxModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → Réservation / Créneaux</div>
        <h1>Réservation / Créneaux</h1>
        <p className="doc-description">Choix de créneaux ou de ressources. Testez dans le Simulateur.</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">Métier</span></div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}><Link href="/modules/reservation-creneaux/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Ouvrir le simulateur</Link></p>
      </div>
      <Tabs tabs={[{ label: "Documentation", content: docContent }, { label: "Simulateur", content: <SimuContent /> }]} defaultTab={0} />
    </div>
  );
}
