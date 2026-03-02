# Cursor BPM — Suivi des prompts Phase 0, Phase 1 & Phase 2

Suivi des fondations architecturales (Phase 0), du use case IA (Phase 1) et de l’App Builder (Phase 2).

---

## Phase 0 — Fondations architecturales (9 prompts)

| # | Prompt | Statut | Note |
|---|--------|--------|------|
| 1 | Provider IA abstrait (lib/ai/providers, Ollama/Claude/OpenAI/BYOK) | ✅ | Factory, chat/health utilisent le provider |
| 2 | Context Provider pour l'IA (lib/ai/context, pageContext, enregistrement composants) | ✅ | Types, registry, hooks ; chat accepte page_context |
| 3 | Séparation Assistant vs Builder (lib/ai/assistant, lib/ai/builder) | ✅ | mode assistant/builder dans chat ; sandbox/generate → BuilderAI |
| 4 | lib/compute (calculs métier, getComputeTools, intégration assistant prompts) | ✅ | types, registry, industrial, financial, quality ; pas de __tests__/compute (optionnel) |
| 5 | Multi-tenant Prisma (Organization, OrgMember, Workspace, GeneratedApp) | ✅ | lib/auth/organization, seed-organizations |
| 6 | Offline Resilience (lib/offline, OfflineIndicator, useOfflineForm, sw.js) | ✅ | idb-keyval, endpoint dans OfflineEntry, SW enrichi |
| 7 | Parser Sandbox complet (fallback inconnu, skeleton variant, highlightbox, text, grid, column, daterangepicker, timeinput, selectbox options) | ✅ | Complétions ciblées demandées |
| 8 | lib/export (types, PreviewManager, AppPackager, routes 501) | ✅ | GeneratedApp déjà en schéma (Prompt 5) ; pas recréé |
| 9 | Export données doc pour docs.blueprint-modular.com (lib/docs/components, API GET /api/docs/components) | ✅ | Version minimale : API publique + 20 composants |

---

## Phase 1 — Use case IA ✅

| # | Prompt | Statut | Note |
|---|--------|--------|------|
| 1 | Schéma + seed données production (ProductionLine, ProductionSession, ProductionAlert) | ✅ | seed:production, org par défaut |
| 2 | Routes API production (lines, lines/[id], metrics, alerts, sessions) | ✅ | lib/compute pour calculs, assertOrganizationAccess |
| 3 | System prompt Builder production + template + generateFromTemplate | ✅ | prompts.ts, production-dashboard.ts |
| 4 | Dashboard Sandbox + démo publique (/demo/production, unstable_cache) | ✅ | Bouton « Charger exemple Production », isProduction → generateFromTemplate ; /api/demo/screenshot 501 |
| 5 | Assistant contextuel (bpmComponentRegistry.buildSystemPromptContext, chips, DEMO_ANSWERS) | ✅ | AssistantPanel, trackContext Metric/Table sandbox |

**Checklist validation prod** : `git pull` → `npx prisma migrate deploy` → `npm run seed:production` → `pm2 restart blueprint-app`. Tester : `/demo/production` (sans login), Sandbox « Charger exemple Production » + « Générer », `/api/production/metrics`, `/api/demo/screenshot` (501).

---

## Phase 2 — App Builder 🔄

- **En cours** : App Builder (génération d’apps à partir des templates et du contexte production).

---

## Historique

| Date | Événement |
|------|-----------|
| 2025-03-01 | Phase 0 complète — 9 fondations architecturales. Tag `phase-0-complete`. Migration `add_multitenant` et seed-organizations à lancer en local quand la base est disponible. |
| 2025-02-27 | Phase 1 complète — dashboard production, API production, Builder template, démo publique, assistant contextuel. Tag `phase-1-complete`. |
