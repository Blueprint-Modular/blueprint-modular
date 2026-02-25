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
      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Tableau blanc simple avec post-it (cartes) et zones de texte. Idéal pour rétros ou brainstormings. Données en local ou API.
      </p>
      <CodeBlock code={'bpm.title("Rétro")\nbpm.panel("Post-it", zone_texte)'} language="python" />
      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/tableau-blanc/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Simulateur</Link>
      </p>
    </div>
  );
}
