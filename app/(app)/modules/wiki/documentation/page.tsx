"use client";

import Link from "next/link";

export default function WikiDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/wiki">Wiki</Link> → Documentation
        </nav>
        <h1>Documentation — Wiki</h1>
        <p className="doc-description">
          Wiki interne, arborescence d’articles, édition et Aide IA (mise en forme, génération depuis des notes). Le module IA peut s’appuyer sur le contenu des articles.
        </p>
      </div>
      <div className="prose max-w-none" style={{ color: "var(--bpm-text-primary)" }}>
        <p>
          <a
            href="https://docs.blueprint-modular.com/modules/wiki.html"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--bpm-accent-cyan)" }}
          >
            Voir la documentation complète du module Wiki sur docs.blueprint-modular.com →
          </a>
        </p>
      </div>
    </div>
  );
}
