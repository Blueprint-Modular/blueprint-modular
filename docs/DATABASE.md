# Structures de base de données et prérequis production

Ce document décrit les **structures de BDD** que l’application et ses modules utilisent, ainsi que les **configurations et variables d’environnement** nécessaires pour fonctionner en production. Il sert de référence pour le déploiement et la documentation (dont les « launchers » / points d’entrée).

**Schéma source** : [`prisma/schema.prisma`](../prisma/schema.prisma). Les migrations sont appliquées en prod via `npx prisma migrate deploy` (voir [DEPLOY.md](DEPLOY.md)).

---

## 1. Variables d’environnement obligatoires

| Variable | Rôle |
|----------|------|
| `DATABASE_URL` | URL PostgreSQL (ex. `postgresql://user:pass@host:5432/blueprint_modular`). Requise pour Prisma et toute fonctionnalité persistante. |
| `NEXTAUTH_SECRET` | Secret pour les sessions NextAuth. |
| `NEXTAUTH_URL` | URL de l’app (ex. `https://app.blueprint-modular.com`). |

Variables optionnelles selon les modules : clés API (IA, etc.), stockage fichiers, etc.

---

## 2. Modules et tables utilisées

### Authentification / Utilisateurs

- **Tables** : `User`, `ApiKey`, `Role` (enum).
- **Modules** : Auth (login, register, sessions), toute fonctionnalité liée à l’utilisateur courant.

### Wiki

- **Tables** : `WikiArticle`, `WikiRevision`, `WikiComment`, `WikiBacklink`.
- **Relations** : `User` (auteur, révisions, commentaires).
- **Modules** : Wiki (articles, révisions, commentaires, backlinks). Recherche sémantique optionnelle (pgvector, colonne `embeddingVector`).

### Analyse de documents

- **Tables** : `Document`.
- **Relations** : `User` (uploadedBy).
- **Modules** : Module Documents (upload, analyse, champs extraits).

### Base contractuelle (Contracts)

- **Tables** : `Contract`.
- **Relations** : `User` (uploadedBy).
- **Modules** : Module Base contractuelle (contrats fournisseurs / CGV, analyse, stockage).

### Newsletter

- **Tables** : `NewsletterSettings`, `NewsletterArticle`.
- **Relations** : `User` (author).
- **Modules** : Module Newsletter (paramètres, articles, archivage).

### IA (conversations)

- **Tables** : `AiConversation`, `AiMessage`.
- **Relations** : `User`.
- **Modules** : Module IA (chat, historique des conversations).

### Gestion de parc (gestion d’actifs, tickets, MAD, contrats actifs, connaissances, changements)

- **Tables** :
  - Actifs : `Asset`, `AssetAttribute`, `AssetMovement`, `CIRelation`
  - Tickets : `Ticket`
  - Mises à disposition : `Assignment`
  - Contrats actifs (garantie, maintenance, etc.) : `AssetContract`
  - Connaissances : `KnowledgeArticle`
  - Changements : `ChangeRequest`
  - Audit : `AuditLog`, `Permission`
- **Relations** : `User` (createdBy, requester, assignee, technician, etc.).
- **Config requise** : un fichier de configuration par domaine dans `lib/asset-manager/config/domain.<domainId>.json` (ex. `domain.it.json`, `domain.maintenance.json`). En déploiement standalone, ces fichiers doivent être copiés dans le build (voir `deploy/deploy-from-git.sh`).
- **Modules** : Gestion de parc (tableau de bord, actifs, tickets, MAD, contrats, connaissances, changements, CMDB, audit).

---

## 3. Résumé par module (pour la doc / launchers)

| Module / Feature | Tables principales | Config / env spécifique |
|------------------|--------------------|--------------------------|
| Auth | User, ApiKey | NEXTAUTH_* |
| Wiki | WikiArticle, WikiRevision, WikiComment, WikiBacklink | — |
| Documents | Document | — |
| Base contractuelle | Contract | — |
| Newsletter | NewsletterSettings, NewsletterArticle | — |
| IA | AiConversation, AiMessage | — |
| Gestion de parc | Asset, AssetAttribute, AssetMovement, Ticket, Assignment, AssetContract, KnowledgeArticle, ChangeRequest, CIRelation, AuditLog, Permission | `lib/asset-manager/config/domain.*.json` |

---

## 4. Prérequis pour la production

1. **PostgreSQL** : base créée, `DATABASE_URL` configurée.
2. **Migrations** : exécuter `npx prisma migrate deploy` (fait automatiquement par `deploy-from-git.sh` si utilisé).
3. **Gestion de parc** : au moins un fichier `lib/asset-manager/config/domain.<id>.json` par domaine utilisé (ex. `it`, `maintenance`), et copie de `lib/asset-manager` dans le build standalone (voir [DEPLOY.md](DEPLOY.md) et `deploy/deploy-from-git.sh`).
4. **NextAuth** : `NEXTAUTH_SECRET` et `NEXTAUTH_URL` renseignés.

Pour le détail des étapes de déploiement, voir [DEPLOY.md](DEPLOY.md).
