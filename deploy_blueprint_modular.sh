#!/bin/bash
# Déploiement du site Blueprint Modular vers le VPS
# Usage : depuis le dossier blueprint-modular : ./deploy_blueprint_modular.sh
# Préalable : dossier /var/www/blueprint-modular créé sur le serveur (voir DEPLOIEMENT_DOMAINE.md)

set -e

SSH_KEY="${HOME}/.ssh/portfolio_beam_key"
SERVER_USER="ubuntu"
SERVER_IP="145.239.199.236"
REMOTE_PATH="/var/www/blueprint-modular"

if [ ! -f "$SSH_KEY" ]; then
    echo "[ERREUR] Clé SSH introuvable: $SSH_KEY"
    echo "   Modifiez SSH_KEY dans ce script ou créez la clé."
    exit 1
fi

for f in index.html components.html reference.html "Logo BPM.png"; do
    if [ ! -f "$f" ]; then
        echo "[ERREUR] Fichier manquant: $f"
        exit 1
    fi
done

RSYNC_FILES="index.html components.html reference.html Logo BPM.png"
if [ -f "favicon.ico" ]; then
    RSYNC_FILES="$RSYNC_FILES favicon.ico"
    echo "favicon.ico inclus (optionnel)."
fi

echo "Déploiement Blueprint Modular vers $SERVER_USER@$SERVER_IP:$REMOTE_PATH"
echo ""

rsync -avz -e "ssh -i $SSH_KEY" \
    $RSYNC_FILES \
    "$SERVER_USER@$SERVER_IP:$REMOTE_PATH/"

echo "[OK] Fichiers déployés."
echo ""
echo "Vérification sur le serveur:"
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_IP" "ls -la $REMOTE_PATH"
echo ""
echo "Site disponible (après config Nginx + SSL): https://VOTRE_DOMAINE.fr"
