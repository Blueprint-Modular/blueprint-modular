/**
 * Configuration PM2 pour l'app Next.js (mode standalone).
 * Sur le VPS : cwd doit pointer vers le repo (ex. /home/ubuntu/blueprint-modular).
 * Lancer depuis la racine du repo : pm2 start ecosystem.config.js
 * Les variables d'environnement sont chargées depuis .env par run-app.sh si vous utilisez ce script à la place.
 */
module.exports = {
  apps: [
    {
      name: "blueprint-app",
      script: ".next/standalone/server.js",
      cwd: process.cwd(),
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
