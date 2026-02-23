# Déployer l’app Next.js (Wiki, modules, sandbox) sur le VPS

En prod, **blueprint-modular.com** et **docs.blueprint-modular.com** servent la vitrine et la doc statiques. L’app Next.js (Wiki, Module IA, Documents, doc composants avec sandbox) est servie sur **app.blueprint-modular.com**.

## Prérequis sur le VPS

- Node.js 18+ et npm
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
