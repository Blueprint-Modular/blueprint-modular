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
# Next.js 16+ : server.js à la racine de .next/standalone/ ; anciennes builds : sous-dossier nom du package.
if [ -f .next/standalone/blueprint-modular/server.js ]; then
  cd .next/standalone/blueprint-modular || exit 1
elif [ -f .next/standalone/server.js ]; then
  cd .next/standalone || exit 1
else
  echo "run-app.sh: aucun server.js standalone trouvé (.next/standalone ou .../blueprint-modular). Lancez npm run build." >&2
  exit 1
fi
exec node server.js
