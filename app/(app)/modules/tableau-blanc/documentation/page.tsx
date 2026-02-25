"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function TableauBlancDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/tableau-blanc">Tableau blanc</Link> → Documentation
        </nav>
        <h1>Documentation — Tableau blanc</h1>
        <p className="doc-description">Post-it et zones de texte pour rétrospectives ou ateliers.</p>
      </div>
      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        Les modules Blueprint Modular font partie de l&apos;application Next.js. Cette documentation décrit comment fonctionne le module Tableau blanc (post-it, zones de texte), comment l&apos;intégrer (API ou store) et les données attendues.
      </p>
      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>Comment fonctionne le module Tableau blanc</h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Le module fournit un tableau blanc avec des post-it (cartes) et une zone de saisie pour en ajouter. Idéal pour rétrospectives, brainstormings ou ateliers. Données en local ou via API selon votre implémentation.
      </p>
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>Structure des données</h3>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><code>id</code> — identifiant du post-it</li>
        <li><code>content</code> — texte du post-it</li>
        <li><code>column</code> — colonne éventuelle (bien, ameliorer, action)</li>
      </ul>
      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>Intégration</h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Page <code>/modules/tableau-blanc</code>. Exposez GET/POST pour les post-it. Aucune variable d&apos;environnement spécifique.
      </p>
      <CodeBlock code={'bpm.title("Rétro")\nbpm.panel("Post-it", zone_texte + bouton Ajouter)'} language="python" />
      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>Simulateur</h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>Le simulateur permet d&apos;ajouter des post-it (état local) pour tester l&apos;interface sans backend.</p>
      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/tableau-blanc/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Ouvrir le simulateur Tableau blanc</Link>
      </p>
      <p className="mt-8 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/tableau-blanc" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>← Retour au module Tableau blanc</Link>
      </p>
    </div>
  );
}
