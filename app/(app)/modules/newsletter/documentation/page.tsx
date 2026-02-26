"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function NewsletterDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/newsletter">Newsletter</Link> → Documentation
        </nav>
        <h1>Documentation — Newsletter</h1>
        <p className="doc-description">
          Photo de header, création d’articles et archivage des numéros. Gérez le contenu de votre newsletter depuis l’interface ou l’API.
        </p>
      </div>

      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        Le module <strong>Newsletter</strong> fait partie de l’application Next.js. Il permet de configurer une <strong>image d’en-tête</strong> (URL), de <strong>créer et éditer des articles</strong> (titre, contenu, extrait, date de publication) et de <strong>archiver</strong> les articles ou numéros. Les données sont stockées en base PostgreSQL (Prisma).
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Fonctionnalités
      </h2>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><strong>Photo de header</strong> : paramétrage via <code>/modules/newsletter/parametres</code>. Une URL d’image est enregistrée et peut être réutilisée pour l’affichage de la newsletter.</li>
        <li><strong>Articles</strong> : titre, contenu (texte), extrait optionnel, date de publication optionnelle. Chaque article est lié à l’utilisateur connecté (auteur).</li>
        <li><strong>Archivage</strong> : chaque article peut être marqué comme archivé. La liste des articles peut être filtrée (actifs, archivés, tous).</li>
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Installation
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Le module utilise Prisma et PostgreSQL. Appliquez la migration Newsletter si ce n’est pas déjà fait.
      </p>
      <CodeBlock
        code={`npx prisma migrate deploy
# ou en dev :
npx prisma migrate dev --name add_newsletter`}
        language="bash"
      />

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Modèles de données
      </h2>
      <p className="mb-2" style={{ color: "var(--bpm-text-secondary)" }}>
        <strong>NewsletterSettings</strong> : une ligne (id = &quot;default&quot;) avec <code>headerImageUrl</code> (optionnel).
      </p>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        <strong>NewsletterArticle</strong> : id, title, content, excerpt, publishedAt, archived, authorId, createdAt, updatedAt.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        API
      </h2>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><code>GET /api/newsletter/settings</code> — récupère les paramètres (header image).</li>
        <li><code>PUT /api/newsletter/settings</code> — met à jour les paramètres (body : <code>{`{ headerImageUrl?: string | null }`}</code>).</li>
        <li><code>GET /api/newsletter/articles</code> — liste des articles de l’utilisateur (query : <code>archived</code> = true | false, <code>sortBy</code>, <code>sortOrder</code>).</li>
        <li><code>POST /api/newsletter/articles</code> — crée un article (body : title, content, excerpt?, publishedAt?).</li>
        <li><code>GET /api/newsletter/articles/[id]</code> — détail d’un article.</li>
        <li><code>PUT /api/newsletter/articles/[id]</code> — met à jour un article (title, content, excerpt, publishedAt, archived).</li>
        <li><code>DELETE /api/newsletter/articles/[id]</code> — supprime un article.</li>
        <li><code>PATCH /api/newsletter/articles/[id]/archive</code> — bascule l’état archivé (body : <code>{`{ archived?: boolean }`}</code>).</li>
      </ul>

      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        Toutes les routes API nécessitent une session utilisateur (ou <code>SKIP_AUTH_FOR_TEST</code> en environnement de test).
      </p>

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href="/modules/newsletter" style={{ color: "var(--bpm-accent-cyan)" }}>
          ← Retour à la Newsletter
        </Link>
        <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>
          Liste des modules
        </Link>
      </nav>
    </div>
  );
}
