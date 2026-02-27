# Plan : CSS unique, nommage composants, doc structures BDD

Ce document décrit les trois prochaines étapes pour structurer l’application et la documentation afin que : (1) le CSS modifiable soit géré à un seul endroit, (2) une base unique de noms de composants permette à l’IA de retrouver les bons éléments, (3) la documentation expose les structures de BDD nécessaires en production.

---

## 1. CSS géré à un seul endroit (éléments modifiables)

### État actuel

- **App Next.js** : un seul point d’entrée CSS → `app/globals.css` (importé dans `app/layout.tsx`). Ce fichier contient :
  - Tailwind (`@tailwind base/components/utilities`)
  - Variables CSS (tokens) `:root` et `[data-theme="dark"]` (couleurs, espacements, bordures)
  - Règles par composant BPM (`.bpm-skeleton`, `.bpm-input`, `.bpm-table`, etc.)
  - Règles par page / module (`.documents-page`, `.contracts-page`, `.asset-manager-page`)
- **Frontend statique** (vitrine / doc HTML) : `frontend/bpm/theme.css` et nombreux `frontend/bpm/*.css` (Table.css, Button.css, etc.) — **non utilisés par l’app Next.js**.
- **Composants** : quelques CSS dédiés (`components/bpm/Transition.css`, `LoadingBar.css`, etc.) importés par les composants ; le reste est en `globals.css` ou en classes Tailwind/inline.

### Objectif

- **Une seule source de vérité pour les éléments modifiables** (thème, composants BPM) dans l’app :
  - Tokens (couleurs, espacements, radius) → un seul bloc dans `globals.css` (déjà le cas) ou fichier dédié `app/styles/tokens.css` importé une fois.
  - Classes de composants BPM (`.bpm-input`, `.bpm-table-wrapper`, etc.) → toutes dans `globals.css` (ou un seul fichier `app/styles/bpm-components.css` importé après les tokens), sans doublon avec `frontend/`.
- **Convention** : documenter dans `docs/DESIGN_SYSTEM.md` que, pour l’app Next.js, tout style modifiable (thème, variantes de composants) se trouve dans `app/globals.css` (ou les fichiers listés dans ce doc). Ne pas ajouter de feuilles de style dispersées par composant sans les référencer.

### Actions proposées

| Action | Priorité | Détail |
|--------|----------|--------|
| Centraliser les tokens | Moyenne | Garder `:root` et `[data-theme="dark"]` dans `globals.css` ; ajouter en en-tête du fichier un commentaire « Source unique des variables modifiables pour l’app » et un lien vers `docs/DESIGN_SYSTEM.md`. |
| Documenter le périmètre CSS | Haute | Mettre à jour `docs/DESIGN_SYSTEM.md` : préciser que `app/globals.css` est la source unique pour l’app ; lister les sections (tokens, BPM, pages) ; indiquer que `frontend/bpm/*.css` sert uniquement la vitrine statique. |
| Éviter les doublons | Moyenne | Lors d’ajouts de styles BPM, les mettre dans `globals.css` (section dédiée `.bpm-*`) plutôt que dans un nouveau `.css` par composant. |
| Optionnel : découper | Basse | Si `globals.css` devient trop lourd, introduire `app/styles/tokens.css` et `app/styles/bpm-components.css` importés dans `layout.tsx`, en gardant une seule liste de fichiers « modifiables » dans la doc. |

---

## 2. Base unique de noms de composants (pour l’IA)

### État actuel

- **Registry doc** : `lib/generated/bpm-components.json` (généré depuis le package Python) contient pour chaque composant : `slug`, `name` (ex. `bpm.metric`, `bpm.table`), `description`, `category`. Utilisé par `lib/docPages.ts` pour la navigation prev/next dans la doc composants.
- **Code** : les composants utilisent des **classes CSS** en kebab avec préfixe `bpm-` (ex. `bpm-input`, `bpm-table-wrapper`, `bpm-modal`). Pas de correspondance explicite dans un fichier unique entre `bpm.table` (nom API/doc) et `bpm-table` (classe CSS) ou le chemin du fichier.

### Objectif

- **Une base unique** (registry) qui permet à l’IA ou à un outil de retrouver :
  - le **nom canonique** (ex. `bpm.table`),
  - les **classes CSS** associées (ex. `bpm-table`, `bpm-table-wrapper`),
  - le **fichier source** (ex. `components/bpm/Table.tsx`),
  - la **page de doc** (ex. `/docs/components/table`).
- **Fonctionnement réfléchi** : convention claire (ex. `bpm.<slug>` ↔ `bpm-<slug>`) et documentée pour que l’IA sache où chercher (fichier, composant, doc).

### Actions proposées

