# BLUEPRINT MISSION — Suivi en temps réel

Dernière mise à jour : 2026-02-22 — Déploiement prod + nettoyage effectués.

---

## ARCHITECTURE DÉCIDÉE

- **État actuel** : Next.js 14 (App Router) ajouté à la racine du repo (structure manuelle car create-next-app refuse un dossier non vide). Site statique `frontend/static/` et package Python `bpm/` conservés.
- **Stack** : Next.js 14, TypeScript, Tailwind, NextAuth (Google), Prisma (PostgreSQL), design system BPM (variables CSS, data-theme dark/light).
- **Structure** : `app/`, `components/`, `lib/`, `prisma/`, `public/`, `middleware.ts`, `health-check.sh`.

---

## PHASE EN COURS

Aucune. **Prochaine priorité** : Gestion des droits owner/admin/user sur chaque module (Phase 3, optionnel). TOC / Pagefind / barre de progression lecture (Phase 4, optionnel).

---

## TÂCHES

### PHASE 1 — Fondations Next.js + Auth + Thème

- [x] Migration vers Next.js 14 (App Router)
- [x] Système de thème dark/light (data-theme, localStorage, toggle)
- [x] Auth : Google OAuth, JWT (Apple/X à configurer avec clés)
- [x] Sidebar (créée sur spec, collapsible desktop, barre mobile)
- [x] Design system BPM complet (variables CSS, dark mode)
- [x] Script health-check.sh
- [x] CHECKPOINT PHASE 1 : build propre

### PHASE 2 — Documentation exhaustive

- [x] 15 pages doc composants avec sandbox live (metric, button, panel, table, tabs, modal, toggle, message, spinner, selectbox, expander, tooltip, numberinput, title, codeblock)
- [x] Page index docs/components (grille par catégorie)
- [x] Page par module (Wiki, IA, Analyse Documents, Veille)
- [x] Getting Started wizard interactif (3 étapes)
- [x] Changelog avec versioning
- [x] Pages de connexion types (login, register, forgot password)
- [x] SEO : llms.txt, robots.txt, sitemap.ts, schema.org JSON-LD homepage
- [x] CHECKPOINT PHASE 2 : build propre, toutes les pages accessibles

### PHASE 3 — Modules fonctionnels

- [x] Module Wiki (CRUD, arborescence, search/published, [slug] Markdown, new + [slug]/edit, PUT/DELETE)
- [x] Module Analyse de Documents (upload PDF, pdf-parse + Claude, GET/DELETE [id], liste + détail, alertes 30j)
- [x] Module IA (AIChat, POST /api/ai/chat SSE Claude, conversations + messages)
- [x] Gestion des clés API (Paramètres > Clés API, chiffrement AES-256-GCM)
- [ ] Gestion des droits owner/admin/user sur chaque module (optionnel)
- [x] CHECKPOINT PHASE 3 : build propre, modules testables

### PHASE 4 — Polish & Corrections Audit

- [x] 404 stylée (BPM, lien accueil)
- [x] Pas de sélecteur de langue dans l’app Next (frontend/static conservé)
- [x] Liens Prev/Next sur pages doc composants
- [x] Burger mobile (Sidebar drawer)
- [x] Dark mode : blocs code lisibles (--bpm-code-bg, --bpm-code-border)
- [x] Bouton Copier dans CodeBlock
- [ ] TOC / recherche Pagefind / barre de progression lecture (optionnel)
- [x] Responsive (Sidebar mobile, layout app)
- [x] CHECKPOINT PHASE 4 : build propre, site impeccable

---

## DÉCISIONS D'ARCHITECTURE

- Next.js initialisé à la main (package.json, next.config, tsconfig, tailwind, app/, components/, lib/, prisma/) car create-next-app refuse un dossier non vide.
- useTheme() retourne une valeur par défaut si hors ThemeProvider pour éviter erreur au prerender.
- Middleware protège /dashboard, /docs, /modules, /settings (redirection vers /login si non authentifié).
- Auth : seul Google configuré ; Apple et X nécessitent des clés dans .env.local.

---

## BLOCAGES RENCONTRÉS

- Aucun pour l’instant. Module IA (Oliver) : pas d’accès au repo Portfolio Management ; Sidebar et flux auth créés sur la base du brief.

---

## FAIT (complété et vérifié)

- Création de `BLUEPRINT_MISSION.md` (Phase 0).
- Phase 1 : Next.js 14, thème dark/light, Auth (Google), Sidebar, design system BPM, health-check.sh, pages (auth + app), middleware, Prisma schema, API health + NextAuth. Build OK.
- SEO : public/llms.txt, public/robots.txt, app/sitemap.ts.
- Pages : /, /login, /register, /forgot-password, /dashboard, /docs, /docs/components, /docs/getting-started, /docs/changelog, /modules, /modules/wiki, /modules/wiki/new, /modules/wiki/[slug], /modules/ia, /modules/documents, /modules/veille, /settings, not-found.
- API : GET/POST /api/wiki, GET/PATCH/DELETE /api/wiki/[slug], GET /api/documents, POST /api/documents (upload), GET/POST /api/ai/conversations, GET/POST /api/ai/conversations/[id]/messages, GET/POST /api/settings/api-keys, DELETE /api/settings/api-keys/[id], /api/health, /api/auth/[...nextauth].
- Phase 2 : composants BPM (Metric, Button, Panel, CodeBlock), pages doc sandbox (metric, button, panel), Getting Started wizard (3 étapes), Changelog.
- Phase 3 : Wiki CRUD (liste, new, [slug], API complète), Documents (upload + liste), Module IA (conversations + messages, réponse placeholder), Paramètres > Clés API (chiffrement AES-256-GCM via lib/encrypt.ts).
- Phase 4 : 404 stylée, Prev/Next doc, dark mode blocs code, avatar Sidebar en next/image, uploads/ dans .gitignore.
- Fichiers : .env.local.example, .eslintrc.json, health-check.sh, lib/encrypt.ts.
- **Phase 2 continuation** : 15 pages doc composants avec structure complète ; index docs/components en grille ; lib/docPages.ts ; styles highlight wiki. Wiki : API search/published, arborescence, [slug] Markdown, new/edit. Documents : pdf-parse + Claude, GET/DELETE [id], alertes 30j. IA : AIChat + /api/ai/chat SSE. CSS global (--bpm-*).
- **Déploiement production** : Vercel (`npm run deploy` / `npx vercel --prod --yes`), URL https://blueprint-modular.vercel.app. Variables d’env à configurer dans le projet Vercel (DATABASE_URL, NEXTAUTH_*, GOOGLE_*, ANTHROPIC_API_KEY).
- **Nettoyage** : suppression dossier dupliqué `blueprint-modular/`, `BLUEPRINT_CURSOR_PROMPT_V2.md`, `AUDIT_STATUS.md` ; imports inutiles retirés (Link, useSession sur modules/documents) ; `blueprint-modular/` ajouté au .gitignore.
