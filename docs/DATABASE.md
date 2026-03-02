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

### Démo Production (TRS, lignes, sessions, alertes)

- **Tables** : `Organization` (slug par défaut pour la démo), `ProductionLine`, `ProductionSession`, `ProductionAlert`.
- **Relations** : `Organization` → lignes ; chaque ligne → sessions et alertes.
- **Env** : `DEFAULT_ORG_SLUG` (optionnel, défaut `default`) pour l’org utilisée par la démo.
- **Seed** : `npm run seed:production` (ou `npx tsx prisma/seed-production.ts`) après `seed-organizations` pour peupler lignes, sessions et alertes de démo.

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
| Démo Production | Organization, ProductionLine, ProductionSession, ProductionAlert | `DEFAULT_ORG_SLUG` (optionnel) |

---

## 4. Prérequis pour la production

1. **PostgreSQL** : base créée, `DATABASE_URL` configurée.
2. **Migrations** : exécuter `npx prisma migrate deploy` (fait automatiquement par `deploy-from-git.sh` si utilisé).
3. **Gestion de parc** : au moins un fichier `lib/asset-manager/config/domain.<id>.json` par domaine utilisé (ex. `it`, `maintenance`), et copie de `lib/asset-manager` dans le build standalone (voir [DEPLOY.md](DEPLOY.md) et `deploy/deploy-from-git.sh`).
4. **NextAuth** : `NEXTAUTH_SECRET` et `NEXTAUTH_URL` renseignés.

Pour le détail des étapes de déploiement, voir [DEPLOY.md](DEPLOY.md).

---

## 5. Migration Phase 0 (multitenant) et seed

Après le déploiement Phase 0 (Organization, Workspace, GeneratedApp, etc.), en **local** ou sur le **VPS** :

### 5.1 Vérifier que `DATABASE_URL` est bien définie

Le fichier `.env` doit contenir une **ligne réelle** (sans `#`) :

```bash
grep "^DATABASE_URL=" .env
```

Si rien ne s’affiche, éditer `.env` et ajouter (en remplaçant `USER`, `PASSWORD`, `HOST`, `DB` par vos valeurs) :

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB
```

### 5.2 Créer l’utilisateur et la base (première fois en local)

Si PostgreSQL est installé mais la base ou l’utilisateur n’existent pas encore :

- **Avec pgAdmin (Windows)** : se connecter au serveur en tant que `postgres`, ouvrir *Query Tool*, ouvrir le fichier [`scripts/setup-db-local.sql`](../scripts/setup-db-local.sql), remplacer `MON_MOT_DE_PASSE` (et éventuellement `blueprint_user`), puis exécuter.
- **Avec psql** : `psql -U postgres -h localhost -f scripts/setup-db-local.sql` (après avoir édité le script avec le mot de passe voulu).

Puis définir dans `.env` :

```
DATABASE_URL=postgresql://blueprint_user:MON_MOT_DE_PASSE@localhost:5432/blueprint_modular
```

**Si Prisma renvoie une erreur P1000 (Authentication failed)** :

1. Vérifier que l’utilisateur et le mot de passe correspondent à ceux de PostgreSQL.
2. Si le mot de passe contient des caractères spéciaux (`@`, `#`, `:`, `/`, `%`, etc.), il faut les **encoder en pourcentage** dans l’URL :
   - `@` → `%40`
   - `#` → `%23`
   - `:` → `%3A`
   - `/` → `%2F`
   - `%` → `%25`
3. Exemple : mot de passe `p@ss/word` → dans l’URL : `p%40ss%2Fword`.

### 5.3 Droit CREATEDB pour la shadow database (Prisma migrate dev)

En local, `prisma migrate dev` crée une base temporaire (shadow database). L’utilisateur PostgreSQL doit avoir le droit de créer des bases :

```bash
# Afficher l’utilisateur extrait de DATABASE_URL et la commande à exécuter
./scripts/prisma-grant-createdb.sh
```

Puis exécuter la commande affichée (en superuser), par exemple :

```bash
sudo -u postgres psql -c "GRANT CREATEDB TO blueprint_user;"
```

### 5.4 Lancer la migration et le seed

```bash
npx prisma migrate dev --name add_multitenant
npx tsx prisma/seed-organizations.ts
```

Sur le **VPS**, après un déploiement réussi (`.\scripts\deploy-vps-remote.ps1`), le fichier `prisma/seed-organizations.ts` est présent ; on peut lancer le seed depuis le serveur si la migration n’a pas encore été faite (en général `deploy-from-git.sh` exécute `prisma migrate deploy`).
