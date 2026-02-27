"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function ContractsDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/contracts">Base contractuelle</Link> → Documentation
        </nav>
        <h1>Documentation — Base contractuelle</h1>
        <p className="doc-description">
          Contrats fournisseurs et CGV : upload PDF/DOCX/TXT, analyse IA (métadonnées, engagements, risques), consultation et filtres par workspace (Service 1 / Service 2).
        </p>
      </div>

      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        Les modules Blueprint Modular font partie de l&apos;<strong>application Next.js</strong>. Il n&apos;y a pas de package séparé par module (pas de <code>pip install blueprint-modular-contracts</code> ni <code>npm install blueprint-modular-contracts</code>) : on installe l&apos;application une fois, puis on configure les variables d&apos;environnement et les services (base PostgreSQL, Ollama pour l&apos;analyse IA). Cette documentation décrit <strong>comment installer</strong> le module Base contractuelle et toutes ses dépendances (Node, Prisma, extraction PDF/DOCX/TXT, serveur Ollama), <strong>comment il fonctionne</strong>, <strong>comment le paramétrer</strong> (workspace, type de contrat, taille max, variables d&apos;environnement) et comment l&apos;utiliser (interface ou API).
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Comment fonctionne le module Base contractuelle
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Le module permet d&apos;<strong>uploader</strong> des contrats (PDF, DOCX, TXT), de les <strong>analyser automatiquement</strong> via l&apos;IA (Ollama / Qwen par défaut) pour extraire métadonnées, engagements, risques et niveau de risque, puis de les <strong>consulter</strong> et filtrer par workspace (Service 1, Service 2) et par type (fournisseur, CGV, autre). Chaque contrat est stocké en base (PostgreSQL) et le fichier sur disque ; l&apos;analyse est lancée à l&apos;upload et le résultat est sauvegardé dans <code>extracted_data</code>. Un doublon (même hash de fichier) est refusé. Optionnellement, un embedding est généré en arrière-plan pour la recherche sémantique.
      </p>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><strong>Workspace</strong> : à l&apos;upload, vous choisissez <code>service1</code> ou <code>service2</code>. Les filtres de la liste permettent d&apos;afficher un seul workspace ou tous.</li>
        <li><strong>Type de contrat</strong> : <code>supplier</code> (fournisseur), <code>cgv</code> (CGV), <code>other</code>. Utilisé pour adapter le prompt d&apos;analyse IA.</li>
        <li><strong>Statut</strong> : pending → analyzing → done (ou error). La liste se rafraîchit tant qu&apos;un contrat est en cours d&apos;analyse.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Installation et dépendances
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Le module fait partie de l&apos;application Next.js. Dépendances Node incluses : <code>mammoth</code> (DOCX), <code>pdf-parse</code> (PDF), extraction de texte et client Ollama (<code>lib/ai/vllm-client</code>, <code>lib/ai/contract-analyzer</code>). Pour l&apos;analyse IA (métadonnées, engagements, risques), un serveur Ollama est requis.
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Résumé des commandes (installer le module et toutes les dépendances)
      </h3>
      <CodeBlock
        code={`# 1. Dépendances Node et base PostgreSQL
npm install
npx prisma generate --schema=prisma/schema.prisma
npx prisma migrate deploy

# 2. Serveur IA pour l&apos;analyse des contrats (Ollama)
ollama serve
ollama pull qwen3:8b

# 3. Lancer l&apos;app
npm run dev

# 4. Ouvrir le module Base contractuelle
# http://localhost:3000/modules/contracts`}
        language="bash"
      />
      <p className="mt-2 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        Définir dans <code>.env</code> : <code>DATABASE_URL</code>, <code>AI_SERVER_URL</code> (ex. <code>http://localhost:11434</code>), <code>AI_MODEL</code> (ex. <code>qwen3:8b</code>). Sans Ollama : <code>AI_MOCK=true</code> (l&apos;upload fonctionne mais l&apos;analyse restera en erreur ou analyzing).
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Serveur IA pour l&apos;analyse des contrats
      </h3>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        L&apos;analyse (métadonnées, risques, engagements) est effectuée par le client Ollama (<code>lib/ai/vllm-client</code>). Sans serveur, l&apos;upload fonctionne mais le statut restera en erreur ou analyzing. Pour activer l&apos;analyse :
      </p>
      <CodeBlock
        code={`# Lancer Ollama et télécharger le modèle (ex. Qwen3)
ollama serve
ollama pull qwen3:8b`}
        language="bash"
      />
      <p className="mt-2 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        Dans <code>.env</code> : <code>AI_SERVER_URL=http://localhost:11434</code>, <code>AI_MODEL=qwen3:8b</code>. En dev sans serveur : <code>AI_MOCK=true</code> (les analyses échoueront ou seront mockées selon le code).
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Où sont sauvegardés les contrats
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        <strong>Base de données</strong> : table <code>Contract</code> (id, title, contractType, workspace, filePath, fileHash, originalFilename, status, analysisProgress, extractedData, analyzedAt, embeddingVector, uploadedById, etc.). <strong>Fichiers</strong> : stockés sur le disque dans <code>uploads/contracts/[userId]/[contractId].[ext]</code>. Le répertoire doit être accessible en écriture par le serveur Next.js. Ne pas exposer <code>uploads/</code> directement en production ; les fichiers sont servis ou téléchargés via l&apos;API si besoin.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Comment charger et utiliser le module
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <strong>Charger</strong> : le module est intégré à l&apos;app ; après <code>npm install</code> et <code>prisma migrate deploy</code>, il est disponible. <strong>Utiliser</strong> : depuis l&apos;interface, ouvrez <code>/modules/contracts</code> pour uploader des contrats (PDF, DOCX, TXT), choisir workspace (Service 1 / Service 2) et type (fournisseur, CGV, autre), et consulter la liste avec filtres ; depuis du code, <code>POST /api/contracts</code> (FormData : <code>file</code>, <code>workspace</code>, <code>contractType</code>), <code>GET /api/contracts</code> (query : <code>workspace</code>, <code>contractType</code>, <code>status</code>).
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Variables d&apos;environnement et paramétrage
      </h2>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><code>DATABASE_URL</code> — Connexion PostgreSQL (obligatoire).</li>
        <li><code>AI_SERVER_URL</code>, <code>AI_MODEL</code> — Serveur Ollama pour l&apos;analyse (ex. <code>http://localhost:11434</code>, <code>qwen3:8b</code>).</li>
        <li><code>AI_MOCK</code> — <code>true</code> pour désactiver les appels réels (dév ; l&apos;analyse échouera ou sera mockée).</li>
        <li><strong>Workspace</strong> : à l&apos;upload, champ <code>workspace</code> (service1 | service2). Défaut : <code>service1</code>.</li>
        <li><strong>Type de contrat</strong> : <code>contractType</code> (supplier | cgv | other). Défaut : <code>other</code>.</li>
        <li><strong>Taille max fichier</strong> : 50 Mo par défaut (constante dans <code>app/api/contracts/route.ts</code>). En cas d&apos;erreur 413, augmenter la limite côté proxy (ex. nginx <code>client_max_body_size</code>).</li>
        <li><strong>Formats acceptés</strong> : PDF, DOCX, TXT (MIME vérifié côté API).</li>
      </ul>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <strong>Base de données et prérequis production</strong> : table <code>Contract</code>, variables d&apos;environnement et déploiement détaillés dans <code>docs/DATABASE.md</code> du dépôt.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        API (résumé)
      </h2>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><code>GET /api/contracts</code> — Liste des contrats de l&apos;utilisateur. Query : <code>workspace</code>, <code>contractType</code>, <code>status</code>.</li>
        <li><code>POST /api/contracts</code> — Upload d&apos;un contrat. FormData : <code>file</code>, <code>workspace</code>, <code>contractType</code>. Réponse : contrat créé (analyse lancée en synchrone).</li>
        <li><code>GET /api/contracts/[id]</code> — Détail d&apos;un contrat (métadonnées, extracted_data).</li>
        <li><code>POST /api/contracts/[id]/reanalyze</code> — Relancer l&apos;analyse IA.</li>
        <li><code>GET /api/contracts/search</code> — Recherche (ex. par embedding) si implémentée.</li>
      </ul>

      <nav className="doc-pagination mt-10">
        <Link href="/modules/contracts" className="text-sm font-medium" style={{ color: "var(--bpm-accent-cyan)" }}>
          ← Retour à la Base contractuelle
        </Link>
        <a href="https://docs.blueprint-modular.com/" target="_blank" rel="noopener noreferrer" className="text-sm underline" style={{ color: "var(--bpm-accent-cyan)" }}>
          docs.blueprint-modular.com
        </a>
      </nav>
    </div>
  );
}
