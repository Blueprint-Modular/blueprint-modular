# Diagnostic: Builder → CSS Pipeline (Palette Designer)

**Date:** 2026-05-10  
**Branche:** claude/slack-session-AgqhU  
**Contexte:** Suite au diagnostic PR #55 qui a établi que le LLM reçoit un brief partiel mais PAS les hex codes  

---

## ALERTE: REPO INCOMPATIBLE

Ce diagnostic a été exécuté sur le repo **blueprint-modular** mais la mission ciblait le repo **blueprint-maker**.

### Preuve de l'incompatibilité

| Élément attendu (blueprint-maker) | Présent dans blueprint-modular |
|----------------------------------|-------------------------------|
| PR #55 (diag-designer-llm-input) | Non (3 PRs total) |
| `lib/design/designer-database.json` | Non |
| `lib/design/designer-resolver.ts` | Non |
| `resolveBaseDesignLanguage()` | Non |
| `designLanguageToDesignerColorPalette()` | Non |
| `designerPaletteToCssTokens()` | Non |
| `isBlueprintFactoryDefaultBrandKitData()` | Non |
| Variables `--bpm-dl-*` | Non (utilise `--bpm-*`) |
| `spec-prompt.ts` 500+ lignes | Non (35 lignes) |
| Designers (Rams, Eames, Saarinen) | Non |

### Structure réelle de blueprint-modular

```
Remote: Blueprint-Master/blueprint-modular
PRs: 3 (#1 docs JSDoc, #2 JSDoc batch 2, #3 missing components)
```

**lib/ai/builder/** contient:
- `index.ts` (120 lignes) - BuilderAI class simple
- `spec-prompt.ts` (35 lignes) - Prompt statique pour génération de spec JSON
- `prompts.ts` - Templates de prompts
- `spec.ts` - Validation de spec
- `templates/` - Templates de domaine (production)

Ce repo génère des apps BPM (composants métier) mais **sans système de designers**.

---

## 7.1 Chaîne tracée

| Étape | Fichier:ligne | Donnée d'entrée | Donnée de sortie | Statut |
|-------|---------------|-----------------|------------------|--------|
| resolve | N/A | N/A | N/A | **N/A** |
| palette → CSS | N/A | N/A | N/A | **N/A** |
| globals.css | `app/globals.css:27` | Variables statiques | Variables `--bpm-*` hardcodées | **DIFFÉRENT** |
| packager | N/A | N/A | N/A | **N/A** |
| bpm components | `frontend/bpm/*.css` | `var(--accent-color)` | Fallbacks hardcodés | **OK** |

### Ce qui existe dans blueprint-modular

**globals.css** définit des variables statiques:
```css
:root {
  --bpm-accent: #048dc3;
  --bpm-surface: #ffffff;
  --bpm-text-primary: #333;
  /* ... */
}
```

**Composants frontend/bpm/*.css** utilisent:
```css
var(--accent-color, #A49B6D)  /* avec fallback hardcodé */
var(--accent, #00A3E0)
```

**Pas de système de designer** - les couleurs sont statiques.

---

## 7.2 Point de rupture (E1-E7)

**VERDICT: NON APPLICABLE**

Le code décrit dans la mission (resolveBaseDesignLanguage, designLanguageToDesignerColorPalette, etc.) n'existe pas dans ce repo.

Ce repo (blueprint-modular) est un système de composants BPM générique sans personnalisation par designer.

---

## 7.3 Comparaison avec isBlueprintFactoryDefaultBrandKitData

**Non applicable** - Cette fonction n'existe pas dans ce repo.

```bash
grep -rn "isBlueprintFactoryDefaultBrandKitData" . --include="*.ts"
# Résultat: 0 matches
```

---

## 7.4 Fix conceptuel

**Aucun fix possible dans ce repo.**

Pour exécuter la mission correctement:
1. Identifier le repo blueprint-maker (différent de blueprint-modular)
2. Cloner ce repo
3. Ré-exécuter la mission

---

## 7.5 Prompt Claude Code pour action corrective

```
@Claude identifie et clone le repo blueprint-maker (pas blueprint-modular).

CONTEXTE
La mission de diagnostic de la chaîne builder→CSS (palette designer)
a été lancée sur le mauvais repo. Le repo blueprint-modular ne contient
pas le code de génération d'apps avec designers.

PHASE 1 — IDENTIFIER LE BON REPO
Le repo blueprint-maker contient:
- lib/design/designer-database.json (données designers: Rams, Eames, etc.)
- lib/design/designer-resolver.ts
- lib/generator/spec-prompt.ts (500+ lignes)
- Fonctions resolveBaseDesignLanguage, designLanguageToDesignerColorPalette
- PR #55 (diag-designer-llm-input-2026-05-10.md)

PHASE 2 — RE-EXÉCUTER
Une fois le bon repo identifié, ré-exécuter la mission de diagnostic
de la chaîne POST-LLM pour tracer comment la palette designer arrive
(ou se perd) jusqu'au globals.css.

LIVRAISON
- Confirmer le nom et URL du repo blueprint-maker
- Ou identifier si blueprint-maker est un sous-module/workspace
```

---

## Annexe: Recherches effectuées

### Recherche resolveBaseDesignLanguage
```bash
grep -rn "resolveBaseDesignLanguage" lib/ --include="*.ts"
# Résultat: 0 matches
```

### Recherche designLanguageToDesignerColorPalette
```bash
grep -rn "designLanguageToDesignerColorPalette" lib/ --include="*.ts"
# Résultat: 0 matches
```

### Recherche designer-database
```bash
find . -name "*designer*" -o -name "*design-language*"
# Résultat: 0 matches
```

### Recherche variables --bpm-dl-*
```bash
grep -rn "bpm-dl-\|--bpm-dl" lib/ --include="*.ts" --include="*.css"
# Résultat: 0 matches
```

### Structure lib/ai/builder/
```
lib/ai/builder/
├── index.ts (BuilderAI class)
├── prompts.ts
├── spec-prompt.ts (35 lignes, prompt statique)
├── spec.ts
└── templates/
    └── production-dashboard.ts
```

---

## Résumé

| Métrique | Valeur |
|----------|--------|
| Build | ❌ (next not found - no node_modules) |
| resolveBaseDesignLanguage call sites | 0 |
| Sites qui écrivent globals.css | 1 (statique, pas de designer) |
| Sites protégés par isBlueprintFactoryDefaultBrandKitData | N/A |
| VERDICT | **REPO INCOMPATIBLE** |
| Fix conceptuel | Identifier et utiliser le repo blueprint-maker |
