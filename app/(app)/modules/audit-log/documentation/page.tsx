"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function AuditLogDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link>
          {" → "}
          <Link href="/modules/audit-log">Audit / Log</Link>
          {" → "}
          Documentation
        </nav>
        <h1>Documentation — Audit / Log</h1>
        <p className="doc-description">Changements sur une entité (qui, quand, quoi).</p>
      </div>
      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>Historique d&apos;audit : qui a modifié quoi et quand.</p>
      <CodeBlock code={'bpm.title("Audit")'} language="python" />
      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}><Link href="/modules/audit-log/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Simulateur</Link></p>
    </div>
  );
}
