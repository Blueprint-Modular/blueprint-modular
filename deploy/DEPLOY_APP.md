# Déployer l’app Next.js (Wiki, modules, sandbox) sur le VPS

En prod, **blueprint-modular.com** et **docs.blueprint-modular.com** servent la vitrine et la doc statiques. L’app Next.js (Wiki, Module IA, Documents, doc composants avec sandbox) est servie sur **app.blueprint-modular.com**.

## Prérequis sur le VPS

- **Node.js 20+** et npm (recommandé pour éviter les warnings « Unsupported engine » au build). Si le serveur a encore Node 18 : `bash deploy/upgrade-node-20.sh` (une fois en SSH sur le VPS).
- PostgreSQL (pour l’app)
- PM2 : `npm i -g pm2`
- Nginx (déjà en place pour la vitrine / doc)

## Première fois

1. **DNS**  
   Créer un enregistrement A (ou CNAME) pour **app.blueprint-modular.com** vers l’IP du VPS.

2. **Certificat SSL**  
   ```bash
   sudo certbot certonly -d app.blueprint-modular.com
   ```

3. **Fichier .env**  
   Dans le repo (ex. `/home/ubuntu/blueprint-modular`) :
   ```bash
   cp deploy/app-env.example .env
   # Éditer .env : DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL=https://app.blueprint-modular.com, GOOGLE_CLIENT_ID/SECRET
   ```
   Générer un secret : `openssl rand -hex 32`

4. **Base de données**  
   ```bash
   npx prisma migrate deploy
   ```

5. **Nginx**  
   Copier la config (elle inclut le bloc `app.blueprint-modular.com`) puis recharger :
   ```bash
   sudo cp /home/ubuntu/blueprint-modular/deploy/nginx.conf /etc/nginx/sites-available/blueprint-modular
   sudo nginx -t && sudo systemctl reload nginx
   ```

6. **Déploiement**  
   Lancer le déploiement (build Next.js + démarrage PM2) :
   ```bash
   ./deploy/deploy-from-git.sh
   ```
   Ou depuis ta machine : `.\scripts\deploy-vps-remote.ps1`

## Après chaque déploiement

- Le script `deploy-from-git.sh` fait : vitrine + doc statiques + **build Next.js** + **PM2 restart** de l’app.
- L’app tourne sur le port 3000 ; Nginx proxy vers **app.blueprint-modular.com**.

## Vérifier l’app

- **URL** : https://app.blueprint-modular.com (dashboard, Module Wiki, Module IA, etc.)
- **Logs** : `pm2 logs blueprint-app`
- **Statut** : `pm2 status blueprint-app`

## Service Prompteur API (optionnel, module Monitor)

Le module **Monitor** (téléprompte IA) appelle l’API `https://app.blueprint-modular.com/api/prompteur/*`. En prod, Nginx proxy cette voie vers un service Python séparé (port 8001).

1. **Sur le VPS** : créer le projet (ex. `/home/ubuntu/prompteur-api`) avec `main.py`, `router_prompteur.py`, `prompteur_schemas.py`, et `.env` (ANTHROPIC_API_KEY).
2. **Dépendances Python** (inclure **python-multipart** pour l’upload PPTX) :
   ```bash
   pip install -r deploy/prompteur-api-requirements.txt
   ```
   Ou à la main : `pip install fastapi uvicorn anthropic python-pptx python-dotenv python-multipart`
3. **PM2** : `pm2 start "venv/bin/uvicorn main:app --host 0.0.0.0 --port 8001" --name prompteur-api --cwd /home/ubuntu/prompteur-api`
4. **Nginx** : dans le bloc `server { server_name app.blueprint-modular.com; }`, s’assurer que `client_max_body_size 100m;` est présent (pour upload PPTX Monitor jusqu’à 50 Mo), puis ajouter :
   ```nginx
   location /api/prompteur/ {
       client_max_body_size 100m;
       proxy_pass http://127.0.0.1:8001/api/prompteur/;
       proxy_http_version 1.1;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-Proto $scheme;
       proxy_buffering off;
       proxy_read_timeout 300s;
   }
   ```
   Puis `sudo nginx -t && sudo systemctl reload nginx`.
5. **Vérif** : `curl https://app.blueprint-modular.com/api/prompteur/health`
