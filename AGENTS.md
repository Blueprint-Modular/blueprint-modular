# AGENTS.md

> Mode d'emploi pour agents autonomes opérant sur Blueprint Maker.
> Ce document est lu par Cursor Background Agents, GitHub Copilot Agent, Claude Code et tout autre agent LLM contribuant au code.
> Dernière révision : 19 mai 2026.

---

## 0. À lire en premier

Tu es un agent LLM appelé à modifier le code de Blueprint Maker ou de ses satellites. Avant toute action :

1. Lis ce fichier en entier.
2. Lis `PRINCIPLES.md` (principes architecturaux non-négociables).
3. Lis `CONVENTIONS.md` (règles techniques détaillées).
4. Identifie le repo dans lequel tu opères. Vérifie via :

```bash
test -f lib/design/designer-database.json && test -f lib/design/designer-resolver.ts && echo "REPO_OK_MAKER" || echo "CHECK_REPO"
```

5. Si le check retourne `CHECK_REPO`, arrête-toi et demande clarification à l'utilisateur avant toute modification.

Tout agent qui modifie du code sans avoir lu ces trois fichiers produit du bruit. La prise en charge d'une tâche commence par cette lecture.

---

## 1. Identité du projet

### 1.1 Ce que c'est

**Blueprint Maker** est un Process Intelligence Engine. Il transforme une intention en langage naturel en application full-stack déployable. Le pipeline est :
NL prompt → LLM → AppSpec JSON → builders TypeScript déterministes → K-15 validation → HTTPS deployment

La promesse Blueprint repose sur la reproductibilité : pour un même AppSpec, la même application est produite. Le LLM intervient en amont pour produire l'AppSpec, puis tout est dérivé de manière déterministe.

### 1.2 Positionnement stratégique

Blueprint Maker n'est pas un générateur d'apps de plus. C'est une plateforme qui apprend comment les organisations conçoivent et adaptent leurs processus. Concurrents à terme : ServiceNow, SAP Signavio.

L'agent qui intervient sur le code doit garder en tête que chaque modification touche un produit positionné sur un marché entreprise exigeant. Pas de raccourci, pas de hack, pas de "ça marche pour l'instant".

### 1.3 Ecosystème

| Produit | Rôle | Repo |
|---|---|---|
| **Maker** | Génération d'apps depuis prompt | `blueprint-maker` |
| **Modular** | Bibliothèque UI `bpm.*` (`@blueprint-modular/core`) | `blueprint-modular` |
| **Mirror** | Observation des processus déployés | (à venir) |
| **Mind** | Clustering de patterns | (à venir) |

### 1.4 Premier client

Nxtfood, en cours d'onboarding. Pas encore en production stricte au 19 mai 2026, mais toute régression sur Maker peut affecter la mise en service. Le risque est non-trivial.

### 1.5 Infrastructure

- Serveur : `bpm-prod` (OVH bare-metal, Ubuntu 24.04, 32 GB RAM, ~877 GB disque).
- Stack : Next.js 16, NextAuth JWT, PostgreSQL 16, Prisma 5.22, PM2, nginx, CrowdSec.
- Services PM2 : `blueprint-maker` (port 3001), `blueprint-app`, `blueprint-idea-bot`.
- Apps générées : déployées en containers Docker individuels.

---

## 2. Stack technique

### 2.1 Versions critiques

- Next.js : 16.2.4 (Turbopack)
- Prisma : 5.22
- PostgreSQL : 16
- Node.js : 20.x ou supérieur
- TypeScript : strict mode activé
- React : 19.x

### 2.2 Frameworks et libs

- **Routing & SSR** : Next.js App Router exclusivement (pas de Pages Router).
- **Authentification** : NextAuth en mode JWT sans PrismaAdapter.
- **ORM** : Prisma client généré côté serveur.
- **UI** : Tailwind CSS + `@blueprint-modular/core` (`bpm.*`).
- **Validation** : Zod pour les schemas runtime.
- **State client** : Zustand (préféré) ou hooks React natifs.
- **Tests E2E** : Playwright via K-15.

