"use client";

import Link from "next/link";
import { Tabs, CodeBlock } from "@/components/bpm";

const docContent = (
  <>
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
    <p className="mb-6" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
      Le module <strong>Skeleton</strong> fournit des assemblages de <code>bpm.skeleton</code> pour afficher un état de chargement réaliste d&apos;une page complète (en-tête, métriques, cartes, tableau). Réutilisables tels quels ou à adapter à votre layout.
    </p>
    <CodeBlock code={'# Affichage d\'un chargement de page type dashboard\nbpm.title("Chargement...")\n# Puis assemblage de bpm.skeleton (header, métriques, contenu, tableau)'} language="python" />
  </>
);

function SimuContent() {
  return (
    <>
      <p className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Aperçu d&apos;un assemblage type. Pour voir le skeleton plein écran en situation de chargement, ouvrez le simulateur.
      </p>
      <div
        className="rounded-xl border p-4"
        style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)" }}
      >
        <p className="text-sm m-0" style={{ color: "var(--bpm-text-secondary)" }}>
          Le simulateur affiche une page entière en skeleton (header, titre, 3 métriques, zone contenu, tableau) construite uniquement avec <code>bpm.skeleton</code>.
        </p>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link href="/modules/skeleton/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Ouvrir le simulateur</Link>
        </p>
      </div>
    </>
  );
}

export default function SkeletonModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → Skeleton</div>
        <h1>Skeleton</h1>
        <p className="doc-description">Assemblages de bpm.skeleton pour un chargement de page complet. Testez dans le Simulateur.</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">Contenu & productivité</span></div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link href="/modules/skeleton/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Ouvrir le simulateur</Link>
        </p>
      </div>
      <Tabs tabs={[{ label: "Documentation", content: docContent }, { label: "Simulateur", content: <SimuContent /> }]} defaultTab={0} />
    </div>
  );
}
