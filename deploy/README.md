# Déploiement — www.blueprint-modular.com

Déploiement du site Blueprint Modular sur le VPS (même serveur que myportfolio.beam-consulting) : **Streamlit + Nginx + systemd**.

## Fichiers

| Fichier | Rôle |
|---------|------|
| **setup.sh** | Installation initiale : clone du repo, virtualenv, pip install, unit systemd (port 8503). À exécuter en root sur le VPS. |
| **update.sh** | Mise à jour : `git pull`, mise à jour des dépendances, redémarrage du service. |
| **nginx.conf** | Vhost Nginx à copier dans `/etc/nginx/sites-available/blueprint-modular` (HTTP→HTTPS, www→apex, proxy vers Streamlit). |
| **CHECKLIST.md** | Checklist complète (DNS, setup, Nginx, Certbot, commandes utiles). |

## Prérequis

- DNS **blueprint-modular.com** et **www.blueprint-modular.com** → IP du VPS
- Port **8503** libre sur le VPS (`ss -tlnp | grep 85`)

## Installation rapide (sur le VPS)

```bash
# Rendre les scripts exécutables (depuis le repo en local ou après clone)
chmod +x deploy/setup.sh deploy/update.sh

# Sur le VPS, en root (ou après clone dans /var/www/blueprint-modular)
/var/www/blueprint-modular/deploy/setup.sh
```

Puis créer `.env`, configurer Nginx, lancer Certbot. Détail dans **CHECKLIST.md**.
