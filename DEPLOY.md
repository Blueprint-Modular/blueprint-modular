# Déploiement en production — Blueprint Modular

**Deux options principales :**
- **VPS (ton serveur)** : plein contrôle, stockage persistant pour les uploads, une machine pour tout (app + base). Idéal si tu as déjà un serveur.
- **Vercel** : zéro serveur à gérer, déploiement en une commande ; les uploads sont éphémères sauf si tu branches un stockage externe.

---

## Option A : Déploiement sur ton VPS (recommandé si tu as un serveur)

Sur ton VPS (Linux), avec Docker.

### 1. PostgreSQL

Soit PostgreSQL déjà installé sur le VPS, soit en conteneur :

```bash
docker run -d --name bpm-db \
  -e POSTGRES_USER=bpm -e POSTGRES_PASSWORD=CHANGE_ME -e POSTGRES_DB=blueprint_modular \
  -v bpm-pgdata:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:16-alpine
```

`DATABASE_URL` sera :  
`postgresql://bpm:CHANGE_ME@localhost:5432/blueprint_modular`  
(si l’app tourne sur le même host) ou `@IP_DU_VPS:5432` depuis l’extérieur.

### 2. Migrations

Une fois la base accessible (depuis ta machine ou le VPS) :

```bash
export DATABASE_URL="postgresql://bpm:CHANGE_ME@TON_VPS:5432/blueprint_modular"
npx prisma migrate deploy --schema=prisma/schema.prisma
```

### 3. Build et run de l’app

Sur le VPS, à la racine du projet (après un `git pull` ou copie des fichiers) :

```bash
docker build -t blueprint-modular .
docker run -d --name bpm-app --restart unless-stopped \
  -p 3000:3000 \
  -v $(pwd)/uploads:/app/uploads \
  -e DATABASE_URL="postgresql://bpm:CHANGE_ME@bpm-db:5432/blueprint_modular" \
  -e NEXTAUTH_SECRET="$(openssl rand -hex 32)" \
  -e NEXTAUTH_URL="https://ton-domaine.com" \
  -e GOOGLE_CLIENT_ID="..." \
  -e GOOGLE_CLIENT_SECRET="..." \
  --link bpm-db:bpm-db \
  blueprint-modular
```

Si PostgreSQL est sur le même host en natif (pas en conteneur), utilise `host.docker.internal` ou l’IP du host à la place de `bpm-db` dans `DATABASE_URL`, et enlève `--link`.

Les fichiers uploadés (module Documents) sont persistés dans `./uploads` sur le VPS grâce au volume.

### 4. Nginx + SSL (optionnel)

Pour exposer l’app en HTTPS derrière Nginx (remplace `ton-domaine.com` et le chemin du certificat) :

```nginx
server {
  listen 443 ssl;
  server_name ton-domaine.com;
  ssl_certificate /etc/letsencrypt/live/ton-domaine.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/ton-domaine.com/privkey.pem;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Puis `NEXTAUTH_URL=https://ton-domaine.com` et, dans la console Google OAuth, ajouter `https://ton-domaine.com/api/auth/callback/google`.

### 5. Déploiement en une commande (sur le VPS)

Sur le VPS, après avoir cloné le repo (une fois) :

```bash
cd /opt/blueprint-modular   # ou le chemin où tu as cloné
cp .env.example .env
# Éditer .env (POSTGRES_PASSWORD, NEXTAUTH_SECRET, NEXTAUTH_URL, GOOGLE_CLIENT_*, etc.)
chmod +x scripts/deploy-vps.sh
./scripts/deploy-vps.sh
```

Le script lance `docker-compose up -d --build`, attend la base, puis exécute les migrations Prisma.

**Depuis ta machine Windows** (si le repo est déjà cloné sur le VPS) :

```powershell
$env:VPS_HOST = "ton-ip-ou-domaine"
$env:VPS_USER = "root"
.\scripts\deploy-vps-remote.ps1
# Ou en paramètres : .\scripts\deploy-vps-remote.ps1 -VpsHost ton-ip -User root
```

Cela fait un `ssh` sur le VPS, `git pull` puis `scripts/deploy-vps.sh`.

### 6. Variante : docker-compose à la main

À la racine du projet sur le VPS, créer un fichier `.env` :

