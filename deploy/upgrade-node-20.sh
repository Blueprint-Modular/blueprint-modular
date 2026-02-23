#!/bin/bash
# Passe le VPS en Node.js 20 LTS (supprime les warnings "Unsupported engine" au build).
# À exécuter une fois sur le VPS en SSH : bash deploy/upgrade-node-20.sh
# Prérequis : Ubuntu/Debian. Utilise le dépôt NodeSource.

set -e

echo "==> Mise à jour Node.js vers 20 LTS (NodeSource)"

if [ -n "$NVM_DIR" ] && [ -f "$NVM_DIR/nvm.sh" ]; then
  echo "--> NVM détecté. Installation de Node 20 via nvm..."
  . "$NVM_DIR/nvm.sh"
  nvm install 20
  nvm alias default 20
  nvm use 20
  echo "    Node: $(node -v) — npm: $(npm -v)"
  echo "✅ Terminé. Redémarrez le terminal ou faites: nvm use 20"
  exit 0
fi

# Méthode système (NodeSource)
echo "--> Ajout du dépôt NodeSource (Node 20.x)..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

echo "--> Installation de nodejs..."
sudo apt-get install -y nodejs

echo "    Node: $(node -v) — npm: $(npm -v)"
echo "✅ Node 20 installé. Relancez un déploiement pour supprimer les warnings (npm run build)."