| Action | Priorité | Détail |
|--------|----------|--------|
| Enrichir la registry | Haute | Dans `lib/generated/bpm-components.json` (ou un fichier dérivé/étendu), ajouter par composant : `cssClass` (ex. `bpm-table`) et optionnellement `path` (ex. `components/bpm/Table.tsx`). Si la génération vient du Python, adapter le script pour sortir ces champs, ou maintenir un petit JSON/mapping côté app. |
| Documenter la convention | Haute | Créer ou mettre à jour une section dans `docs/DESIGN_SYSTEM.md` ou un fichier dédié `docs/COMPOSANT_NAMING.md` : nom API `bpm.<slug>`, préfixe CSS `bpm-`, fichier `components/bpm/<Name>.tsx`, doc `/docs/components/<slug>`. Indiquer que la source de vérité pour la liste des composants est `lib/generated/bpm-components.json`. |
| Règles Cursor / AGENTS | Haute | Dans `.cursor/rules` ou `AGENTS.md` (si utilisé), ajouter une règle du type : « Pour trouver un composant BPM : 1) nom API = bpm.<slug> (ex. bpm.table), 2) classe CSS = bpm-<slug> (ex. bpm-table), 3) source = components/bpm/<Name>.tsx, 4) doc = app/(app)/docs/components/<slug>/page.tsx. Registry = lib/generated/bpm-components.json. » |
| Traçabilité DOM (optionnel) | Basse | Sur les composants BPM, ajouter un attribut `data-bpm-component="table"` (ou le slug) pour que le DOM soit traçable vers la registry. |

---

## 3. Documentation des structures de BDD (prod et launchers)

### État actuel

- **Prisma** : `prisma/schema.prisma` décrit tous les modèles (User, WikiArticle, Document, Contract, Asset, Ticket, Assignment, etc.).
- **Déploiement** : `DEPLOY.md` mentionne les migrations Prisma, `DATABASE_URL`, et le fait que le déploiement exécute `npx prisma migrate deploy`. Aucun document ne décrit explicitement **quels modules/features utilisent quelles tables** ni les **configs nécessaires** (fichiers type `domain.it.json`, variables d’env).

### Objectif

- **Un endroit** (ou un ensemble cohérent) où sont décrites :
  - les **structures de BDD** que l’app et chaque module doivent avoir pour fonctionner en prod (tables, relations utiles) ;
  - les **dépendances par module** (ex. Asset Manager → Asset, Ticket, Assignment, AssetContract, KnowledgeArticle, ChangeRequest, etc. + config domaines dans `lib/asset-manager/config/`) ;
  - les **variables d’environnement** et **fichiers de config** requis (ex. `DATABASE_URL`, `NEXTAUTH_*`, config domaines Asset Manager).
- **Launchers** : s’assurer que les « points d’entrée » (page Modules, documentation in-app, PWA) référencent ou renvoient vers cette doc (lien « Prérequis / BDD » ou section dédiée).

### Actions proposées

| Action | Priorité | Détail |
|--------|----------|--------|
| Créer `docs/DATABASE.md` | Haute | Document qui liste : (1) Référence au schéma Prisma (`prisma/schema.prisma`) ; (2) Par module/feature (Wiki, Documents, Base contractuelle, Asset Manager, Newsletter, Auth, IA…), les modèles Prisma utilisés et, si besoin, les configs (fichiers JSON, domaines) ; (3) Variables d’env obligatoires pour la prod (DATABASE_URL, NEXTAUTH_URL, etc.). |
| Lien depuis DEPLOY.md | Haute | Dans `DEPLOY.md`, ajouter une section « Structures BDD et modules » avec un lien vers `docs/DATABASE.md` et rappeler que les migrations doivent être à jour. |
| Doc in-app / launchers | Moyenne | Dans la documentation in-app (ex. page « Démarrage » ou « Déploiement »), ajouter un lien vers les prérequis BDD (ou inclure un résumé + lien vers `docs/DATABASE.md`). Si une page « Launchers » ou « Prérequis » existe, y intégrer les infos BDD et env. |
| Par module (optionnel) | Basse | Dans chaque module concerné (ex. Asset Manager), documenter en doc in-app les tables et configs qu’il utilise (ex. « Asset Manager utilise les tables Asset, Ticket, Assignment, AssetContract, KnowledgeArticle, ChangeRequest et les fichiers lib/asset-manager/config/domain.*.json »). |

---

## Fichiers concernés (résumé)

| Thème | Fichiers principaux |
|-------|----------------------|
| CSS unique | `app/globals.css`, `app/layout.tsx`, `docs/DESIGN_SYSTEM.md` |
| Nommage composants | `lib/generated/bpm-components.json`, `lib/docPages.ts`, `components/bpm/*.tsx`, `docs/DESIGN_SYSTEM.md` ou `docs/COMPOSANT_NAMING.md`, `.cursor/rules` ou `AGENTS.md` |
| Doc BDD | `docs/DATABASE.md` (à créer), `DEPLOY.md`, `prisma/schema.prisma`, pages doc in-app / launchers |

---

*Ce plan peut être suivi par étapes ; les actions « Haute » priorité donnent le socle (doc CSS, registry + règles IA, doc BDD + lien déploiement).*
