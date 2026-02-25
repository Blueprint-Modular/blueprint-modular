"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function CalendrierDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/calendrier">Calendrier</Link> → Documentation
        </nav>
        <h1>Documentation — Calendrier</h1>
        <p className="doc-description">Agenda avec vues jour, semaine, mois et événements.</p>
      </div>
      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Le module Calendrier affiche et gère des événements avec vues jour, semaine et mois. Données depuis un store local ou une API.
      </p>
      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>Exemple</h2>
      <CodeBlock code={'bpm.title("Agenda")\n# Événements : date, titre, heure, durée'} language="python" />
      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/calendrier/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Simulateur</Link>
      </p>
    </div>
  );
}
