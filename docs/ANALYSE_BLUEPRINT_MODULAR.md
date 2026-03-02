# ANALYSE BLUEPRINT MODULAR

Rapport d'analyse préliminaire (ÉTAPE 0) pour l'intégration de la couche IA et des modules Phase 1.

---

## Structure détectée

- **app/** — Next.js App Router (pages, layouts, API routes sous `app/api/`)
- **components/** — Composants React dont **bpm/** (design system), Sidebar, AIChat, ThemeProvider, AuthProvider
- **lib/** — auth.ts, prisma.ts, utilitaires
- **prisma/** — Schéma PostgreSQL, migrations
- **frontend/** — Doc statique (HTML), i18n
- **contexts/** — NotificationHistoryContext, etc.
- **bpm/** — Package Python CLI (bpm run, bpm init), **pas** un serveur web
- **deploy/**, **scripts/** — Déploiement VPS

Pas de dossier `src/` : le code applicatif est dans `app/`, `components/`, `lib/`.

---

## Backend existant

**NON (pas de FastAPI).**

- **Backend réel** : **Next.js API Routes** (`app/api/`) + **Prisma** (PostgreSQL).
- Aucun `main.py`, `FastAPI`, `APIRouter` dans le repo.
- **bpm/** = CLI Python pour lancer des apps BPM, pas un serveur HTTP.

**API existantes** : `/api/auth/[...nextauth]`, `/api/health`, `/api/wiki`, `/api/wiki/[slug]`, `/api/documents`, `/api/documents/[id]`, `/api/ai/chat`, `/api/ai/conversations`, `/api/settings/api-keys`.

---

## Composants bpm.* trouvés

Tous sous **components/bpm/** (TypeScript), exportés via **components/bpm/index.ts** :

Accordion, Avatar, Badge, Breadcrumb, Button, Card, Checkbox, Chip, CodeBlock, ColorPicker, Column, DateInput, Divider, EmptyState, Expander, Grid, HighlightBox, Input, Message, Metric, Modal, Markdown, NumberInput, Panel, Progress, RadioGroup, Selectbox, Skeleton, Slider, Spinner, Stepper, Table, Tabs, Textarea, Theme, Title, Toast, Toggle, Tooltip.

**Convention** : utilisation via `import { Panel, Table, ... } from "@/components/bpm"` ; pas de préfixe `bpm.` dans le code (c’est la notation doc Python).

---

## Pattern de données

- **Client** : `fetch()` vers `app/api/*`.
- **Serveur** : routes API utilisent **getServerSession(authOptions)** puis **Prisma** pour lire/écrire.
- **Wiki** : GET/PUT/DELETE `/api/wiki`, `/api/wiki/[slug]` → modèle Prisma `WikiArticle`.
- **Documents** : GET/POST/DELETE `/api/documents`, `/api/documents/[id]` → modèle Prisma `Document`.
- **IA** : POST `/api/ai/chat` (stream SSE) → par défaut **Ollama** (Qwen3:8b) via `lib/ai/vllm-client.ts`, avec option de contexte modules ; **Anthropic** (Claude) disponible en fallback (`provider_name: "claude"`).
- Pas de store global type Redux ; état local + contexte (NotificationHistory, Theme).

---

## Routing

- **Next.js App Router** uniquement.
- **Zone app** : `app/(app)/` (dashboard, modules, settings, docs, sandbox) avec layout commun (Sidebar + AppLayoutClient).
- **Auth** : `app/(auth)/` (login, register, forgot-password).
- **Modules** : `app/(app)/modules/wiki`, `modules/documents`, `modules/ia`, etc.

---

## Points d'attention

1. **Pas de FastAPI** : tout reste dans Next.js (API routes + Prisma). Pas de création d’un backend Python séparé.
2. **Chat IA** : AIChat + `/api/ai/chat` utilisent par défaut **Ollama** (vllmClient) avec **contexte modules** (registry) ; Anthropic en option (`provider_name: "claude"`).
3. **Schéma Prisma** : `WikiArticle` (title, content, slug, parentId, authorId, isPublished) ; `Document` (filename, analysisStatus, supplier, client, dates, summary, keyPoints, commitments, rawText). Le prompt Phase 1 prévoit un modèle **Contract** plus riche (workspace, contract_type, extracted_data JSON) et un **Wiki** avec category, tags, summary, ai_generated, workspace. À étendre via migrations.
4. **Workspace** : production / BEAM demandés dans le prompt ; aucun champ `workspace` actuellement dans Prisma. À ajouter où nécessaire (Contract, Wiki si partagé).
5. **Conventions UI** : tout en **bpm.*** (composants existants), **français**, responsive. Pas de librairies UI externes.
6. **Auth** : NextAuth en place ; session utilisée dans les API. Pas de rôles par workspace dans le schéma actuel.

---

## Décisions pour la Phase 1

- **Client IA** : **lib/ai/** contient `vllm-client` (Ollama), `config`, `module-registry`, `context-builder`, `prompt-templates`, `contract-analyzer`. Pas de `src/` ; tout est sous **lib/** et **components/**.
- **Assistant contextuel** : étendre **AIChat** ou ajouter un panneau **AIAssistant** (sélecteur de modules, envoi du contexte au chat). Utiliser uniquement les composants bpm.*.
- **Contrats** : modèle Prisma **Contract** avec champs requis + `extracted_data` JSON ; routes `/api/contracts/*` ; analyse IA côté serveur via **lib/ai/contract-analyzer.ts** (Ollama).
- **Wiki** : étendre **WikiArticle** (category, tags, summary, ai_generated, workspace) ; route POST `/api/wiki/generate` (stream) ; composant **WikiAIGenerator** dans le module wiki existant.
- **Ollama** : variable d’env `AI_SERVER_URL` ; en dev, mock si `AI_MOCK=true`. Modèle : `AI_MODEL` (ex. `qwen3:8b`).

Ce rapport valide le démarrage du développement Phase 1.

