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
   # Éditer .env : DATABASE_URL (ligne réelle sans #), NEXTAUTH_SECRET, NEXTAUTH_URL=https://app.blueprint-modular.com, GOOGLE_CLIENT_ID/SECRET
   ```
   Générer un secret : `openssl rand -hex 32`  
   En cas d’erreur Prisma « shadow database » en local, voir [docs/DATABASE.md](../docs/DATABASE.md) §5 et `./scripts/prisma-grant-createdb.sh`.

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

- Le script `deploy-from-git.sh` fait : vitrine + doc statiques + **build Next.js** + **copie assets standalone** + **PM2 restart** de l’app.
- L’app tourne sur le port 3000 ; Nginx proxy vers **app.blueprint-modular.com**.
- **Si la prod s'affiche sans CSS** : en standalone, recopier les assets après le build. Ne pas faire seulement `npm run build` + `pm2 restart`. Lancer `./deploy/deploy-from-git.sh` ou après build manuel : `./deploy/copy-standalone-assets.sh` puis `pm2 restart blueprint-app`. Voir `npm run build:standalone`.

## Vérifier l’app

- **URL** : https://app.blueprint-modular.com (dashboard, Module Wiki, Module IA, etc.)
- **Logs** : `pm2 logs blueprint-app`
- **Statut** : `pm2 status blueprint-app`

### Savoir si le déploiement est terminé

1. **Dans le terminal** (où tu as lancé `.\scripts\deploy-vps-remote.ps1`) : attendre la ligne **`✅ Déploiement terminé.`** avec la version déployée (ex. `02a3db0`) et les chemins Vitrine / Doc / App.
2. **En SSH sur le VPS** : `pm2 status blueprint-app` → la colonne **status** doit être **online** et **restart** peut avoir augmenté de 1 après un `pm2 restart`.
3. **Fichier de version** : ouvrir **https://blueprint-modular.com/version.txt** (ou docs) : tu dois voir le hash court du commit (ex. `02a3db0`) et la date du dernier déploiement.

### Modifications visibles après ce déploiement (Phase 0 multitenant)

- **Aucun changement d’interface** : les modèles Organization / Workspace sont en base et utilisables par l’API ; il n’y a pas encore de sélecteur d’organisation ou d’espace dans l’UI.
- **Ce qui prouve que le déploiement a bien pris en compte la Phase 0** : l’app **charge sans erreur 500** (tables `Organization`, `Workspace` présentes) ; Wiki, Contrats, Dashboard et autres modules fonctionnent comme avant.
- **Optionnel** : si tu as exécuté `npx tsx prisma/seed-organizations.ts` sur le VPS après `migrate deploy`, l’organisation par défaut « My Organization » existe en base (pour usage futur par l’app ou l’API).

## Phase 1 — Déploiement et validation (dashboard production)

Après un `git pull` (ou après avoir exécuté `./deploy/deploy-from-git.sh`) pour une version Phase 1 :

1. **Sur le VPS**, dans le répertoire du repo (ex. `~/blueprint-modular`) :
   ```bash
   git pull origin master
   npx prisma migrate deploy
   npm run seed:production
   pm2 restart blueprint-app
   ```
   Ou en une commande (après `chmod +x deploy/phase1-post-deploy.sh` si besoin) : `./deploy/phase1-post-deploy.sh`

2. **Vérifier** que l’organisation par défaut existe (sinon lancer d’abord `npm run seed:wiki` ou le seed organisations si vous l’utilisez). Le seed production s’attache à l’org dont le slug est `DEFAULT_ORG_SLUG` (défaut : `default`).

3. **Checklist validation Phase 1** :
   | Test | Attendu |
   |------|---------|
   | https://app.blueprint-modular.com/demo/production | Dashboard public sans login, onglets Vue globale / Lignes / Alertes |
   | Sandbox → « Charger exemple Production » → « Générer » | Code BPM production généré (TRS, métriques, tableaux) |
   | `GET /api/production/metrics` (avec session) | JSON avec `globalTRS`, `bestLine`, `worstLine`, `trsEvolution`, etc. |
   | `GET /api/demo/screenshot` | `{ "status": "not_implemented", "message": "Puppeteer non installé" }` — 501 |

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

## Erreur 413 (fichier trop volumineux) à l’import

Si l’import PPTX (Monitor) ou un autre upload renvoie **413** avec un message du type « Fichier trop volumineux (18 Mo) » :

1. **Nginx** (le plus souvent) : la limite par défaut est 1 Mo. Sur le VPS :
   - Vérifier que le fichier `deploy/nginx.conf` du repo contient bien `client_max_body_size 100m;` dans le bloc `server { server_name app.blueprint-modular.com ... }` (et éventuellement dans `location /api/prompteur/`).
   - Copier la config et recharger Nginx :
     ```bash
     sudo cp /home/ubuntu/blueprint-modular/deploy/nginx.conf /etc/nginx/sites-available/blueprint-modular
     sudo nginx -t && sudo systemctl reload nginx
     ```
2. **Next.js** : `next.config.mjs` contient déjà `experimental.proxyClientMaxBodySize: "100mb"` pour les Route Handlers (proxy). Après modification, redéployer l’app (rebuild + PM2 restart).
3. **Backend prompteur** : si Nginx envoie directement vers le service Python (port 8001), vérifier que le serveur (ex. Uvicorn) accepte des body > 1 Mo (souvent OK par défaut).