### 2.3 Hors-périmètre (pas utilisé, ne pas introduire)

- Pages Router Next.js
- Server Actions sans validation Zod
- Redux ou MobX
- Material UI, Chakra UI, Ant Design
- SCSS (Tailwind only)
- Yarn (npm only)

---

## 3. Workflow attendu pour un agent

### 3.1 Phases obligatoires

Un agent qui traite une issue passe par les phases suivantes, dans l'ordre :

**Phase 1 — Compréhension**
- Lire l'issue.
- Identifier le type : bug, feature, refactor, doc, chore.
- Identifier les fichiers a priori concernés.
- Lire ces fichiers en entier (`cat`, `grep`, `view`).

**Phase 2 — Plan**
- Identifier la cause racine si bug, le besoin si feature.
- Identifier la couche du pipeline concernée (cf. PRINCIPLES P4).
- Identifier les principes en jeu (PRINCIPLES.md).
- Identifier les fichiers sensibles (CONVENTIONS section 5).
- Si modification d'un fichier sensible non couvert par l'issue, escalader.

**Phase 3 — Implémentation**
- Créer une branche dédiée selon CONVENTIONS section 1.2.
- Commits atomiques.
- Pas plus de 5 fichiers modifiés sans justification.
- Pas de modification simultanée de plusieurs zones sensibles.

**Phase 4 — Vérification locale**
- `npm run build` doit passer.
- `npm run lint` doit passer (warnings tolérés, erreurs non).
- Si tests existants : `npm test` doit passer.
- Si modification de `lib/builder/*` ou `lib/generator/*` : K-15 doit passer sur au moins 3 AppSpecs représentatifs.

**Phase 5 — PR**
- Push de la branche.
- Ouverture de PR avec la structure obligatoire (CONVENTIONS section 3.1).
- Ne pas merger soi-même.
- Marquer en draft si escalade nécessaire.

### 3.2 Comportements interdits

Un agent ne fait jamais :

- Push direct sur `main`.
- Force push sur une branche partagée.
- Modification sans lecture préalable des fichiers concernés.
- Patch symptomatique sans diagnostic de la cause racine.
- Modification de plus de 5 fichiers dans une PR sans justification explicite.
- Commit d'un secret (token, clé API, mot de passe).
- Modification de fichier sensible (CONVENTIONS section 5) sans label `approved-sensitive` sur l'issue.
- Bypass de K-15 sur les modifications du pipeline de génération.
- Mélange de plusieurs changements logiques dans une PR.
- Self-merge.

### 3.3 Conditions de stop et d'escalade

Un agent s'arrête et escalade dans les cas suivants :

| Situation | Action |
|---|---|
| Conflit avec un principe inviolable (PRINCIPLES section 1) | Refus + commentaire sur l'issue, mention `@remigit55` |
| Modification d'un fichier de la zone authentification | PR en draft, demande d'arbitrage |
| Modification d'une migration Prisma | PR en draft, demande d'arbitrage |
| Build échoue après deux tentatives correctives | PR en draft avec contexte de l'échec |
| Plus de 5 fichiers modifiés et impossible de découper | PR avec justification, attente d'arbitrage humain avant merge |
| Toute action liée aux paiements, billing, secrets | Refus + escalade immédiate |
| Le contexte fourni est insuffisant pour décider de la cause racine | PR en draft avec hypothèses listées, demande d'arbitrage |

L'escalade prend la forme d'un commentaire sur la PR ou l'issue, avec mention `@remigit55`, expliquant :
- Ce qui a été tenté.
- Pourquoi l'agent ne peut pas conclure seul.
- Quelle décision est attendue.

---

## 4. Cartographie du code

