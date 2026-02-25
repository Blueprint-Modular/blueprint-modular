"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function CommentairesDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/commentaires">Commentaires</Link> → Documentation
        </nav>
        <h1>Documentation — Commentaires</h1>
        <p className="doc-description">Commentaires et annotations sur une entité (document, ligne, projet).</p>
      </div>
      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Fil de commentaires avec auteur, date et contenu. Les commentaires sont liés à une entité (id + type). Stockage en base ou en état selon votre implémentation.
      </p>
      <CodeBlock code={'bpm.title("Commentaires")\nbpm.panel("Nouveau commentaire", input_area)'} language="python" />
      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/commentaires/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Simulateur</Link>
      </p>
    </div>
  );
}
