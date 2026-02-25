"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function WorkflowDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/workflow">Workflow</Link> → Documentation
        </nav>
        <h1>Documentation — Workflow</h1>
        <p className="doc-description">États et transitions (brouillon, validé, archivé) avec historique.</p>
      </div>
      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Workflow léger : définir des états et des transitions autorisées. Historique (qui, quand, quel état). Idéal pour documents, demandes, validations.
      </p>
      <CodeBlock code={'bpm.title("Workflow")\n# États : brouillon, validé, archivé'} language="python" />
      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/workflow/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Simulateur</Link>
      </p>
    </div>
  );
}
