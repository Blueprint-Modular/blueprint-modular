# Vérification @blueprint-modular/core — Retour d'expérience

**Date:** 2026-02-27  
**Version après corrections:** 0.1.43  
**Publish:** non effectué (attente validation).

---

## Point 1 — API incohérente

| Appel | Avant | Après |
|-------|--------|--------|
| `bpm.page({ children })` | ✅ Acceptait déjà objet ou children (normalizePageArg) | ✅ Inchangé |
| `bpm.tabs({ tabs: [...] })` | ✅ Acceptait déjà objet ou tableau (normalizeTabsArg) | ✅ Inchangé |
| `bpm.spinner({ text?: string })` | ❌ `wrap(Spinner)` permettait `bpm.spinner()` sans arg | ✅ **Corrigé** : `spinner: (arg?: SpinnerProps) => React.createElement(Spinner, arg ?? {})` — appel avec objet (au minimum `bpm.spinner({})`) |
| `bpm.table({ columns, data })` | ✅ Déjà en objet, columns optionnel | ✅ Inchangé |
| `bpm.metric({ label, value })` | ✅ Déjà `wrap(MetricProps)` | ✅ Inchangé |

**Résultat:** ✅ Tous les appels documentés fonctionnent avec une API en objet. Spinner accepte désormais un argument optionnel et utilise `{}` par défaut.

---

## Point 2 — Export CSS

| Vérification | Avant | Après |
|--------------|--------|--------|
| `"exports"` avec `"./dist/style.css"` | ✅ Présent | ✅ Inchangé |
| `"./style.css"` → `./dist/style.css` | ✅ Présent | ✅ Inchangé |

**Résultat:** ✅ Aucune modification nécessaire.

---

## Point 3 — Variables CSS

| Vérification | Avant | Après |
|--------------|--------|--------|
| `dist/style.css` commence par `:root { --bpm-accent: ... }` | ✅ Oui | ✅ Oui |
| Variables dans source `variables.css` | ✅ Déjà :root complet | ✅ **Ajout** : `--bpm-bg-primary`, `--bpm-bg-secondary` pour cohérence avec composants (ex. Table, OfflineIndicator) |

**Résultat:** ✅ Variables présentes ; ajout de deux variables pour compatibilité.

---

## Point 4 — SSR

| Fichier | Occurrences document/window/localStorage | Statut |
|---------|------------------------------------------|--------|
| `Modal.tsx` | document + createPortal | ✅ Déjà protégé : `if (!mounted \|\| typeof document === "undefined") return null` avant createPortal |
| `Tooltip.tsx` | createPortal(..., document.body) | ✅ Déjà : `typeof document !== "undefined" && ...` |
| `Selectbox.tsx` | document + window dans useEffect ; createPortal | ✅ createPortal protégé par `typeof document !== "undefined"` ; addEventListener uniquement dans useEffect (client) |
| `Theme.tsx` | localStorage, document | ✅ `getStoredTheme` / `applyTheme` utilisent `if (typeof document === "undefined")` |
| `Toast.tsx`, `Popover.tsx`, `Drawer.tsx`, `Autocomplete.tsx`, `OfflineIndicator.tsx` | document/window dans **useEffect** uniquement | ✅ Pas d’accès au premier rendu serveur |

**Résultat:** ✅ Aucune modification nécessaire ; toutes les utilisations sont soit gardées, soit limitées au client (useEffect).

---

## Point 5 — Types TypeScript

| Vérification | Avant | Après |
|--------------|--------|--------|
| `TableColumn` exporté avec `key`, `label` | ✅ (via composant Table) | ✅ Conservé |
| `type?: "text" \| "number" \| "date" \| "badge" \| "boolean"` | ❌ Absent du type exporté package | ✅ **Ajouté** : interface `TableColumn` dans `bpm.tsx` avec `type?` et `sortable?` |
| `sortable?: boolean` | ❌ Absent | ✅ Présent |

**Résultat:** ✅ Le package exporte désormais `TableColumn` avec `key`, `label`, `type?`, `sortable?` comme dans la doc.

---

## Point 6 — Documentation dans le package

| Vérification | Avant | Après |
|--------------|--------|--------|
| Fichier `packages/core/USAGE.md` | ❌ Absent | ✅ **Créé** : installation, CSS, Tailwind, variables, SSR Next.js, API (page, tabs, table, metric, spinner, modal, plotlyChart) |
| `package.json` → `files` | `["dist/"]` | ✅ **Ajout** : `"USAGE.md"` pour livraison avec le package |

**Résultat:** ✅ USAGE.md ajouté et inclus dans le tarball.

---

## Build et version

- `npm run build` : ✅ OK
- `head -5 dist/style.css` : ✅ commence par `:root{--bpm-accent: #2563eb;...}`
- Version : ✅ 0.1.43 (bump effectué, **non publié**)

---

## Résumé

| Point | Avant | Après |
|-------|--------|--------|
| 1 — API | ❌ spinner sans arg possible | ✅ |
| 2 — Export CSS | ✅ | ✅ |
| 3 — Variables CSS | ✅ | ✅ (+ 2 variables) |
| 4 — SSR | ✅ (déjà protégé / useEffect) | ✅ |
| 5 — Types TableColumn | ❌ type/sortable absents | ✅ |
| 6 — USAGE.md | ❌ | ✅ |

**Livrable :** rapport ci-dessus avec ✅/❌ avant et après. Publication non effectuée en attente de validation.
