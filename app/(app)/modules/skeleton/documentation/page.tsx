"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

/**
 * Page Documentation du module Skeleton.
 * Accessible via /modules/skeleton/documentation (lien depuis la liste des modules).
 */
export default function SkeletonDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/skeleton">Skeleton</Link> → Documentation
        </nav>
        <h1>Documentation — Skeleton</h1>
        <p className="doc-description">
          Assemblages de <code>bpm.skeleton</code> pour un état de chargement réaliste (en-tête, métriques, tableau). Quand l&apos;utiliser, comment l&apos;intégrer.
        </p>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link href="/modules/skeleton" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Page du module (Documentation + Simulateur)</Link>
          {" · "}
          <Link href="/modules/skeleton/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Simulateur</Link>
        </p>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
        Le module <strong>Skeleton</strong> fournit des assemblages de <code>bpm.skeleton</code> pour afficher un état de chargement réaliste d&apos;une page complète (en-tête, métriques, cartes, tableau). Réutilisables tels quels ou à adapter à votre layout.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>Composant bpm.skeleton</h2>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        Props : <code>variant</code> (rectangular, circular, text), <code>width</code>, <code>height</code>, <code>className</code>, <code>animated</code>, <code>shimmer</code>, <code>rounded</code>.
      </p>
      <CodeBlock
        code={'# Affichage d\'un chargement de page type dashboard\nbpm.title("Chargement...")\n# Puis assemblage de bpm.skeleton (header, métriques, contenu, tableau)'}
        language="python"
      />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>Guide d&apos;usage</h2>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <strong>Quand préférer le skeleton au spinner ?</strong> Utilisez un skeleton lorsque la page a une structure identifiable (tableau, formulaire, article) : le placeholder reproduit cette structure et réduit la perception du temps d&apos;attente. Utilisez un spinner pour des actions ponctuelles (soumission, chargement d&apos;un détail en overlay).
      </p>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <strong>Transition vers le contenu :</strong> affichez le skeleton tant que <code>loading === true</code>, puis le contenu réel. Pour une transition fluide, appliquez <code>transition: opacity 200ms ease-out</code> sur le conteneur skeleton et passez à <code>opacity: 0</code> avant de retirer le skeleton du DOM ou de le cacher.
      </p>
    </div>
  );
}
