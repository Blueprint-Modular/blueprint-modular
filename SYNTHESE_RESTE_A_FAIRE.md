# Synthèse — Ce qu’il reste à faire (Blueprint Modular)

Document généré à partir de :  
`CURSOR_PROMPT_AI_STRATEGY.md`, `CURSOR_PROMPT_SANDBOX_AI_GENERATOR.md`, `CURSOR_PROMPT_BLUEPRINT_AI.md`, `BLUEPRINT_MISSION.md`, `CURSOR_PROMPT_OLLAMA_MIGRATION.md`.

---

## 1. Stratégie IA (CURSOR_PROMPT_AI_STRATEGY.md)

### 1.1 Prompts et templates

- **Enrichir `lib/ai/prompt-templates.ts`**  
  Remplacer `SYSTEM_PROMPT_BASE` par la version orientée métier (français, « le LLM commente, jamais il ne calcule »).  
  Ajouter ou aligner les templates :  
  `SYSTEM_PROMPT_WITH_CONTEXT`, `TEMPLATE_ANALYSE_DONNEES`, `TEMPLATE_ANALYSE_CONTRAT`, `TEMPLATE_WIKI_GENERATION`, `TEMPLATE_SYNTHESE_STRATEGIQUE`.

### 1.2 Analyse contractuelle

- **Renforcer `lib/ai/contract-analyzer.ts`**  
  - Utiliser `TEMPLATE_ANALYSE_CONTRAT` depuis `prompt-templates.ts`.  
  - Appeler `vllmClient.chat()` (sans stream) pour le JSON.  
  - Parser la réponse avec une fonction du type `extractJSON()` (premier `{` / dernier `}`), puis `JSON.parse()`.  
  - Valider au minimum `executive_summary` et `overall_risk_level`.  
  - Retourner un objet partiel si certains champs manquent (ne pas faire planter l’app).  
- **Séparation des workspaces**  
  S’assurer que toutes les requêtes contrats filtrent par `workspace` (production / beam) et ne renvoient jamais les données d’un autre workspace.

### 1.3 Wiki IA

- **Fait.** `POST /api/wiki/generate` en place : body `{ notes, articleType, workspace }` (génération depuis notes) ou `{ action: "format", content, title? }` (mise en forme). Stream SSE, pas de sauvegarde auto. Page d’édition wiki : bouton « Aide IA » (mettre en forme le contenu actuel, générer un article depuis des notes). Module IA : contenu des articles récents exposé en contexte (`/api/wiki?withContent=true`). **Transcription vocale** : micro-service Whisper (faster-whisper sur le VPS, port 9000), route `POST /api/wiki/transcribe`, composant `VoiceRecorder` ; intégré dans Wiki (nouvel article, dictée → transcription → génération) et Assistant IA (bouton Dicter).

### 1.4 Règles à respecter (rappel)

- Pas de calcul dans les prompts ; tout calcul en TypeScript (`context-builder.ts`).  
- Pas de dépendances IA type langchain/openai.  
- Ne pas modifier `vllm-client.ts` ni `config.ts` pour cette phase.  
- Timeout adapté CPU (ex. `AI_TIMEOUT=120`), messages d’erreur sans exposer l’URL interne du VPS.

---

## 2. Sandbox générateur IA (CURSOR_PROMPT_SANDBOX_AI_GENERATOR.md)

- **Déjà en place** : route `app/api/sandbox/generate/route.ts`, mode « Par IA » dans la Sandbox, stream SSE, bascule vers « Par code » en fin de génération.  
- **À vérifier** : test de validation avec une description type « Un dashboard financier avec le chiffre d’affaires, le taux de marge, un graphique de ventes mensuelles et un indicateur de statut » → le code généré doit être du `bpm.*` valide (title, metric, barchart, statusbox, etc.) et s’afficher correctement dans l’aperçu.  
- **Reste à faire** : aucun développement supplémentaire imposé par ce prompt si le comportement ci‑dessus est validé.

