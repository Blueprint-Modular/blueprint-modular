"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function TemplatesDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/templates">Templates</Link> → Documentation
        </nav>
        <h1>Documentation — Templates</h1>
        <p className="doc-description">Bibliothèque de modèles avec champs à remplir.</p>
      </div>
      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Modèles prédéfinis (rapports, fiches, emails). L&apos;utilisateur choisit un modèle puis remplit les champs ; le document est généré (PDF, HTML ou enregistré en base).
      </p>
      <CodeBlock code={'bpm.title("Modèles")\nbpm.selectbox(options=modeles, label="Choisir un modèle")'} language="python" />
      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/templates/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Simulateur</Link>
      </p>
    </div>
  );
}
