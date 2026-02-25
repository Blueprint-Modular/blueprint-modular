"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function ReservationCreneauxDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb"><Link href="/modules">Modules</Link> → <Link href="/modules/reservation-creneaux">Réservation / Créneaux</Link> → Documentation</nav>
        <h1>Documentation — Réservation / Créneaux</h1>
        <p className="doc-description">Choix de créneaux ou de ressources avec disponibilités.</p>
      </div>
      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>Réserver un créneau ou une ressource selon les disponibilités (calendrier, slots).</p>
      <CodeBlock code={'bpm.title("Reservation / Creneaux")'} language="python" />
      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}><Link href="/modules/reservation-creneaux/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Simulateur</Link></p>
    </div>
  );
}
