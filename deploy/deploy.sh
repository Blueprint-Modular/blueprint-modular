#!/bin/bash
# Deploy blueprint-modular : pull, npm install, build, standalone (static + public), pm2 restart.
# Lance depuis local : .\scripts\deploy-vps-remote.ps1 (une seule commande SSH).
set -e
cd /home/ubuntu/blueprint-modular
git pull origin master
npm install
rm -rf .next
npm run build
# Standalone mode : copier static + public dans le bon répertoire
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/public
pm2 restart blueprint-app && pm2 save
echo "Deploy OK"
