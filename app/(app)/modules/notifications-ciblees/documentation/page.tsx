"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function NotificationsCibleesDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb"><Link href="/modules">Modules</Link> → <Link href="/modules/notifications-ciblees">Notifications ciblées</Link> → Documentation</nav>
        <h1>Documentation — Notifications ciblées</h1>
        <p className="doc-description">Règles événement → destinataires et message.</p>
      </div>
      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>Définir des règles : si tel événement alors notifier telle liste de destinataires (emails, rôles).</p>
      <CodeBlock code={'bpm.title("Notifications ciblées")'} language="python" />
      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}><Link href="/modules/notifications-ciblees/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Simulateur</Link></p>
    </div>
  );
}
