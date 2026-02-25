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

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>Structure d&apos;un modèle (à documenter)</h2>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        Un modèle peut exposer : <code className="px-1 rounded" style={{ background: "var(--bpm-bg-secondary)" }}>id</code>, <code className="px-1 rounded" style={{ background: "var(--bpm-bg-secondary)" }}>label</code>, <code className="px-1 rounded" style={{ background: "var(--bpm-bg-secondary)" }}>category</code>, <code className="px-1 rounded" style={{ background: "var(--bpm-bg-secondary)" }}>description</code>, <code className="px-1 rounded" style={{ background: "var(--bpm-bg-secondary)" }}>output</code> (pdf | html | base), <code className="px-1 rounded" style={{ background: "var(--bpm-bg-secondary)" }}>fields</code> (liste de champs avec key, label, type, required), <code className="px-1 rounded" style={{ background: "var(--bpm-bg-secondary)" }}>body</code> (contenu avec placeholders <code>{'{{variable}}'}</code>). Voir l&apos;audit du module pour la structure complète proposée.
      </p>

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/templates/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Simulateur</Link>
      </p>
    </div>
  );
}
