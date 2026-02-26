"use client";

import Link from "next/link";

export default function MonitorDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/monitor">Monitor</Link> → Documentation
        </nav>
        <h1>Documentation — Blueprint Monitor</h1>
        <p className="doc-description">
          Téléprompte IA pour présentations : import PPTX, suggestions de réponses Q&R, traduction et résumé de séance. Overlay utilisable en visio (Teams, etc.).
        </p>
      </div>

      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        Le module <strong>Monitor</strong> est un overlay qui s’affiche à l’écran pendant une présentation. Il permet de charger un fichier <strong>PPTX</strong>, d’afficher le script et les notes par slide, de recevoir des questions en direct et d’obtenir des réponses suggérées par l’IA, de traduire du texte (FR ↔ EN) et de générer un résumé post-séance avec actions de suivi.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Fonctionnalités
      </h2>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><strong>Import PPTX</strong> — Extraction automatique des titres, textes des slides, notes du présentateur et KPIs (si présents).</li>
        <li><strong>Script</strong> — Affichage et édition (double-clic) du script par slide.</li>
        <li><strong>Q&R IA</strong> — Saisie d’une question reçue en visio ; l’IA suggère une réponse en streaming (contexte = slide courante).</li>
        <li><strong>Traduction</strong> — Texte à traduire, direction FR → EN ou EN → FR, réponse en streaming.</li>
        <li><strong>Résumé</strong> — Génération d’un compte-rendu de la séance avec actions de suivi (à partir du titre, des slides et des questions loggées).</li>
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Clé API Claude (Anthropic)
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Les appels IA (Q&R, traduction, résumé) utilisent l’API <strong>Claude (Anthropic)</strong>. La clé se saisit dans l’interface du Monitor : bouton <strong>🔑</strong> dans la barre, puis champ « Clé API Claude (Anthropic) ». La valeur est stockée localement (localStorage) et envoyée en header <code>X-Anthropic-API-Key</code> à l’API prompteur. Ne jamais mettre de clé en dur dans le code.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Raccourcis clavier
      </h2>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><kbd>→</kbd> ou <kbd>Espace</kbd> — Slide suivante</li>
        <li><kbd>←</kbd> — Slide précédente</li>
        <li><kbd>Q</kbd> — Focus onglet Q&R IA</li>
        <li><kbd>T</kbd> — Focus onglet Traduction</li>
        <li><kbd>S</kbd> — Générer le résumé</li>
        <li><kbd>H</kbd> ou <kbd>Échap</kbd> — Masquer / afficher l’overlay</li>
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        API (backend Prompteur)
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Le Monitor appelle l’API <strong>/api/prompteur</strong> (proxy Next.js vers un backend FastAPI sur le port 8001). Les endpoints utilisés :
      </p>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><code>POST /api/prompteur/import-pptx</code> — Upload d’un fichier .pptx (multipart/form-data, champ <code>file</code>). Réponse : <code>title</code>, <code>slide_count</code>, <code>slides[]</code> (id, title, script, notes, kpis).</li>
        <li><code>POST /api/prompteur/suggest-answer</code> — Body JSON : <code>question</code>, <code>slide</code>, <code>lang</code>. Réponse : SSE (stream de texte).</li>
        <li><code>POST /api/prompteur/translate</code> — Body JSON : <code>text</code>, <code>direction</code> (fr_to_en | en_to_fr). Réponse : SSE.</li>
        <li><code>POST /api/prompteur/summarize</code> — Body JSON : <code>presentation_title</code>, <code>slides</code>, <code>questions_logged</code>. Réponse : SSE.</li>
        <li><code>GET /api/prompteur/health</code> — Santé du service et indicateur <code>anthropic_key_set</code>.</li>
      </ul>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        Le header <code>X-Anthropic-API-Key</code> est transmis par le proxy au backend ; le backend doit l’utiliser pour les appels Anthropic (ou fallback sur la variable d’environnement).
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Déploiement
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        En production, le service <strong>prompteur-api</strong> (FastAPI) doit tourner (ex. PM2) et être joignable depuis l’app Next.js (<code>PROMPTEUR_API_URL</code> ou routage Nginx vers le backend). Dépendances côté backend : <code>python-pptx</code>, <code>python-multipart</code>, SDK Anthropic. Voir <code>deploy/prompteur-api-requirements.txt</code>.
      </p>

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href="/modules/monitor" style={{ color: "var(--bpm-accent-cyan)" }}>
          ← Retour au module
        </Link>
      </nav>
    </div>
  );
}
