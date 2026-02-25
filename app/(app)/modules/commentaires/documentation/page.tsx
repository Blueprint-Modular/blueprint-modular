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
        <p className="doc-description">
          Fil de commentaires et annotations sur une entité (document, ligne, projet). Auteur, date et contenu.
        </p>
      </div>

      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        Les modules Blueprint Modular font partie de l&apos;<strong>application Next.js</strong>. Il n&apos;y a pas de package séparé par module : on installe l&apos;application une fois. Cette documentation décrit <strong>comment fonctionne</strong> le module Commentaires (affichage, ajout, liaison à une entité), <strong>comment l&apos;intégrer</strong> (API ou store) et les données attendues.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Comment fonctionne le module Commentaires
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Le module affiche un <strong>fil de commentaires</strong> associé à une entité (par ex. un document, une ligne de tableau, un projet). Chaque commentaire comporte un <strong>auteur</strong>, une <strong>date</strong> et un <strong>contenu</strong>. L&apos;utilisateur peut ajouter un nouveau commentaire via un champ de saisie et un bouton d&apos;envoi. Les données sont persistées côté backend (API ou base) selon votre implémentation.
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Structure des commentaires
      </h3>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><code>id</code> — identifiant unique</li>
        <li><code>entityId</code> / <code>entityType</code> — référence à l&apos;entité commentée</li>
        <li><code>author</code> — nom ou identifiant de l&apos;auteur</li>
        <li><code>date</code> — date/heure du commentaire (ISO ou format affiché)</li>
        <li><code>content</code> — texte du commentaire</li>
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Intégration côté app
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        La page du module est <code>/modules/commentaires</code>. Pour alimenter et enregistrer les commentaires, exposez par exemple <code>GET /api/comments?entityId=...&entityType=...</code> et <code>POST /api/comments</code>. La session utilisateur (NextAuth) fournit l&apos;auteur du commentaire. Aucune variable d&apos;environnement spécifique n&apos;est requise.
      </p>

      <p className="mb-2 text-sm font-medium" style={{ color: "var(--bpm-text-primary)" }}>Exemple — afficher et ajouter un commentaire :</p>
      <CodeBlock
        code={'bpm.title("Commentaires")\nbpm.panel("Commentaires", bpm.container(comments_list))\n# Zone "Nouveau commentaire" : input + bouton Envoyer'}
        language="python"
      />

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Simulateur
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Le simulateur permet d&apos;afficher un fil de commentaires de démo et d&apos;ajouter un nouveau commentaire (état local) pour tester l&apos;interface sans backend.
      </p>
      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/commentaires/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Ouvrir le simulateur Commentaires</Link>
      </p>

      <p className="mt-8 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/commentaires" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>← Retour au module Commentaires</Link>
      </p>
    </div>
  );
}
