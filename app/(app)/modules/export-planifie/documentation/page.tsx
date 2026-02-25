"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function ExportPlanifieDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb"><Link href="/modules">Modules</Link> → <Link href="/modules/export-planifie">Export planifié</Link> → Documentation</nav>
        <h1>Documentation — Export planifié</h1>
        <p className="doc-description">Envoi périodique par email de rapports ou exports.</p>
      </div>
      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>Planifier l&apos;envoi d&apos;un rapport (fréquence + destinataires).</p>
      <CodeBlock code={'bpm.title("Export planifié")'} language="python" />
      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}><Link href="/modules/export-planifie/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Simulateur</Link></p>
    </div>
  );
}