---

## 3. Couche IA Phase 1 (CURSOR_PROMPT_BLUEPRINT_AI.md)

Ce document décrit la cible « une nuit » (assistant, contrats, wiki). Une partie est déjà couverte par l’existant Next.js (API sous `app/api/`, pas de backend FastAPI séparé). Reste à aligner avec les critères de succès :

- [ ] **Assistant** : répond à « quels modules sont disponibles ? » et à des questions sur les données d’un module enregistré (contexte bien injecté).  
- [ ] **Contrats** : upload PDF → analyse déclenchée (mock ou Ollama) ; liste avec filtres production / BEAM strictement séparés.  
- [x] **Wiki** : création manuelle d’articles ; génération depuis notes brutes (`POST /api/wiki/generate`) ; mise en forme IA sur l’édition ; transcription vocale (Whisper) sur nouvel article et assistant IA.  
- [ ] **Aucune dépendance** vers OpenAI / ChatGPT / service cloud IA (Ollama local uniquement pour cette phase).

Points d’attention issus du doc :  
- Utiliser uniquement les composants `bpm.*` pour l’UI.  
- Séparation stricte des workspaces (production / BEAM).  
- Mocks de dev pour analyse de contrat et génération wiki si besoin.

---

## 4. Mission et phases (BLUEPRINT_MISSION.md)

### Optionnel — Phase 3

- [ ] **Gestion des droits owner / admin / user par module** (optionnel).

### Optionnel — Phase 4

- [ ] **TOC (table des matières)** sur les pages doc.  
- [ ] **Recherche Pagefind** (ou équivalent) sur la doc.  
- [ ] **Barre de progression de lecture** (optionnel).

---

## 5. Migration Ollama (CURSOR_PROMPT_OLLAMA_MIGRATION.md)

- **Statut** : procédure de migration vLLM → Ollama (config, `vllm-client`, `.env`).  
- **Reste à faire** : rien de plus si la migration est déjà effectuée et que les vérifications passent (health check, chat simple, interface avec modèle « qwen3:8b »).  
- **À ne pas modifier** (rappels du doc) : `app/api/ai/chat/route.ts`, `app/api/ai/health/route.ts`, `AIAssistant.tsx`, `prompt-templates.ts`, `context-builder.ts`, `module-registry.ts`.

---

## Récapitulatif priorisé

| Priorité | Domaine            | Action |
|----------|--------------------|--------|
| Haute    | IA — Prompts       | Enrichir `prompt-templates.ts` (SYSTEM_PROMPT_BASE + templates analyse données, contrat, wiki, synthèse). |
| Haute    | IA — Contrats      | Robustifier `contract-analyzer.ts` (extractJSON, TEMPLATE_ANALYSE_CONTRAT, validation, réponses partielles). |
| —        | IA — Wiki          | Fait : `POST /api/wiki/generate` (stream, génération + mise en forme), Aide IA sur édition, contenu wiki dans le module IA ; transcription vocale Whisper (VoiceRecorder, `/api/wiki/transcribe`) sur nouvel article et assistant IA. |
| Moyenne  | Données / Sécurité | Vérifier filtrage workspace (production/beam) sur toutes les API contrats et wiki. |
| Moyenne  | Validation         | Tester assistant (modules disponibles + questions sur données) et sandbox « Par IA » (dashboard financier). |
| Optionnel| Mission            | Droits owner/admin/user par module ; TOC / Pagefind / barre de lecture. |

---

*Dernière mise à jour : 2026-02-24 — Auth : doc modèles (split actuel, LoginPage/RegisterPage/AuthSplitLayout, AuthForm.module.css). Wiki : transcription vocale Whisper (VoiceRecorder, /api/wiki/transcribe). Synthèse : Whisper + vocal Wiki/IA ajouté au récap.*
