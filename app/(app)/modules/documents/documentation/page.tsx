"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function DocumentsDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/documents">Analyse de documents</Link> → Documentation
        </nav>
        <h1>Documentation — Analyse de documents</h1>
        <p className="doc-description">
          Upload, analyse et gestion de documents PDF. Métadonnées et statut d&apos;analyse. Intégration avec le module IA (contexte assistant).
        </p>
      </div>

      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        Les modules Blueprint Modular (Auth, Wiki, IA, Documents, etc.) font partie de l&apos;<strong>application Next.js</strong>. Il n&apos;y a pas de package séparé par module (pas de <code>pip install blueprint-modular-documents</code> ni <code>npm install blueprint-modular-documents</code>) : on installe l&apos;application une fois, puis on configure les variables d&apos;environnement et les services (base PostgreSQL, Ollama ou Anthropic pour l&apos;IA) selon les modules utilisés. Cette documentation décrit <strong>comment installer</strong> le module Analyse de documents et toutes ses dépendances (Node, Prisma, extraction PDF, serveur IA), <strong>comment il fonctionne</strong>, <strong>comment le paramétrer</strong> (variables d&apos;environnement, formats, taille max) et comment l&apos;utiliser (interface ou API).
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Comment fonctionne le module Analyse de documents
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Le module permet d&apos;<strong>uploader</strong> des documents <strong>PDF</strong>, de les <strong>analyser automatiquement</strong> via l&apos;IA pour extraire fournisseur, client, dates (contrat, signature, échéance), résumé, points clés et engagements. Le résultat est stocké en base (table <code>Document</code>) ; le fichier est enregistré sur disque dans <code>uploads/[userId]/[docId].pdf</code>. L&apos;analyse est lancée juste après l&apos;upload (synchrone) : extraction du texte (pdf-parse), puis appel au modèle (Claude si <code>ANTHROPIC_API_KEY</code> est défini, sinon Ollama / Qwen). Le module Documents est enregistré dans le registry de l&apos;assistant IA : les métadonnées des documents peuvent être injectées dans le contexte des conversations.
      </p>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><strong>Statut</strong> : pending → processing → done (ou error). La liste se rafraîchit tant qu&apos;un document est en cours.</li>
        <li><strong>Alertes échéance</strong> : l&apos;UI affiche les documents dont la date de résiliation est dans les 30 prochains jours.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Installation et dépendances
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Le module fait partie de l&apos;application Next.js. Dépendances Node incluses dans le projet : <code>pdf-parse</code> pour l&apos;extraction de texte PDF. Pour l&apos;analyse IA (extraction fournisseur, client, dates, résumé, points clés) : soit <code>ANTHROPIC_API_KEY</code> (Claude), soit un serveur Ollama (Qwen) configuré via <code>AI_SERVER_URL</code> et <code>AI_MODEL</code>.
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Résumé des commandes (installer le module et toutes les dépendances)
      </h3>
      <CodeBlock
        code={`# 1. Dépendances Node et base PostgreSQL
npm install
npx prisma generate --schema=prisma/schema.prisma
npx prisma migrate deploy

# 2. Analyse IA — au choix :
# Option A : Claude (définir ANTHROPIC_API_KEY dans .env)
# Option B : Ollama (local ou VPS)
ollama serve
ollama pull qwen3:8b

# 3. Lancer l&apos;app
npm run dev

# 4. Ouvrir le module Documents
# http://localhost:3000/modules/documents`}
        language="bash"
      />
      <p className="mt-2 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        Définir <code>DATABASE_URL</code> dans <code>.env</code>. Pour l&apos;analyse IA : <code>ANTHROPIC_API_KEY</code> (Claude) ou <code>AI_SERVER_URL</code> + <code>AI_MODEL</code> (Ollama). Sans IA, l&apos;upload fonctionne mais l&apos;analyse restera en attente ou erreur.
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Analyse IA : Claude ou Ollama
      </h3>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        Par défaut, l&apos;analyse utilise <strong>Claude</strong> (Anthropic) si <code>ANTHROPIC_API_KEY</code> est défini. Sinon, fallback sur <strong>Ollama</strong> (Qwen). Pour utiliser uniquement Ollama, ne pas définir <code>ANTHROPIC_API_KEY</code> et lancer Ollama :
      </p>
      <CodeBlock
        code={`# Option A — Claude (Anthropic)
# Dans .env : ANTHROPIC_API_KEY=sk-...

# Option B — Ollama (local / VPS)
ollama serve
ollama pull qwen3:8b
# .env : AI_SERVER_URL=http://localhost:11434, AI_MODEL=qwen3:8b`}
        language="bash"
      />

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Où sont sauvegardés les documents
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        <strong>Base de données</strong> : table <code>Document</code> (id, filename, mimeType, filePath, uploadedById, analysisStatus, supplier, client, contractDate, terminationDate, summary, keyPoints, commitments, rawText, createdAt). <strong>Fichiers</strong> : <code>uploads/[userId]/[docId].pdf</code>. S&apos;assurer que le répertoire <code>uploads/</code> est accessible en écriture.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Comment charger et utiliser le module
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <strong>Charger</strong> : le module est intégré à l&apos;app ; après <code>npm install</code> et <code>prisma migrate deploy</code>, il est disponible. Aucun import ou script supplémentaire. <strong>Utiliser</strong> : depuis l&apos;interface, ouvrez <code>/modules/documents</code> pour uploader des PDF et consulter la liste ; depuis du code, appelez <code>POST /api/documents</code> (FormData avec <code>file</code>) pour uploader, <code>GET /api/documents</code> pour lister. Le module Documents est enregistré dans le registry de l&apos;assistant IA : en cochant « Documents » dans le panneau de contexte, les métadonnées des documents sont injectées dans le contexte des conversations.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Variables d&apos;environnement et paramétrage
      </h2>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><code>DATABASE_URL</code> — Connexion PostgreSQL (obligatoire).</li>
        <li><code>ANTHROPIC_API_KEY</code> — Clé API Anthropic pour l&apos;analyse via Claude (optionnel ; si absent, fallback Ollama).</li>
        <li><code>AI_SERVER_URL</code>, <code>AI_MODEL</code> — Serveur Ollama pour l&apos;analyse (ex. <code>http://localhost:11434</code>, <code>qwen3:8b</code>).</li>
        <li><strong>Formats acceptés</strong> : PDF uniquement (côté API actuel).</li>
        <li><strong>Taille max</strong> : dépend du serveur (proxy). En cas d&apos;erreur 413, augmenter <code>client_max_body_size</code> (nginx) ou la limite côté Next.js si configurée.</li>
      </ul>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <strong>Base de données et prérequis production</strong> : table <code>Document</code>, variables d&apos;environnement et déploiement détaillés dans <code>docs/DATABASE.md</code> du dépôt.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        API (résumé)
      </h2>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><code>GET /api/documents</code> — Liste des documents de l&apos;utilisateur.</li>
        <li><code>POST /api/documents</code> — Upload d&apos;un PDF. FormData : <code>file</code>. Réponse : document créé (analyse lancée en synchrone).</li>
        <li><code>GET /api/documents/[id]</code> — Détail d&apos;un document.</li>
        <li><code>DELETE /api/documents/[id]</code> — Supprimer un document (et le fichier si implémenté).</li>
      </ul>

      <nav className="doc-pagination mt-10">
        <Link href="/modules/documents" className="text-sm font-medium" style={{ color: "var(--bpm-accent-cyan)" }}>
          ← Retour à l&apos;Analyse de documents
        </Link>
        <a href="https://docs.blueprint-modular.com/modules/analyse-document.html" target="_blank" rel="noopener noreferrer" className="text-sm underline" style={{ color: "var(--bpm-accent-cyan)" }}>
          docs.blueprint-modular.com
        </a>
      </nav>
    </div>
  );
}