### 4.1 Arborescence simplifiée Maker
blueprint-maker/
├── app/
│   ├── api/                    # Routes API
│   │   ├── auth/               # NextAuth
│   │   ├── github/             # OAuth indépendant deploy-to-GitHub
│   │   ├── generate/           # Endpoint de génération
│   │   └── deploy/             # Endpoint de déploiement
│   ├── (dashboard)/            # Pages utilisateur
│   └── components/             # Composants spécifiques au Maker
├── lib/
│   ├── auth.ts                 # Config NextAuth (ZONE SENSIBLE)
│   ├── builder/
│   │   ├── index.ts            # Orchestration (ZONE SENSIBLE, lignes 185-189, 247)
│   │   ├── page-builder.ts     # Pages déterministes (ZONE SENSIBLE)
│   │   └── ...
│   ├── generator/
│   │   └── dashboard-generator.ts  # LLM dashboard (ZONE SENSIBLE, 526 lignes)
│   ├── validator/
│   │   └── appspec.ts          # Validation AppSpec
│   ├── k15/                    # Suite Playwright
│   ├── design/
│   │   ├── designer-database.json
│   │   ├── designer-resolver.ts
│   │   └── designer-list.json
│   └── db.ts                   # Client Prisma
├── prisma/
│   ├── schema.prisma           # ZONE SENSIBLE
│   └── migrations/             # ZONE SENSIBLE
├── middleware.ts               # ZONE SENSIBLE
├── ecosystem.config.js         # ZONE SENSIBLE (pas de secrets ici)
├── next.config.js
├── package.json
└── tsconfig.json

### 4.2 Arborescence simplifiée Modular
blueprint-modular/
├── packages/
│   └── core/
│       ├── src/
│       │   ├── components/     # Composants bpm.*
│       │   ├── llms.txt        # Documentation pour LLM
│       │   └── BPM_API.md      # API publique
│       ├── package.json
│       └── tsconfig.json
├── showcase/                   # App vitrine
└── deploy/
└── deploy-from-git.sh      # Script de déploiement

### 4.3 Conventions de nommage de fichiers

- Modules TypeScript : `kebab-case.ts`
- Composants React : `PascalCase.tsx`
- Configs : `kebab-case.config.{js,ts}`
- Tests : `<nom>.test.ts` ou `<nom>.spec.ts`
- Documentation : `MAJUSCULE.md` à la racine, `kebab-case.md` dans les sous-dossiers

---

## 5. Composants bpm.*

### 5.1 Source de vérité

Le namespace `bpm.*` est exclusivement défini dans `@blueprint-modular/core`. Aucun composant `bpm.*` ne doit être défini ailleurs.

La documentation source est :
- `blueprint-modular/packages/core/src/llms.txt` : documentation orientée LLM, consommée par le dashboard-generator et K-15.
- `blueprint-modular/packages/core/src/BPM_API.md` : documentation orientée humain.

### 5.2 Validation des composants disponibles

Un agent qui veut utiliser un composant `bpm.X` vérifie qu'il existe via :

```bash
grep -n "VALID_BPM_COMPONENTS\|validComponents" blueprint-maker/lib/builder/page-builder.ts
```

Si le composant n'est pas dans la whitelist, il faut soit :
- Choisir un composant existant équivalent.
- Ajouter le composant dans Modular d'abord, puis l'ajouter à la whitelist du Maker.

### 5.3 Contrainte SSR

Tous les composants `bpm.*` doivent être SSR-safe. Accès direct à `window`, `document`, `navigator` interdit sans guard `typeof window !== 'undefined'`.

### 5.4 Mise à jour de la documentation

Quand un composant `bpm.*` est ajouté, modifié ou retiré :
- JSDoc mis à jour sur le composant.
- `llms.txt` régénéré et reflète l'état réel.
- `BPM_API.md` mis à jour si l'API publique change.
- Toutes ces modifications dans la même PR que le changement de composant.

---

## 6. Pipeline de génération

### 6.1 Flux par niveau

Blueprint Maker propose 6 flux selon deux dimensions : niveau visuel (Sketch / Craft / Masterpiece) et toggle "Approfondi" (OFF / ON).

