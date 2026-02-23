#!/bin/bash
# Lance l'app Next.js (standalone) avec les variables d'environnement du repo.
# Utilisé par PM2. À exécuter depuis la racine du repo.
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR" || exit 1
if [ -f .env ]; then
  set -a
  . .env
  set +a
fi
export NODE_ENV=production
export PORT="${PORT:-3000}"
cd .next/standalone || exit 1
exec node server.js
