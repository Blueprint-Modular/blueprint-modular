"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function WikiDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/wiki">Wiki</Link> → Documentation
        </nav>
        <h1>Documentation — Wiki</h1>
        <p className="doc-description">
          Wiki interne, arborescence d&apos;articles, édition et Aide IA (mise en forme, génération depuis des notes). Le module IA peut s&apos;appuyer sur le contenu des articles.
        </p>
      </div>

      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        Les modules Blueprint Modular font partie de l&apos;<strong>application Next.js</strong>. Il n&apos;y a pas de package séparé par module (pas de <code>pip install blueprint-modular-wiki</code> ni <code>npm install blueprint-modular-wiki</code>) : on installe l&apos;application une fois, puis on configure la base PostgreSQL et le serveur IA (Ollama) selon les besoins. Cette documentation décrit <strong>comment le Wiki fonctionne</strong>, <strong>comment l&apos;installer</strong> (application, base de données, serveur IA et dépendances), <strong>où et comment sont sauvegardés les articles</strong> (aucun fichier sur disque — tout est en base PostgreSQL), les <strong>lignes de commande</strong> pour installer le Wiki et toutes ses dépendances (Node, Prisma, Ollama, modèle Qwen), et la <strong>gestion des $</strong> dans l&apos;assistant IA pour appeler ou référencer le Wiki dans vos questions.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Comment fonctionne le Wiki
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Le module Wiki permet de créer et organiser des articles en arborescence (parent / enfants). Chaque article a un <strong>titre</strong>, un <strong>slug</strong> unique (URL), un <strong>contenu</strong> en Markdown, un éventuel <strong>parent</strong> pour la hiérarchie, et un statut <strong>publié / brouillon</strong>. Seul l&apos;auteur (ou un admin) peut modifier ou supprimer un article ; les visiteurs ne voient que les articles publiés.
      </p>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        <strong>Workflow typique</strong> : vous vous connectez, vous allez sur <code>/modules/wiki</code>, vous cliquez sur « Nouvel article » et renseignez titre et slug (ou laissez le slug être déduit du titre). Vous choisissez éventuellement un article parent pour placer la page dans l&apos;arbre. Vous rédigez le contenu en Markdown dans l&apos;éditeur, vous pouvez utiliser « Mettre en forme » ou « Générer depuis des notes » (Aide IA). Une fois satisfait, vous publiez l&apos;article ; il devient visible pour les autres. Les articles restent modifiables ; vous pouvez changer le parent plus tard en éditant l&apos;article.
      </p>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><strong>Arborescence</strong> : les articles peuvent avoir un <code>parentId</code> pour former un arbre (sections, sous-pages). La liste des articles est affichée en arbre dans la page <code>/modules/wiki</code>.</li>
        <li><strong>Édition</strong> : l&apos;éditeur propose une barre d&apos;outils (gras, listes, titres, etc.) et du Markdown. Les articles sont sauvegardés via l&apos;API <code>PUT /api/wiki/[slug]</code>.</li>
        <li><strong>Aide IA</strong> : depuis l&apos;éditeur, vous pouvez « Générer depuis des notes » (l&apos;IA structure vos notes en article Markdown) ou « Mettre en forme » (amélioration du texte existant). Ces actions appellent <code>POST /api/wiki/generate</code> et utilisent le serveur IA configuré (Ollama / Qwen).</li>
        <li><strong>Intégration avec l&apos;assistant IA</strong> : le module Wiki est enregistré dans le registry des modules. Quand vous discutez avec l&apos;assistant et que le module Wiki est sélectionné, le contenu des articles récents (titres + corps) est injecté dans le contexte pour que l&apos;IA puisse s&apos;y référer.</li>
      </ul>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <strong>Base de données et prérequis production</strong> : tables <code>WikiArticle</code>, <code>WikiRevision</code>, <code>WikiComment</code>, <code>WikiBacklink</code> ; détail dans <code>docs/DATABASE.md</code> du dépôt.
      </p>

            <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Où sont sauvegardés les articles
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Les articles sont stockés <strong>uniquement en base de données</strong> (PostgreSQL), dans la table <code>WikiArticle</code> du schéma Prisma. Il n&apos;y a <strong>pas de fichiers sur le disque</strong> pour le contenu des articles : tout est persistant en base via Prisma. Vous ne choisissez donc pas un « dossier » ou un chemin de fichiers ; vous choisissez un <strong>article parent</strong> dans l&apos;interface (ou aucun, pour un article à la racine). Les champs principaux en base sont : <code>id</code>, <code>title</code>, <code>slug</code> (unique), <code>content</code> (texte Markdown), <code>parentId</code> (optionnel, pour l&apos;arborescence), <code>authorId</code>, <code>isPublished</code>, <code>createdAt</code>, <code>updatedAt</code>. Le slug est normalisé (minuscules, espaces → tirets, suppression des accents) via <code>lib/slug.ts</code> pour garantir des URLs stables.
      </p>
      <p className="mb-2 text-sm font-medium" style={{ color: "var(--bpm-text-primary)" }}>Choisir où « placer » un article (parent) :</p>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        Lors de la création d&apos;un article (formulaire « Nouvel article »), vous pouvez optionnellement choisir un <strong>article parent</strong>. Seuls les articles existants sont proposés dans une liste déroulante ; si vous ne choisissez pas de parent, l&apos;article sera à la racine de l&apos;arbre. La position dans l&apos;arbre est donc déterminée uniquement par le champ <code>parentId</code> en base (pas par un chemin de type <code>/dossiers/sous-dossier</code>). Vous pouvez modifier le parent plus tard en éditant l&apos;article (champ parent dans le formulaire d&apos;édition) ou en appelant l&apos;API <code>PUT /api/wiki/[slug]</code> avec un nouveau <code>parentId</code>.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Installation du Wiki et des dépendances
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Le Wiki fait partie de l&apos;application Next.js. Il n&apos;y a pas de package séparé à installer pour le Wiki lui-même. En revanche, il faut installer l&apos;application, la base de données, et éventuellement le serveur IA pour les fonctionnalités « Générer depuis des notes » et « Mettre en forme », ainsi que pour l&apos;assistant conversationnel qui s&apos;appuie sur le contenu du Wiki.
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        1. Installer l&apos;application (dépendances Node et base)
      </h3>
      <CodeBlock
        code={`# Cloner ou ouvrir le projet, puis :
npm install
npx prisma generate --schema=prisma/schema.prisma

# Créer la base PostgreSQL (locale ou distante) et appliquer les migrations :
npx prisma migrate deploy

# (Optionnel) Peupler la base avec des données de test :
# npx prisma db seed`}
        language="bash"
      />
      <p className="mt-2 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        La variable <code>DATABASE_URL</code> doit être définie dans <code>.env</code> (voir section Variables d&apos;environnement). Le schéma Prisma inclut le modèle <code>WikiArticle</code> ; la migration crée la table correspondante.
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        2. Installer et lancer le serveur IA (Ollama + modèle Qwen)
      </h3>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        Les fonctionnalités « Générer depuis des notes », « Mettre en forme » dans l&apos;éditeur Wiki, et l&apos;assistant conversationnel (module IA) utilisent un serveur compatible OpenAI (Ollama en local ou sur un VPS). Sans serveur IA, vous pouvez mettre <code>AI_MOCK=true</code> dans <code>.env</code> pour que l&apos;app renvoie des réponses mockées (développement uniquement).
      </p>
      <CodeBlock
        code={`# Installer Ollama (ex. sur Linux / WSL / macOS) :
# https://ollama.com/download

# Lancer Ollama et télécharger le modèle Qwen3 (8B) :
ollama serve
ollama pull qwen3:8b

# L’app est configurée par défaut pour http://localhost:11434 (Ollama).
# Sur un VPS, définir AI_SERVER_URL dans .env (ex. http://votre-vps:11434).`}
        language="bash"
      />
      <p className="mt-2 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        Variables d&apos;environnement utiles : <code>AI_SERVER_URL</code> (URL du serveur Ollama), <code>AI_MODEL</code> (ex. <code>qwen3:8b</code>), <code>AI_MOCK=true</code> pour désactiver les appels réels en dev.
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        3. Lancer l&apos;application
      </h3>
      <CodeBlock
        code={`npm run dev    # Développement (Next.js + Prisma)
# Puis ouvrir http://localhost:3000/modules/wiki`}
        language="bash"
      />

      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Résumé des commandes (installer le Wiki et toutes les dépendances)
      </h3>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        Voici l&apos;enchaînement complet pour installer l&apos;application (dont le Wiki), la base de données, et le serveur IA (Ollama + modèle Qwen) utilisé par l&apos;Aide IA du Wiki et par l&apos;assistant conversationnel :
      </p>
      <CodeBlock
        code={`# 1. Dépendances Node et schéma Prisma
npm install
npx prisma generate --schema=prisma/schema.prisma

# 2. Base PostgreSQL (créer la DB si besoin, puis) :
npx prisma migrate deploy

# 3. Serveur IA (Ollama) — dans un terminal dédié ou en arrière-plan
ollama serve
ollama pull qwen3:8b

# 4. Lancer l&apos;app Next.js
npm run dev

# 5. Ouvrir le Wiki
# http://localhost:3000/modules/wiki`}
        language="bash"
      />
      <p className="mt-2 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        Assurez-vous d&apos;avoir défini <code>DATABASE_URL</code>, <code>NEXTAUTH_SECRET</code>, <code>NEXTAUTH_URL</code> et, pour l&apos;IA, <code>AI_SERVER_URL</code> (ex. <code>http://localhost:11434</code>) et <code>AI_MODEL</code> (ex. <code>qwen3:8b</code>) dans <code>.env</code>. Sans serveur IA, vous pouvez mettre <code>AI_MOCK=true</code> pour utiliser des réponses simulées.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Variables d&apos;environnement
      </h2>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        Pour que le Wiki et l’ensemble des modules (dont l’IA) fonctionnent correctement :
      </p>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><code>DATABASE_URL</code> — URL de connexion PostgreSQL (obligatoire pour le Wiki).</li>
        <li><code>NEXTAUTH_SECRET</code>, <code>NEXTAUTH_URL</code> — Authentification (requise pour créer / éditer des articles).</li>
        <li><code>AI_SERVER_URL</code> — URL du serveur Ollama (ex. <code>http://localhost:11434</code>).</li>
        <li><code>AI_MODEL</code> — Modèle utilisé (ex. <code>qwen3:8b</code>).</li>
        <li><code>AI_MOCK</code> — <code>true</code> pour utiliser des réponses mockées sans serveur IA (dév).</li>
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Gestion des $ dans l’assistant IA (références aux modules)
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Dans le champ de saisie de l&apos;<strong>assistant IA</strong> (module IA), taper un <strong>$</strong> affiche une liste de suggestions de « tokens » permettant d&apos;inclure des références aux modules dans votre question. Par exemple : <code>$wiki</code> (Wiki), <code>$doc</code> (Documents), <code>$metric</code> (Métriques), etc. Ces tokens servent à l&apos;<strong>autocomplétion</strong> : en sélectionnant <code>$wiki</code>, vous insérez le libellé du module dans le message. Le contenu effectif des articles du Wiki n&apos;est pas inséré à la place du $ ; il est injecté dans le <strong>contexte</strong> envoyé au modèle lorsque le module « Wiki » est sélectionné dans le panneau de contexte de l&apos;assistant. Ainsi, l’IA reçoit les titres et le contenu des articles récents (jusqu’à une limite configurée, ex. 15 articles) et peut s&apos;y appuyer pour répondre. En résumé : le <strong>$</strong> sert à compléter rapidement un nom de module dans la zone de texte ; le choix des modules (Wiki, Documents, etc.) dans le panneau de contexte détermine quelles données sont envoyées au modèle.
      </p>
      <p className="mb-2 text-sm font-medium" style={{ color: "var(--bpm-text-primary)" }}>Comment utiliser le $ pour appeler le Wiki dans l&apos;assistant :</p>
      <ol className="list-decimal pl-6 mb-4 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        <li>Ouvrez l&apos;assistant IA (module IA, page <code>/modules/ia</code>).</li>
        <li>Dans le panneau de contexte (modules disponibles), cochez ou sélectionnez <strong>Wiki</strong> pour que le contenu des articles soit inclus dans le contexte envoyé au modèle.</li>
        <li>Dans la zone de saisie du message, tapez <strong>$</strong> : une liste de suggestions apparaît (<code>$wiki</code>, <code>$doc</code>, etc.). Sélectionnez <code>$wiki</code> pour insérer une référence au module Wiki dans votre texte (par ex. « Résume les points clés $wiki »).</li>
        <li>Le <code>$wiki</code> dans le message est un libellé / rappel pour vous ; les données réelles (titres et contenu des articles) sont ajoutées automatiquement au contexte de la requête grâce à la sélection du module Wiki dans le panneau. L&apos;IA peut donc répondre en s&apos;appuyant sur vos articles.</li>
      </ol>
      <p className="mb-2 text-sm font-medium" style={{ color: "var(--bpm-text-primary)" }}>Tokens disponibles (extrait) :</p>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><code>$wiki</code> — Wiki (articles).</li>
        <li><code>$doc</code> — Documents (analyses, contrats).</li>
        <li><code>$metric</code> — Métriques (dashboard).</li>
        <li><code>$table</code>, <code>$chart</code>, <code>$data</code> — Autres références données.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        API Wiki (résumé)
      </h2>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><code>GET /api/wiki</code> — Liste des articles (query : <code>published=true</code>, <code>search=</code>, <code>withContent=true</code>, <code>limit=</code>).</li>
        <li><code>POST /api/wiki</code> — Créer un article (body : <code>title</code>, <code>slug</code>, <code>content</code>, <code>parentId</code>, <code>isPublished</code>).</li>
        <li><code>GET /api/wiki/[slug]</code> — Détail d&apos;un article par slug.</li>
        <li><code>PUT /api/wiki/[slug]</code> — Mettre à jour un article (titre, contenu, statut publié).</li>
        <li><code>DELETE /api/wiki/[slug]</code> — Supprimer un article (auteur ou admin).</li>
        <li><code>POST /api/wiki/generate</code> — Génération IA : body <code>action: &quot;format&quot;</code> + <code>content</code> (et optionnel <code>title</code>) pour mise en forme ; sinon <code>notes</code>, <code>articleType</code> (guide, procedure, best-practice, reference), <code>workspace</code> (service1, service2, shared) pour génération depuis des notes (streaming).</li>
      </ul>

      <nav className="doc-pagination mt-10">
        <Link href="/modules/wiki" className="text-sm font-medium" style={{ color: "var(--bpm-accent-cyan)" }}>
          ← Retour au module Wiki
        </Link>
        <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          Documentation complète (externe) :{" "}
          <a
            href="https://docs.blueprint-modular.com/modules/wiki.html"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
            style={{ color: "var(--bpm-accent-cyan)" }}
          >
            docs.blueprint-modular.com
          </a>
        </span>
      </nav>
    </div>
  );
}
