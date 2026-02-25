"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function ReferentielsDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb"><Link href="/modules">Modules</Link> → <Link href="/modules/referentiels">Référentiels</Link> → Documentation</nav>
        <h1>Documentation — Référentiels</h1>
        <p className="doc-description">CRUD simple pour listes métier (devises, pays, types).</p>
      </div>
      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>Gérer des listes de référence (devises, pays, types de document, etc.) et les utiliser dans les formulaires (selectbox, filtres).</p>
      <CodeBlock code={'bpm.title("Référentiels")\nbpm.table(columns=cols, data=referentiel_devises)'} language="python" />
      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}><Link href="/modules/referentiels/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Simulateur</Link></p>
    </div>
  );
}
