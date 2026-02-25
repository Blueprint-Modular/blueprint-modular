"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function WebhooksDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb"><Link href="/modules">Modules</Link> → <Link href="/modules/webhooks">Webhooks</Link> → Documentation</nav>
        <h1>Documentation — Webhooks</h1>
        <p className="doc-description">Émission d&apos;événements vers des URLs externes.</p>
      </div>
      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>Enregistrer une URL et les événements à envoyer (validation, création, mise à jour).</p>
      <CodeBlock code={'bpm.title("Webhooks")'} language="python" />
      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}><Link href="/modules/webhooks/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Simulateur</Link></p>
    </div>
  );
}
