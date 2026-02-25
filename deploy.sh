#!/bin/bash
set -e

echo "📍 Vérification du répertoire..."
if [ ! -f "package.json" ]; then
  echo "❌ Erreur : lancer deploy.sh depuis la racine du projet"
  exit 1
fi

echo "📦 Installation des dépendances..."
npm install
npx prisma generate

echo "🔨 Build Next.js..."
rm -rf .next
npm run build

echo "📁 Copie des fichiers statiques (requis en mode standalone)..."
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/static
cp -r .next/server .next/standalone/.next/
cp -r public .next/standalone/public

echo "🔄 Redémarrage PM2..."
pm2 restart blueprint-app --update-env

echo "✅ Déploiement terminé — $(date)"
