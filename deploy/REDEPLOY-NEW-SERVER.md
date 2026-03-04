# Redéploiement sur un nouveau serveur

**Déploiement 100 % depuis le repo Git** — aucun transfert depuis l’ancien VPS. On repart propre : clone, config, un script.

---

## Déploiement propre depuis Git (nouveau serveur)

À faire **en SSH sur le nouveau VPS** (ex. `ssh ubuntu@NOUVELLE_IP`). Tout vient du repo, rien n’est copié depuis l’ancien serveur.

### 1. Prérequis

- **Node.js 20+** : `node -v`. Si Node 18 : `bash deploy/upgrade-node-20.sh`
- **PostgreSQL** installé et base créée (ex. `blueprint_modular`)
- **PM2** : `npm i -g pm2`
- **Nginx** : `sudo apt install nginx` (ou déjà en place)

### 2. DNS

Pointer les domaines vers la **nouvelle IP** du serveur :

- `blueprint-modular.com` (et www)
- `docs.blueprint-modular.com`
- `app.blueprint-modular.com`

Attendre la propagation DNS si besoin.

### 3. Clone du repo et .env (tout depuis Git, rien depuis l’ancien VPS)

```bash
cd ~
git clone https://github.com/Blueprint-Modular/blueprint-modular.git
# ou : git clone https://github.com/remigit55/blueprint-modular.git
cd blueprint-modular
cp deploy/app-env.example .env
nano .env   # ou vim : DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, Google OAuth
```

Éditer `.env` :

- **DATABASE_URL** : `postgresql://user:password@localhost:5432/blueprint_modular` (nouvelle base ou existante)
- **NEXTAUTH_SECRET** : `openssl rand -hex 32`
- **NEXTAUTH_URL** : `https://app.blueprint-modular.com`
- **GOOGLE_CLIENT_ID** / **GOOGLE_CLIENT_SECRET** si OAuth Google

### 4. Certificats SSL

```bash
sudo certbot certonly -d blueprint-modular.com -d www.blueprint-modular.com
sudo certbot certonly -d docs.blueprint-modular.com
sudo certbot certonly -d app.blueprint-modular.com
```

(Adapter si vous utilisez un seul certificat multi-domaines, voir commentaire dans `deploy/nginx.conf`.)

### 5. Nginx

```bash
sudo cp /home/ubuntu/blueprint-modular/deploy/nginx.conf /etc/nginx/sites-available/blueprint-modular
sudo ln -sf /etc/nginx/sites-available/blueprint-modular /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 6. Déploiement complet (build + CSS + PM2)

```bash
cd ~/blueprint-modular
chmod +x deploy/deploy-from-git.sh
./deploy/deploy-from-git.sh
```

Cela fait : vitrine + doc + `npm install` + `prisma generate` + `prisma migrate deploy` + `npm run build` + **copie des assets dans `.next/standalone`** + démarrage/restart PM2 (`blueprint-app`).

Vérifier :

- `pm2 status blueprint-app` → **online**
- https://app.blueprint-modular.com → page avec CSS et sans erreur

---

## Mises à jour suivantes (depuis Windows)

Une fois le déploiement propre fait une fois (clone + .env + étapes ci-dessus), vous pouvez déployer **depuis Windows** à chaque push :

### 1. Configurer le nouveau VPS dans PowerShell

En PowerShell (une fois pour la session, ou dans ton profil) :

```powershell
$env:VPS_HOST = "NOUVELLE_IP"    # ex. 145.239.199.236
$env:VPS_USER = "ubuntu"
$env:VPS_REMOTE_DIR = "/home/ubuntu/blueprint-modular"
# Si tu utilises une clé SSH différente :
$env:VPS_SSH_KEY = "C:\Users\remi.cabrit\.ssh\ta_cle_privee"
```

### 2. Lancer le déploiement

```powershell
cd C:\Users\remi.cabrit\blueprint-modular
.\scripts\deploy-vps-remote.ps1
```

Ou en une ligne avec le nouveau host :

```powershell
.\scripts\deploy-vps-remote.ps1 -VpsHost "NOUVELLE_IP"
```

Le script fait : `git fetch` + `git reset --hard origin/master` sur le VPS + `deploy/deploy-from-git.sh` (donc build complet + assets standalone + PM2 restart).

---

## Vérifications après déploiement

| Vérification | Commande / URL |
|--------------|----------------|
| Version déployée | https://blueprint-modular.com/version.txt ou docs.blueprint-modular.com/version.txt |
| App en ligne | https://app.blueprint-modular.com (avec CSS) |
| PM2 | `pm2 status blueprint-app` → **online** |
| Logs | `pm2 logs blueprint-app` |

Si le CSS ne s’affiche toujours pas : vérifier que `deploy-from-git.sh` a bien exécuté les lignes qui copient `.next/static` et `.next/server` dans `.next/standalone` (elles sont dans le script). Relancer une fois `./deploy/deploy-from-git.sh` au besoin.

**Base de données** : avec ce déploiement, la base est neuve sur le nouveau serveur. `prisma migrate deploy` crée les tables. Les données (utilisateurs, wiki, etc.) ne sont pas transférées depuis l’ancien VPS ; pour les récupérer il faudrait un dump/restore PostgreSQL à part.
