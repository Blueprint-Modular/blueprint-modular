"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function MultiLangueDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb"><Link href="/modules">Modules</Link> → <Link href="/modules/multi-langue">Multi-langue</Link> → Documentation</nav>
        <h1>Documentation — Multi-langue</h1>
        <p className="doc-description">Sélection de langue et textes traduisibles.</p>
      </div>
      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>Choisir la langue de l&apos;UI et gérer les traductions des contenus.</p>
      <CodeBlock code={'bpm.title("Multi-langue")'} language="python" />
      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}><Link href="/modules/multi-langue/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Simulateur</Link></p>
    </div>
  );
}
