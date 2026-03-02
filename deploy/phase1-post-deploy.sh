#!/bin/bash
# Phase 1 — À lancer sur le VPS après git pull (ou après deploy-from-git.sh)
# Applique les migrations, seed production, redémarre l'app.
# Usage: ./deploy/phase1-post-deploy.sh
# Prérequis: être dans le répertoire du repo (ex. cd ~/blueprint-modular)

set -e

REPO_DIR="${REPO_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
APP_PM2_NAME="${APP_PM2_NAME:-blueprint-app}"

cd "$REPO_DIR"
echo "==> Phase 1 post-déploiement dans $REPO_DIR"

echo "--> Migrations Prisma..."
npx prisma migrate deploy

echo "--> Seed production (lignes, sessions, alertes pour l'org par défaut)..."
npm run seed:production

if command -v pm2 >/dev/null 2>&1; then
  echo "--> Redémarrage PM2 ($APP_PM2_NAME)..."
  pm2 restart "$APP_PM2_NAME" --update-env
  echo "✅ Phase 1 post-déploiement terminé. Tester: /demo/production, Sandbox « Charger exemple Production »."
else
  echo "⚠ PM2 non trouvé. Redémarrez l'app manuellement."
fi
