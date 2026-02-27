"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function IADocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/ia">IA</Link> → Documentation
        </nav>
        <h1>Documentation — IA</h1>
        <p className="doc-description">
          Assistant conversationnel (Qwen par défaut via Ollama). Contexte des modules Wiki et Documents. Historique des conversations, sélection des modules pour le contexte.
        </p>
      </div>

      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        Les modules Blueprint Modular font partie de l&apos;<strong>application Next.js</strong>. Il n&apos;y a pas de package séparé par module (pas de <code>pip install blueprint-modular-ia</code> ni <code>npm install blueprint-modular-ia</code>) : on installe l&apos;application une fois, puis on configure la base PostgreSQL et le serveur Ollama (ou Anthropic) pour l&apos;assistant. Cette documentation décrit <strong>comment le module IA fonctionne</strong>, <strong>comment l&apos;installer</strong> (application, base de données, serveur Ollama et modèle), <strong>comment choisir le modèle</strong> (Qwen, Mistral, Claude), les <strong>lignes de commande</strong> pour installer l&apos;assistant IA et toutes ses dépendances (Node, Prisma, Ollama, Qwen ou Mistral), les <strong>lignes de code</strong> pour charger et utiliser le module (API, composant AIChat), et la <strong>gestion des $</strong> dans la zone de saisie pour référencer les modules (Wiki, Documents, etc.) dans vos questions.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Comment fonctionne le module IA
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Le module IA fournit un <strong>assistant conversationnel</strong> intégré à l&apos;app. Par défaut, les réponses sont générées par un modèle local via <strong>Ollama</strong> (ex. Qwen3 8B). Le contexte envoyé au modèle peut inclure les données des modules <strong>Wiki</strong> et <strong>Documents</strong> : titres et contenu des articles wiki récents, liste des documents uploadés et métadonnées. L&apos;utilisateur choisit quels modules activer dans le panneau de contexte ; le client construit alors un bloc de texte à partir du registry des modules et l&apos;envoie en <code>context_from_modules</code> à l&apos;API. L&apos;historique des conversations est sauvegardé en base (AiConversation, AiMessage) ; chaque discussion peut être reprise, supprimée ou dupliquée.
      </p>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><strong>Providers</strong> : Qwen et Mistral via Ollama ; Claude (Anthropic) si <code>ANTHROPIC_API_KEY</code> est défini. Seuls ces providers sont implémentés.</li>
        <li><strong>Transcription vocale (Whisper)</strong> : un bouton Micro dans la zone de saisie permet de dicter la question au lieu de la taper. L&apos;audio est envoyé à <code>POST /api/wiki/transcribe</code> (micro-service Whisper sur le VPS, port 9000) ; le texte transcrit est inséré dans la zone de saisie. Même service que pour le Wiki (nouvel article par dictée).</li>
        <li><strong>Streaming</strong> : les réponses sont streamées (Server-Sent Events) pour affichage progressif.</li>
        <li><strong>Prompts</strong> : le prompt système (lib/ai/prompt-templates) précise le rôle de l&apos;assistant (Blueprint Modular, français, pas de calcul ni d&apos;hypothèses). Si un contexte modules est fourni, il est injecté dans le prompt système.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Implémentation (côté app)
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Le module IA repose sur : (1) la route API <code>POST /api/ai/chat</code> qui reçoit le message, l&apos;historique et le contexte modules, appelle le client Ollama ou Anthropic, et stream la réponse ; (2) le client <code>lib/ai/vllm-client.ts</code> qui envoie les requêtes à Ollama (<code>/api/chat</code> en streaming) ; (3) le <strong>module registry</strong> (lib/ai/module-registry.ts) dans lequel Wiki et Documents s&apos;enregistrent au chargement de l&apos;app (ModuleRegistryInit) ; (4) le composant <code>AIChat</code> qui gère la saisie, l&apos;autocomplétion des tokens <code>$</code>, l&apos;envoi des messages et l&apos;affichage du flux. Les conversations sont persistées via <code>saveConversationTurn</code> dans l&apos;API après chaque réponse complète.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Lignes de code pour charger et utiliser le module IA
      </h2>
      <p className="mb-2 text-sm font-medium" style={{ color: "var(--bpm-text-primary)" }}>Charger le module :</p>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        Le module IA est intégré à l&apos;application Next.js ; il n&apos;y a pas de <code>import</code> ou de script à exécuter pour le « charger » séparément. Au démarrage de l&apos;app, le <strong>module registry</strong> est initialisé (ModuleRegistryInit) et enregistre les modules Wiki, Documents, etc. ; l&apos;assistant IA consomme ce registry pour construire le contexte. Assurez-vous que les routes API (<code>/api/ai/chat</code>, <code>/api/ai/conversations</code>, etc.) et le schéma Prisma (AiConversation, AiMessage) sont en place — ce qui est le cas après <code>prisma migrate deploy</code>.
      </p>
      <p className="mb-2 text-sm font-medium" style={{ color: "var(--bpm-text-primary)" }}>Utiliser le module :</p>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <strong>Depuis l&apos;interface</strong> : ouvrez la page <code>/modules/ia</code>. Vous pouvez envoyer des messages, sélectionner les modules (Wiki, Documents) dans le panneau de contexte pour inclure leur contenu dans le contexte envoyé au modèle, taper <strong>$</strong> dans la zone de saisie pour insérer des références (<code>$wiki</code>, <code>$doc</code>), et consulter ou reprendre l&apos;historique des conversations. <strong>Depuis du code</strong> : appelez <code>POST /api/ai/chat</code> avec <code>message</code>, <code>provider_name</code>, <code>conversation_history</code>, <code>discussion_id</code> (optionnel), <code>context_from_modules</code> (texte construit côté client à partir du module registry). Voir l&apos;exemple d&apos;appel côté client plus bas.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Installation du module IA et dépendances
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Le module IA fait partie de l&apos;application Next.js. Aucun package séparé n&apos;est requis pour l&apos;UI ; en revanche, pour des réponses réelles (hors mock), il faut un serveur Ollama (ou une clé Anthropic pour Claude). Les dépendances Node sont déjà dans le projet (<code>@anthropic-ai/sdk</code> pour Claude ; pas de SDK OpenAI pour l&apos;instant, Ollama utilise l&apos;API HTTP).
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        1. Installer l&apos;application
      </h3>
      <CodeBlock
        code={`npm install
npx prisma generate --schema=prisma/schema.prisma
npx prisma migrate deploy`}
        language="bash"
      />
      <p className="mt-2 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        Les modèles Prisma <code>AiConversation</code> et <code>AiMessage</code> sont créés par les migrations. <code>DATABASE_URL</code> doit être défini dans <code>.env</code>. Pour la liste des structures BDD et prérequis production par module, voir <code>docs/DATABASE.md</code> dans le dépôt.
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        2. Installer et lancer Ollama (modèle Qwen ou Mistral)
      </h3>
      <CodeBlock
        code={`# Installer Ollama : https://ollama.com/download

# Lancer le serveur et télécharger le modèle :
ollama serve
ollama pull qwen3:8b

# Optionnel — autre modèle :
ollama pull mistral:7b`}
        language="bash"
      />
      <p className="mt-2 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        Par défaut, l&apos;app utilise <code>AI_SERVER_URL=http://localhost:11434</code>. En dev sans serveur, définir <code>AI_MOCK=true</code> pour des réponses mockées.
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        3. (Optionnel) Claude (Anthropic)
      </h3>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        Pour utiliser Claude comme provider, définir <code>ANTHROPIC_API_KEY</code> dans <code>.env</code>. L&apos;API chat détecte le provider demandé (vllm, qwen, mistral, claude) et appelle soit Ollama soit Anthropic.
      </p>

      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Résumé des commandes (installer le module IA et toutes les dépendances)
      </h3>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        Enchaînement complet pour avoir l&apos;assistant IA opérationnel (app + base + Ollama + modèle) :
      </p>
      <CodeBlock
        code={`# 1. Dépendances Node et schéma Prisma
npm install
npx prisma generate --schema=prisma/schema.prisma

# 2. Base PostgreSQL
npx prisma migrate deploy

# 3. Serveur Ollama (terminal dédié ou arrière-plan)
ollama serve
ollama pull qwen3:8b

# 4. Lancer l&apos;app
npm run dev

# 5. Ouvrir l&apos;assistant IA
# http://localhost:3000/modules/ia`}
        language="bash"
      />
      <p className="mt-2 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        Définir dans <code>.env</code> : <code>DATABASE_URL</code>, <code>NEXTAUTH_SECRET</code>, <code>NEXTAUTH_URL</code>, <code>AI_SERVER_URL</code> (ex. <code>http://localhost:11434</code>), <code>AI_MODEL</code> (ex. <code>qwen3:8b</code>). Sans Ollama : <code>AI_MOCK=true</code> pour des réponses simulées.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Comment choisir le modèle
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        L&apos;assistant peut utiliser plusieurs <strong>providers</strong>. Le choix se fait dans l&apos;interface (sélecteur de modèle) et/ou via les variables d&apos;environnement.
      </p>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><strong>Ollama (Qwen, Mistral)</strong> : par défaut, l&apos;app utilise le modèle configuré dans <code>AI_MODEL</code> (ex. <code>qwen3:8b</code>). Pour Qwen et Mistral spécifiquement, vous pouvez définir <code>AI_MODEL_QWEN</code> et <code>AI_MODEL_MISTRAL</code>. Téléchargez le modèle avec <code>ollama pull qwen3:8b</code> ou <code>ollama pull mistral:7b</code>, puis sélectionnez le provider correspondant dans l&apos;UI.</li>
        <li><strong>Claude (Anthropic)</strong> : définissez <code>ANTHROPIC_API_KEY</code> dans <code>.env</code>. Le provider « claude » devient disponible dans l&apos;assistant ; les requêtes sont envoyées à l&apos;API Anthropic au lieu d&apos;Ollama.</li>
        <li><strong>Mock</strong> : en développement sans serveur, <code>AI_MOCK=true</code> désactive les appels réels et renvoie une réponse factice (utile pour tester l&apos;UI).</li>
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Variables d&apos;environnement
      </h2>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><code>AI_SERVER_URL</code> — URL du serveur Ollama (ex. <code>http://localhost:11434</code> ou <code>http://vps:11434</code>).</li>
        <li><code>AI_MODEL</code> — Modèle Ollama par défaut (ex. <code>qwen3:8b</code>).</li>
        <li><code>AI_MODEL_QWEN</code>, <code>AI_MODEL_MISTRAL</code> — Override par provider si besoin.</li>
        <li><code>AI_MOCK</code> — <code>true</code> pour désactiver les appels réels et renvoyer des réponses mockées (dév).</li>
        <li><code>AI_TIMEOUT</code> — Délai max en secondes (ex. 120).</li>
        <li><code>AI_MAX_RETRIES</code> — Nombre de tentatives en cas d&apos;erreur réseau.</li>
        <li><code>ANTHROPIC_API_KEY</code> — Clé API Anthropic pour le provider Claude.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Gestion des $ dans l&apos;assistant (références aux modules)
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Dans le champ de saisie de l&apos;assistant IA, taper un <strong>$</strong> affiche une liste de <strong>suggestions de tokens</strong> (<code>$wiki</code>, <code>$doc</code>, <code>$metric</code>, etc.). Ces tokens servent à l&apos;<strong>autocomplétion</strong> : en sélectionnant un token, vous l&apos;insérez dans le message. Ils n&apos;injectent pas le contenu des modules à la place du $ ; ils rappellent quels types de données peuvent être inclus. Le <strong>contenu effectif</strong> (articles wiki, documents) est injecté dans le <strong>contexte</strong> envoyé au modèle lorsque les modules correspondants sont sélectionnés dans le panneau de contexte (Module Registry). En résumé : le $ permet de compléter rapidement une référence dans le texte ; la sélection des modules (Wiki, Documents) dans le panneau détermine ce qui est envoyé au modèle comme contexte.
      </p>
      <p className="mb-2 text-sm font-medium" style={{ color: "var(--bpm-text-primary)" }}>Comment utiliser le $ dans l&apos;assistant :</p>
      <ol className="list-decimal pl-6 mb-4 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        <li>Ouvrez l&apos;assistant IA (page <code>/modules/ia</code>).</li>
        <li>Dans le panneau de contexte, cochez les modules dont vous voulez inclure le contenu (ex. Wiki, Documents) ; le texte de contexte sera construit et envoyé avec votre message.</li>
        <li>Dans la zone de saisie, tapez <strong>$</strong> : une liste de tokens s&apos;affiche (<code>$wiki</code>, <code>$doc</code>, <code>$metric</code>, etc.). Sélectionnez un token pour l&apos;insérer dans votre message (ex. « Résume $wiki »).</li>
        <li>Le token <code>$wiki</code> (ou autre) dans le message est un rappel ; le contenu réel des articles ou documents est ajouté au contexte grâce aux cases cochées dans le panneau. Envoyez le message ; l&apos;IA répond en s&apos;appuyant sur le contexte fourni.</li>
      </ol>
      <p className="mb-2 text-sm font-medium" style={{ color: "var(--bpm-text-primary)" }}>Tokens disponibles :</p>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><code>$wiki</code> — Wiki (articles).</li>
        <li><code>$doc</code> — Documents (analyses, contrats).</li>
        <li><code>$metric</code> — Métriques (dashboard).</li>
        <li><code>$table</code>, <code>$chart</code>, <code>$data</code> — Références données (étendues possibles).</li>
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Où sont sauvegardées les conversations
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Les conversations sont stockées <strong>en base PostgreSQL</strong> : table <code>AiConversation</code> (id, userId, preview, createdAt, updatedAt) et table <code>AiMessage</code> (id, conversationId, userMessage, aiResponse, providerName, createdAt). Chaque tour de dialogue est enregistré après la fin du streaming. L&apos;historique est chargé via <code>GET /api/ai/conversations</code> et affiché dans le panneau latéral ; une discussion peut être supprimée via <code>DELETE /api/ai/conversations/[id]</code>.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        API du module IA (résumé)
      </h2>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><code>POST /api/ai/chat</code> — Envoyer un message et recevoir un stream de réponses. Body : <code>message</code>, <code>provider_name</code> (vllm, qwen, mistral, claude), <code>conversation_history</code>, <code>discussion_id</code>, <code>context_from_modules</code> (texte construit côté client depuis le module registry). Réponse : SSE avec <code>type: chunk | done | error</code>, <code>discussion_id</code> dans done.</li>
        <li><code>GET /api/ai/conversations</code> — Liste des conversations de l&apos;utilisateur (preview, messages).</li>
        <li><code>POST /api/ai/conversations</code> — Créer une nouvelle conversation (retourne l&apos;id).</li>
        <li><code>DELETE /api/ai/conversations/[id]</code> — Supprimer une conversation.</li>
        <li><code>GET /api/ai/conversations/[id]/messages</code> — Détail des messages d&apos;une conversation (si exposé).</li>
        <li><code>GET /api/ai/health</code> — Santé du serveur Ollama (disponibilité, latence).</li>
        <li><code>GET /api/ai/providers</code> — Liste des providers (vllm, qwen, mistral, claude, etc.) et indicateur de configuration (ex. ANTHROPIC_API_KEY pour Claude).</li>
        <li><code>POST /api/wiki/transcribe</code> — Transcription vocale (Whisper). Utilisée par le bouton Micro de la zone de saisie IA et par le Wiki (nouvel article par dictée). Body : <code>multipart/form-data</code> avec champ <code>audio</code> (fichier webm/mp4). Réponse : <code>&#123; transcription: string &#125;</code>. Prérequis : micro-service Whisper démarré (ex. port 9000, variable <code>WHISPER_SERVICE_URL</code> dans <code>.env</code>).</li>
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Exemple d&apos;appel côté client (contexte modules)
      </h2>
      <CodeBlock
        code={`// Le composant AIChat récupère le contexte des modules sélectionnés puis appelle l'API :
const moduleIds = moduleRegistry.getAllModules().map((m) => m.moduleId);
const { text: contextFromModules } = await moduleRegistry.buildContext(moduleIds);

const res = await fetch("/api/ai/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    message: userMessage,
    provider_name: "vllm",
    conversation_history: recentMessages,
    discussion_id: currentDiscussionId ?? undefined,
    context_from_modules: contextFromModules?.trim() || undefined,
  }),
  credentials: "include",
});`}
        language="typescript"
      />

      <nav className="doc-pagination mt-10">
        <Link href="/modules/ia" className="text-sm font-medium" style={{ color: "var(--bpm-accent-cyan)" }}>
          ← Retour au module IA
        </Link>
        <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          Documentation externe :{" "}
          <a
            href="https://docs.blueprint-modular.com/modules/ia.html"
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
