"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function ThemesDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb"><Link href="/modules">Modules</Link> → <Link href="/modules/themes">Thèmes</Link> → Documentation</nav>
        <h1>Documentation — Thèmes / White-label</h1>
        <p className="doc-description">Choix de thème, logo et couleurs par instance ou client.</p>
      </div>
      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>Personnaliser couleur d&apos;accent, logo et nom par instance ou client (white-label).</p>
      <CodeBlock code={'bpm.title("Thèmes")'} language="python" />
      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}><Link href="/modules/themes/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Simulateur</Link></p>
    </div>
  );
}
