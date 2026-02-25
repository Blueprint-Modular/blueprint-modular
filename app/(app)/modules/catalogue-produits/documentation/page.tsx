"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function CatalogueProduitsDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb"><Link href="/modules">Modules</Link> → <Link href="/modules/catalogue-produits">Catalogue produits</Link> → Documentation</nav>
        <h1>Documentation — Catalogue produits</h1>
        <p className="doc-description">Fiche produit, variantes, prix, stock.</p>
      </div>
      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>Gérer un catalogue produits avec références, prix, stock.</p>
      <CodeBlock code={'bpm.title("Catalogue")'} language="python" />
      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}><Link href="/modules/catalogue-produits/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Simulateur</Link></p>
    </div>
  );
}
