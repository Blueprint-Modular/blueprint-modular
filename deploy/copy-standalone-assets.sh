#!/bin/bash
# À lancer après "npm run build" quand on déploie à la main (sans deploy-from-git.sh).
# Recopie static + server + public dans .next/standalone pour que le CSS/JS soit servi.
# Usage: depuis la racine du repo → ./deploy/copy-standalone-assets.sh

set -e

REPO_DIR="${REPO_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$REPO_DIR"

if [ ! -d ".next/static" ] || [ ! -d ".next/standalone" ]; then
  echo "⚠ Erreur: lancez d'abord 'npm run build' (et vérifiez que next.config a output: 'standalone')."
  exit 1
fi

echo "--> Copie des assets dans .next/standalone..."
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/static
cp -r .next/server .next/standalone/.next/
cp -r public .next/standalone/public 2>/dev/null || true
if [ -d "lib/asset-manager" ]; then
  mkdir -p .next/standalone/lib
  cp -r lib/asset-manager .next/standalone/lib/
fi
echo "✅ Assets copiés. Vous pouvez faire: pm2 restart blueprint-app"
exit 0
