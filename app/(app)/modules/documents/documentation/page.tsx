"use client";

import Link from "next/link";

export default function DocumentsDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/documents">Analyse de documents</Link> → Documentation
        </nav>
        <h1>Documentation — Analyse de documents</h1>
        <p className="doc-description">
          Upload, analyse et gestion de documents. Métadonnées et statut d’analyse. Intégration avec le module IA.
        </p>
      </div>
      <div className="prose max-w-none" style={{ color: "var(--bpm-text-primary)" }}>
        <p>
          <a
            href="https://docs.blueprint-modular.com/modules/analyse-document.html"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--bpm-accent-cyan)" }}
          >
            Voir la documentation complète sur docs.blueprint-modular.com →
          </a>
        </p>
      </div>
    </div>
  );
}
