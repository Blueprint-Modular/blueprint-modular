# Déploiement en production — Blueprint Modular

**Production = VPS Ubuntu uniquement**, alimenté par commit Git. Aucun déploiement Vercel.

- **Vitrine** (blueprint-modular.com) et **doc statique** (docs.blueprint-modular.com) : déployés par `deploy-from-git.sh` sur le VPS.
- **App Next.js** (Wiki, modules, sandbox) : optionnellement sur le même VPS (app.blueprint-modular.com), voir **deploy/DEPLOY_APP.md**.

---

## Déploiement (vitrine + doc + app) — VPS OVH

Le site public **blueprint-modular.com** (vitrine) et **docs.blueprint-modular.com** (documentation) sont des sites **statiques** déployés sur un VPS OVH. Pas de Next.js ni Node sur le serveur pour ces domaines.

**Procédure (depuis Windows) :**

1. **Commit + push** vers GitHub (branche `master`).
2. Lancer le script de déploiement :
   ```powershell
   cd C:\Users\remi.cabrit\blueprint-modular
   .\scripts\deploy-vps-remote.ps1
   ```

Le script :
- Se connecte en SSH au VPS (`ubuntu@145.239.199.236`, clé `~/.ssh/portfolio_beam_key`).
- Met à jour le repo sur le VPS : `git fetch origin` puis `git reset --hard origin/master`.
- Exécute `deploy/deploy-from-git.sh` sur le VPS : nettoyage des répertoires cibles, copie de la vitrine vers `/var/www/blueprint-modular`, copie de la doc vers `/var/www/blueprint-modular-docs`, écriture de `version.txt`.

**Vérifier la version en ligne :** ouvrir `https://blueprint-modular.com/version.txt` et `https://docs.blueprint-modular.com/version.txt` (hash = `git rev-parse --short HEAD` en local).

**Note :** Si le build Next.js affiche des warnings « Unsupported engine » (Node 18 sur le VPS), passer à Node 20 une fois en SSH : `cd /home/ubuntu/blueprint-modular && bash deploy/upgrade-node-20.sh`. Puis relancer un déploiement.

Pour la procédure détaillée (build, commit, vérifications), voir **[COMMIT_DEPLOY.md](COMMIT_DEPLOY.md)**.

---

## Option A : Déploiement de l’app Next.js sur ton VPS (Docker)

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

### 5. Déploiement de l’app Next.js en une commande

**Sur le VPS (Linux)** après avoir cloné le repo :

```bash
cd /home/ubuntu/blueprint-modular  # ou /opt/blueprint-modular
cp .env.example .env
# Éditer .env (POSTGRES_PASSWORD, NEXTAUTH_SECRET, NEXTAUTH_URL, GOOGLE_CLIENT_*, etc.)
# Si tu as un script dédié Docker/Next.js :
chmod +x scripts/deploy-vps.sh
./scripts/deploy-vps.sh
```

(Le script type lance `docker-compose up -d --build`, attend la base, puis exécute les migrations Prisma.)

**Depuis ta machine Windows** — déploiement **du site statique** (vitrine + doc) sur le VPS OVH actuel :

```powershell
cd C:\Users\remi.cabrit\blueprint-modular
git push origin master   # d’abord pousser les changements
.\scripts\deploy-vps-remote.ps1
# Ou avec paramètres : .\scripts\deploy-vps-remote.ps1 -VpsHost 145.239.199.236 -User ubuntu
```

Cela fait un SSH sur le VPS, `git fetch origin && git reset --hard origin/master`, puis `deploy/deploy-from-git.sh` (copie vitrine + doc, pas l’app Next.js). Pour déployer l’app Next.js sur un VPS, il faut un autre flux (build + PM2 ou Docker sur le serveur). Voir [COMMIT_DEPLOY.md](COMMIT_DEPLOY.md) pour la procédure complète du site statique.

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

## Vercel — non utilisé

Le déploiement production se fait **uniquement sur le VPS Ubuntu** (alimenté par commit Git). Vercel n'est pas utilisé.


---

## Variables d’environnement (VPS)

À configurer sur le VPS (fichier `.env`, voir `deploy/app-env.example`) :

| Variable | Obligatoire | Description |
|----------|--------------|-------------|
| `DATABASE_URL` | Oui | URL PostgreSQL  |
| `NEXTAUTH_SECRET` | Oui | Secret pour les sessions (ex. `openssl rand -hex 32`) |
| `NEXTAUTH_URL` | Oui | URL publique de l’app (ex. `https://app.blueprint-modular.com`) |
| `GOOGLE_CLIENT_ID` | Oui | OAuth Google |
| `GOOGLE_CLIENT_SECRET` | Oui | OAuth Google |
| `ENCRYPTION_SECRET` | Optionnel | Chiffrement des clés API (défaut : `NEXTAUTH_SECRET`) |

Après premier déploiement, exécuter les migrations Prisma sur la base :

```bash
npx prisma migrate deploy --schema=prisma/schema.prisma
```

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