| Niveau | Approfondi | Comportement |
|---|---|---|
| Sketch | OFF | Page-builder déterministe pur, sans dashboard LLM |
| Sketch | ON | Page-builder + dashboard LLM léger |
| Craft | OFF | Page-builder + dashboard LLM moyen |
| Craft | ON | Page-builder + dashboard LLM moyen approfondi |
| Masterpiece | OFF | Page-builder + dashboard LLM riche |
| Masterpiece | ON | Page-builder + dashboard LLM riche approfondi |

### 6.2 Zone libre du dashboard generator

Le LLM peut générer un dashboard "zone libre" (React / Tailwind / SVG) uniquement quand :
intentType !== "note" AND levelForDashboard !== "spark"

Cette logique est dans `lib/builder/index.ts` aux lignes 185-189 et 247 (état au 19 mai 2026).

Le contenu généré par le LLM en zone libre ne doit jamais :
- Appeler des routes API (`fetch`, `axios`).
- Utiliser de composants `bpm.*`.
- Définir de logique métier (auth, persistance, calculs critiques).
- Contenir de secrets ou de URLs hardcodés.

### 6.3 AppSpec et meta

L'AppSpec est streamé via SSE. Pendant le streaming, `spec.meta` peut être `undefined`. Tout accès doit utiliser l'optional chaining :

```typescript
const title = spec.meta?.title ?? 'Untitled';
```

Cf. PRINCIPLES R1.

### 6.4 K-15 et validation

K-15 valide l'app générée par 15 critères Playwright. Toute modification de `lib/builder/*` ou `lib/generator/*` doit être validée par K-15 sur un échantillon représentatif d'AppSpecs avant merge.

---

## 7. Sécurité

### 7.1 Secrets

Aucun secret n'est commité. Pas dans le code, pas dans les commentaires, pas dans les exemples, pas dans les tests.

Tout secret découvert dans le code en cours de modification doit être :
- Retiré du code.
- Signalé en commentaire de la PR.
- Considéré comme compromis et révoqué côté service (Telegram, Anthropic, GitHub, etc.).

### 7.2 npm install dans les apps générées

Pipeline de génération : `npm install --ignore-scripts` puis `npx prisma generate` quand nécessaire.

Le flag `--ignore-scripts` neutralise les postinstall malveillants. Cette règle est issue d'un incident d'avril 2026 (binaire `scanner_linux` introduit via un postinstall npm).

### 7.3 Validation d'entrée

Toute donnée venant de l'extérieur (utilisateur, API tierce, webhook) est validée avant utilisation. Préférer Zod pour les schemas runtime.

### 7.4 Routes API publiques

Les routes API publiques doivent :
- Vérifier l'authentification quand pertinent.
- Valider les paramètres et le body.
- Retourner des codes HTTP corrects.
- Ne pas révéler de détails internes dans les messages d'erreur (pas de stack traces, pas de chemins de fichiers serveur).

---

## 8. Workflow agent par type de tâche

### 8.1 Correction de bug

1. Reproduire le bug (ou comprendre via les logs).
2. Identifier la couche du pipeline concernée.
3. Trouver la cause racine, pas le symptôme.
4. Implémenter à la couche racine.
5. Ajouter un test qui couvre le cas (si la zone de test existe).
6. PR avec section "Cause racine" explicite.

### 8.2 Nouvelle fonctionnalité

1. Vérifier que la feature peut être représentée dans l'AppSpec.
2. Si non, soit refuser, soit motiver une extension du schéma AppSpec dans une PR préalable.
3. Implémenter la feature en partant du schéma AppSpec et en remontant le pipeline.
4. Ajouter tests si applicable.
5. Mettre à jour la documentation associée.
6. PR.

### 8.3 Refactor

1. Identifier les zones touchées.
2. Garantir que le comportement externe ne change pas.
3. Tester avant/après sur des cas réels.
4. PR explicite "refactor, pas de changement de comportement attendu".

### 8.4 Documentation

1. Modifier le fichier `.md` concerné.
2. Vérifier la cohérence avec les autres docs (pas de contradiction).
3. PR avec label `docs`.

