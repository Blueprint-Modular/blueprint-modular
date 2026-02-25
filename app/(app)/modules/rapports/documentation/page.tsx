"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function RapportsDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb"><Link href="/modules">Modules</Link> → <Link href="/modules/rapports">Rapports</Link> → Documentation</nav>
        <h1>Documentation — Rapports</h1>
        <p className="doc-description">Création de rapports à partir de données (champs, filtres, graphiques).</p>
      </div>
      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>Définir des modèles de rapport (champs, filtres, graphiques), puis générer des rapports (PDF/CSV) à la demande.</p>
      <CodeBlock code={'bpm.title("Rapports")\nbpm.selectbox(options=types_rapport, label="Type")'} language="python" />
      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}><Link href="/modules/rapports/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Simulateur</Link></p>
    </div>
  );
}
