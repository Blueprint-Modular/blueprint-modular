#!/bin/bash
set -e

APP_DIR="/var/www/blueprint-modular"
SERVICE_NAME="blueprint-modular"

echo "🔄 Pull des dernières modifications..."
cd $APP_DIR
git pull

echo "📦 Mise à jour des dépendances..."
source venv/bin/activate
pip install -r requirements.txt --quiet

echo "🔁 Redémarrage du service..."
systemctl restart $SERVICE_NAME
systemctl status $SERVICE_NAME --no-pager

echo "✅ Déploiement terminé"
