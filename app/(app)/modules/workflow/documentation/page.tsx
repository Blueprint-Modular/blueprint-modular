"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function WorkflowDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/workflow">Workflow</Link> → Documentation
        </nav>
        <h1>Documentation — Workflow</h1>
        <p className="doc-description">États et transitions (brouillon, validé, archivé) avec historique des changements.</p>
      </div>
      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        Les modules Blueprint Modular font partie de l&apos;<strong>application Next.js</strong>. Cette documentation décrit <strong>comment fonctionne</strong> le module Workflow (états, transitions, historique), <strong>comment l&apos;intégrer</strong> (API ou store) et les données attendues.
      </p>
      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>Comment fonctionne le module Workflow</h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Le module gère un <strong>workflow léger</strong> : des <strong>états</strong> (ex. Brouillon, Validé, Archivé) et des <strong>transitions</strong> autorisées entre états. Pour chaque entité (document, demande), on affiche le statut courant et les boutons de transition. Un <strong>historique</strong> enregistre qui a fait quelle transition et quand.
      </p>
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>Structure des données</h3>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><code>entityId</code> / <code>entityType</code> — référence de l&apos;entité</li>
        <li><code>status</code> — état courant (brouillon, validé, archivé)</li>
        <li><code>transitions</code> — transitions possibles depuis l&apos;état courant</li>
        <li><code>history</code> — événements (état précédent → nouvel état, auteur, date)</li>
      </ul>
      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>Intégration côté app</h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Page <code>/modules/workflow</code>. Exposez <code>GET /api/workflow/entity/:id</code> (statut + historique) et <code>POST /api/workflow/entity/:id/transition</code> (body : to). Session NextAuth pour l&apos;auteur. Aucune variable d&apos;environnement spécifique.
      </p>
      <CodeBlock code={'bpm.title("Workflow")\n# États : brouillon, validé, archivé. Boutons : Valider, Archiver selon état'} language="python" />
      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>Simulateur</h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>Le simulateur permet de tester les transitions et l&apos;historique sans backend.</p>
      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/workflow/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Ouvrir le simulateur Workflow</Link>
      </p>
      <p className="mt-8 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/workflow" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>← Retour au module Workflow</Link>
      </p>
    </div>
  );
}
