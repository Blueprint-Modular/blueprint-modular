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
        Mode opératoire
      </h2>
      <ol className="list-decimal pl-6 mb-4 text-sm space-y-2" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><strong>Ouvrir le Monitor</strong> — Aller sur <em>Modules → Monitor</em>. L’overlay s’affiche en haut à droite (panneau repliable).</li>
        <li><strong>Clé API Claude (optionnel)</strong> — Pour Q&R IA, traduction et résumé : cliquer sur 🔑, saisir la clé Anthropic, elle est stockée en local (localStorage) et envoyée au backend.</li>
        <li><strong>Importer un PPTX</strong> — Cliquer sur « ↑ PPTX », choisir un fichier .pptx. Le backend extrait titre, slides, textes, notes du présentateur et KPIs. La présentation remplace l’état courant (slide 1 affichée).</li>
        <li><strong>Naviguer</strong> — Flèches ← / → ou boutons pour changer de slide. Le script et les notes de la slide courante s’affichent dans l’onglet « Script ».</li>
        <li><strong>Q&R en direct</strong> — Onglet « Q&R IA » : saisir une question reçue en visio, envoyer ; l’IA suggère une réponse en streaming (contexte = slide courante). Possibilité de logger la paire question / réponse pour le résumé.</li>
        <li><strong>Traduction</strong> — Onglet « Traduction » : coller un texte, choisir FR → EN ou EN → FR, envoyer ; la traduction est streamée.</li>
        <li><strong>Résumé de séance</strong> — Onglet « Résumé » : touche <kbd>S</kbd> (ou bouton) pour générer un compte-rendu avec actions de suivi à partir du titre, des slides et des questions loggées (streaming).</li>
        <li><strong>Visio</strong> — Garder l’overlay visible ou le masquer avec <kbd>H</kbd> / <kbd>Échap</kbd> selon besoin (présentation partagée + overlay sur un second écran ou en PIP).</li>
      </ol>

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

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Limite de taille du fichier PPTX
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        La taille maximale acceptée pour un PPTX (ex. 25 Mo) peut être augmentée à trois niveaux :
      </p>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><strong>Next.js</strong> — Dans <code>next.config.mjs</code>, <code>experimental.serverActions.bodySizeLimit</code> est déjà à <code>&quot;50mb&quot;</code> ; cela s’applique aux Server Actions. Les Route Handlers (proxy <code>/api/prompteur</code>) peuvent avoir une limite propre selon la version.</li>
        <li><strong>Nginx</strong> — En prod, si la requête passe par Nginx (vers Next.js ou directement vers le backend), ajouter <code>client_max_body_size 50m;</code> dans le bloc <code>server</code> ou dans le <code>location /api/prompteur/</code> pour autoriser les uploads jusqu’à 50 Mo. Sans cela, Nginx renvoie 413 (Payload Too Large) au-delà de 1 Mo par défaut.</li>
        <li><strong>Backend FastAPI (prompteur-api)</strong> — Si le backend impose une limite (ex. Starlette), l’augmenter côté Python (ex. paramètre <code>max_upload_size</code> ou équivalent selon votre <code>main.py</code>).</li>
      </ul>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        Pour accepter des PPTX jusqu’à 50 Mo : configurer au minimum Nginx (<code>client_max_body_size 50m;</code>) et, si besoin, le backend prompteur. Voir aussi le bloc <code>location /api/prompteur/</code> dans <code>deploy/DEPLOY_APP.md</code>.
      </p>

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href="/modules/monitor" style={{ color: "var(--bpm-accent-cyan)" }}>
          ← Retour au module
        </Link>
      </nav>
    </div>
  );
}
