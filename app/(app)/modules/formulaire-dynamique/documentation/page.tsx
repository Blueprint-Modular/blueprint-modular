"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function FormulaireDynamiqueDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb"><Link href="/modules">Modules</Link> → <Link href="/modules/formulaire-dynamique">Formulaire dynamique</Link> → Documentation</nav>
        <h1>Documentation — Formulaire dynamique</h1>
        <p className="doc-description">Formulaires dont les champs dépendent d&apos;un type ou référentiel.</p>
      </div>
      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>Champs affichés ou requis selon le type sélectionné ou un référentiel.</p>
      <CodeBlock code={'bpm.title("Formulaire dynamique")'} language="python" />
      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}><Link href="/modules/formulaire-dynamique/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Simulateur</Link></p>
    </div>
  );
}
