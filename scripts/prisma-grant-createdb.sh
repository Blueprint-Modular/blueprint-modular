#!/usr/bin/env bash
# Extrait l'utilisateur PostgreSQL de DATABASE_URL et affiche la commande GRANT CREATEDB.
# Usage : depuis la racine du repo (où se trouve .env)
#   ./scripts/prisma-grant-createdb.sh
# Puis exécuter la commande affichée en superuser (sudo -u postgres psql ...).

set -e
ENV_FILE="${1:-.env}"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Fichier $ENV_FILE introuvable. Usage: $0 [chemin/.env]"
  exit 1
fi

LINE=$(grep -E '^DATABASE_URL=' "$ENV_FILE" | head -1)
if [[ -z "$LINE" ]]; then
  echo "Aucune ligne DATABASE_URL= trouvée dans $ENV_FILE."
  echo "Assurez-vous d'avoir une ligne (sans #) du type :"
  echo "  DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/blueprint_modular"
  exit 1
fi

# Extraire l'utilisateur : entre postgresql:// et le premier :
URL="${LINE#DATABASE_URL=}"
URL="${URL#postgresql://}"
USER="${URL%%:*}"

if [[ -z "$USER" ]]; then
  echo "Impossible d'extraire l'utilisateur de DATABASE_URL."
  exit 1
fi

echo "Utilisateur PostgreSQL (extrait de DATABASE_URL) : $USER"
echo ""
echo "Pour autoriser Prisma à créer la shadow database, exécuter en superuser :"
echo "  sudo -u postgres psql -c \"GRANT CREATEDB TO $USER;\""
echo ""
echo "Puis relancer la migration :"
echo "  npx prisma migrate dev --name add_multitenant"
echo "  npx tsx prisma/seed-organizations.ts"
