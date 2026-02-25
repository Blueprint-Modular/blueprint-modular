"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function TableauxDeBordDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb"><Link href="/modules">Modules</Link> → <Link href="/modules/tableaux-de-bord">Tableaux de bord</Link> → Documentation</nav>
        <h1>Documentation — Tableaux de bord</h1>
        <p className="doc-description">Disposition de widgets (métriques, graphiques, tableaux) par l&apos;utilisateur.</p>
      </div>
      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>L&apos;utilisateur choisit les widgets et leur ordre (glisser-déposer). Préférences sauvegardées par utilisateur.</p>
      <CodeBlock code={'bpm.title("Mon tableau de bord")\nbpm.metric("CA", 142500, delta=3200)'} language="python" />
      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}><Link href="/modules/tableaux-de-bord/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Simulateur</Link></p>
    </div>
  );
}
