"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function DevisFacturationDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb"><Link href="/modules">Modules</Link> → <Link href="/modules/devis-facturation">Devis / Facturation</Link> → Documentation</nav>
        <h1>Documentation — Devis / Facturation</h1>
        <p className="doc-description">Lignes, totaux, PDF, statuts (brouillon, envoyé, payé).</p>
      </div>
      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>Créer des devis et factures : lignes, totaux, export PDF, statuts (brouillon, envoyé, payé).</p>
      <CodeBlock code={'bpm.title("Devis / Facturation")'} language="python" />
      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}><Link href="/modules/devis-facturation/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Simulateur</Link></p>
    </div>
  );
}
