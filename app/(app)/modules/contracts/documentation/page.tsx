"use client";

import Link from "next/link";

export default function ContractsDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/contracts">Base contractuelle</Link> → Documentation
        </nav>
        <h1>Documentation — Base contractuelle</h1>
        <p className="doc-description">
          Contrats fournisseurs et CGV : upload PDF, analyse IA (métadonnées, engagements, risques), consultation et filtres par workspace (NXTFOOD / BEAM).
        </p>
      </div>
      <div className="prose max-w-none" style={{ color: "var(--bpm-text-primary)" }}>
        <p>
          <a
            href="https://docs.blueprint-modular.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--bpm-accent-cyan)" }}
          >
            Voir la documentation sur docs.blueprint-modular.com →
          </a>
        </p>
      </div>
    </div>
  );
}
