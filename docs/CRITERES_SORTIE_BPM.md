# Critères de sortie — Blueprint Modular (matrice 89 composants)

## BPM_API.md (blueprint-maker)

- **BPM_API.md** : **≥ 89 sections utiles** (composants principaux + alias documentés).
- Validation : `grep "^## bpm\." lib/generator/BPM_API.md | wc -l` → **102** (89 + 13 alias) = couverture maximale pour le LLM.
- Chaque section alias doit être autonome : blockquote « Alias de bpm.xxx — même composant, même interface » + interface résumée (pas de renvoi implicite).

## llms.txt (blueprint-modular)

- **llms.txt** : nombre de sections **≥ nombre de composants dans le barrel** (packages/core/src/bpm.tsx).
- Validation : `grep "^## bpm\." public/llms.txt | wc -l` doit être égal au nombre d’entrées du barrel (**98** : `page`, `title`, `chat`, `metricRow` + clés `wrap`/`wrap<>` + `spinner` + `tabs`).
- Génération : `python scripts/generate-llms-txt.py` — source de vérité = barrel (plus d’exclusion globale).

## Build & déploiement

- `npm run build` (packages/core et app) : zéro erreur TypeScript.
- @blueprint-modular/core publié sur npm (version bump selon release).
- Déploiements bpm-prod : blueprint-app et blueprint-maker online.

## Génération Maker

- Génération test Claude : 0 violation bloquante.
- Prop `icon` (pageLayout) : valeurs Material Symbols snake_case uniquement, jamais d’emojis.
