"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function ConnecteursDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb"><Link href="/modules">Modules</Link> → <Link href="/modules/connecteurs">Connecteurs</Link> → Documentation</nav>
        <h1>Documentation — Connecteurs</h1>
        <p className="doc-description">Configuration de sources (API, SFTP, base).</p>
      </div>
      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>Définir des connecteurs pour importer ou synchroniser des données.</p>
      <CodeBlock code={'bpm.title("Connecteurs")'} language="python" />
      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}><Link href="/modules/connecteurs/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Simulateur</Link></p>
    </div>
  );
}