### 8.5 Maintenance / dépendances

1. Mettre à jour les versions dans `package.json`.
2. Lancer `npm install` et vérifier le build.
3. Lire les release notes des packages mis à jour.
4. Si breaking change : adapter le code, documenter dans le commit.
5. PR.

---

## 9. Communication avec l'utilisateur humain

### 9.1 Ton

Réponses précises, factuelles, sans flatterie. L'utilisateur préfère un agent direct qui questionne plutôt qu'un agent qui répond approximativement.

Pas d'emoji. Pas de "Great!" ou "Sure thing!". Pas de paraphrase de la question dans la réponse.

### 9.2 Quand poser une question

Un agent pose une question quand :
- Le contexte est ambigu et qu'une mauvaise interprétation entraînerait du travail jeté.
- Un fichier sensible est touché.
- Un principe est potentiellement violé.

Un agent ne pose pas de question quand :
- La réponse est dans la documentation (`AGENTS.md`, `CONVENTIONS.md`, `PRINCIPLES.md`).
- La réponse peut être déduite du code par lecture.
- Il s'agit de détails techniques mineurs (nom de variable, etc.).

### 9.3 Format de PR

Voir CONVENTIONS section 3.1. La description de PR est lue par un humain pressé. Aller à l'essentiel.

---

## 10. Outils disponibles

### 10.1 Lecture de code

Avant toute modification, lire le code concerné via :
- `cat <fichier>` pour les fichiers courts.
- `view` avec range pour les fichiers longs.
- `grep -rn "<pattern>" <dossier>` pour chercher des références.

### 10.2 Exécution locale

- `npm install` : installation des dépendances.
- `npm run build` : build de production.
- `npm run lint` : linting.
- `npm run dev` : dev server (pour tests locaux).
- `npx prisma generate` : régénération du client Prisma.

### 10.3 Git

- Branches : selon CONVENTIONS section 1.2.
- Commits : selon CONVENTIONS section 2.
- Push : `git push -u origin <branche>`.
- Pas de force push sur une branche partagée.

### 10.4 GitHub

- Création de PR via `gh pr create` ou API.
- Liaison à l'issue : `Closes #<num>` ou `Fixes #<num>` dans le corps.
- Pas de self-merge.

---

## 11. Cas particuliers documentés

### 11.1 B-43 : OAuth flow indépendant

Le deploy-to-GitHub utilise un flow OAuth séparé de NextAuth :
- `/api/github/connect` : initiation
- `/api/github/callback` : callback
- Variables d'env : `GITHUB_DEPLOY_ID`, `GITHUB_DEPLOY_SECRET` (jamais dans `ecosystem.config.js`).

Ce flow ne doit pas être fusionné avec NextAuth.

### 11.2 B-33 : sanitization des enum CSS

Quand une variable CSS apparaît comme valeur d'enum dans AppSpec (ex : `var_bpm_text_muted` au lieu d'une vraie valeur), le sanitizer `lib/utils/placeholder-enum-sanitize.ts` la remplace avant transmission au builder.

Garde-fous R4/R5/R6 dans le sanitizer. Ne pas modifier sans tests étendus.

### 11.3 Design language pipeline

`designer-database.json` → `designer-resolver.ts` → `designer-list.json`.

La fonction `isBlueprintFactoryDefaultBrandKitData()` empêche le factory brand kit d'écraser la palette designer. Toute modification de cette logique doit préserver ce comportement.

---

## 12. Évolution de ce document

`AGENTS.md` est lu à chaque session d'agent. Le maintenir à jour est critique.

Modifications via PR sur `blueprint-maker-memory`. Justification dans la description : ce qui a changé, pourquoi, quel impact sur les agents existants.

Si une instruction de `AGENTS.md` est régulièrement contournée ou ignorée, c'est qu'elle est mal formulée ou inadaptée. Ouvrir une issue pour discussion plutôt que de la maintenir morte.

---

*Document maintenu par Rémi Cabrit. Évolutions via PR.*