```env
POSTGRES_PASSWORD=un_mot_de_passe_fort
NEXTAUTH_SECRET=openssl rand -hex 32
NEXTAUTH_URL=https://ton-domaine.com
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

Puis :

```bash
docker-compose up -d
```

Une fois le stack lancé, appliquer les migrations **une fois** (depuis le VPS si Node est installé, ou depuis ta machine si le port 5432 est exposé) :

```bash
DATABASE_URL="postgresql://bpm:TON_MOT_DE_PASSE@IP_DU_VPS:5432/blueprint_modular" npx prisma migrate deploy --schema=prisma/schema.prisma
```

### 7. Mises à jour

```bash
git pull
docker-compose build app
docker-compose up -d
```

---

## Option B : Vercel (sans serveur)

1. **Connexion Vercel (une fois)**  
   À la racine du projet :
   ```bash
   npx vercel login
   ```
   Suivre le lien dans le terminal pour te connecter (GitHub, GitLab ou email).

2. **Base de données PostgreSQL**  
   Créer une base (gratuite) sur [Neon](https://neon.tech) ou [Vercel Postgres](https://vercel.com/storage/postgres), et récupérer l’URL `DATABASE_URL`.

3. **Variables d’environnement**  
   Les définir dans le dashboard Vercel (Project → Settings → Environment Variables) **avant** le premier déploiement, ou les renseigner quand la CLI le demande :
   - `DATABASE_URL` (PostgreSQL)
   - `NEXTAUTH_SECRET` (ex. `openssl rand -hex 32`)
   - `NEXTAUTH_URL` = l’URL de prod (ex. `https://blueprint-modular-xxx.vercel.app`) — à mettre à jour après le 1er déploiement
   - `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` (créer une app OAuth Google et ajouter l’URL de callback Vercel)

4. **Déployer**
   ```bash
   npm run deploy
   ```
   Ou : `npx vercel --prod`. La première fois, choisir “Create new project” et accepter les options par défaut.

5. **Migrations sur la base de prod**  
   Une fois l’URL de prod connue, appliquer les migrations (avec `DATABASE_URL` pointant vers la base de prod) :
   ```bash
   npx prisma migrate deploy --schema=prisma/schema.prisma
   ```

6. **OAuth Google**  
   Dans la console Google Cloud : ajouter dans “URIs de redirection autorisés” l’URL `https://TON_PROJECT.vercel.app/api/auth/callback/google`, et mettre `NEXTAUTH_URL` dans Vercel à cette même URL.

**Déploiements suivants** : `npm run deploy` à chaque fois, ou connecter le repo GitHub à Vercel pour des déploiements automatiques à chaque push.

---

## Variables d’environnement (VPS ou Vercel)

À configurer sur la plateforme (Vercel, Docker, etc.) :

| Variable | Obligatoire | Description |
|----------|--------------|-------------|
| `DATABASE_URL` | Oui | URL PostgreSQL (ex. Neon, Supabase, Vercel Postgres) |
| `NEXTAUTH_SECRET` | Oui | Secret pour les sessions (ex. `openssl rand -hex 32`) |
| `NEXTAUTH_URL` | Oui | URL publique de l’app (ex. `https://ton-app.vercel.app`) |
| `GOOGLE_CLIENT_ID` | Oui | OAuth Google |
| `GOOGLE_CLIENT_SECRET` | Oui | OAuth Google |
| `ENCRYPTION_SECRET` | Optionnel | Chiffrement des clés API (défaut : `NEXTAUTH_SECRET`) |

Après premier déploiement, exécuter les migrations Prisma sur la base :

```bash
npx prisma migrate deploy --schema=prisma/schema.prisma
```

---

## Récap : Vercel (détails)

1. Pousser le code sur GitHub/GitLab/Bitbucket.
2. Sur [vercel.com](https://vercel.com), **Add New Project** → importer le repo.
3. Configurer les variables d’environnement (voir tableau ci-dessus).
4. Déployer. Vercel détecte Next.js et lance `next build`.

**Note :** Les fichiers uploadés (module Documents) sont stockés localement dans `uploads/`. Sur Vercel (serverless), ce dossier est **éphémère**. Pour une persistance en production, il faudra brancher un stockage (Vercel Blob, S3, etc.) plus tard.

---

## Récap : Docker (local ou autre hébergeur)

Build et run en local pour tester :

```bash
docker build -t blueprint-modular .
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_SECRET="..." \
  -e NEXTAUTH_URL="http://localhost:3000" \
  -e GOOGLE_CLIENT_ID="..." \
  -e GOOGLE_CLIENT_SECRET="..." \
  blueprint-modular
```

Pour persister les uploads, monter un volume :

```bash
docker run -p 3000:3000 -v $(pwd)/uploads:/app/uploads ...
```

En production, déployer l’image sur Railway, Fly.io, AWS ECS, etc., en renseignant les mêmes variables et en pointant `NEXTAUTH_URL` vers l’URL publique.

---

## Migrations Prisma

Créer une migration (en dev) :

```bash
npx prisma migrate dev --schema=prisma/schema.prisma --name init
```

Une migration initiale est déjà dans le repo (`prisma/migrations/20250222000000_init/`). En production :

```bash
npx prisma migrate deploy --schema=prisma/schema.prisma
```

(avec `DATABASE_URL` pointant vers la base de prod). À lancer une fois après le premier déploiement.
