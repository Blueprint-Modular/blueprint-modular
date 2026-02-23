# Déploiement — Blueprint Modular

Déploiement du site Blueprint Modular sur le VPS : **fichiers statiques (HTML/CSS)** servis par Nginx.

**Note :** le dépôt GitHub est privé. Les procédures ci‑dessous supposent que vous avez accès au repo (clé SSH ou token).

## Deux façons de déployer

| Méthode | Quand l'utiliser |
|---------|------------------|
| **Depuis Windows (SCP)** | `.\deploy_blueprint_modular.ps1` — envoie `frontend/static/` + Logo depuis ton PC vers le VPS. |
| **Depuis le serveur (Git)** | Clone le repo sur le VPS, puis `./deploy/deploy-from-git.sh` — tout passe par le repo. |

## Déploiement via Git (recommandé sur le serveur)

À exécuter **sur le VPS** (après connexion SSH) :

```bash
# 1. Cloner le repo (une seule fois)
git clone https://github.com/remigit55/blueprint-modular.git /home/ubuntu/blueprint-modular
cd /home/ubuntu/blueprint-modular

# 2. Rendre le script exécutable et lancer le déploiement
chmod +x deploy/deploy-from-git.sh
./deploy/deploy-from-git.sh
```

Le script met à jour le repo (`git pull`), copie `frontend/static/` et `Logo BPM.png` vers `/var/www/blueprint-modular`.  
Pour les **mises à jour** : `cd /home/ubuntu/blueprint-modular && git pull && ./deploy/deploy-from-git.sh`.

**Config Nginx** (une fois) : tu peux copier la config du repo sur le serveur :
```bash
sudo cp /home/ubuntu/blueprint-modular/deploy/nginx.conf /etc/nginx/sites-available/blueprint-modular
# Adapter server_name si besoin, puis :
sudo ln -sf /etc/nginx/sites-available/blueprint-modular /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## Fichiers

| Fichier | Rôle |
|---------|------|
| **deploy-from-git.sh** | Déploiement depuis Git (clone/pull + copie vers `/var/www/blueprint-modular`). À exécuter sur le VPS. |
| **nginx.conf** | Vhost Nginx (site statique). À copier dans `/etc/nginx/sites-available/blueprint-modular`. |
| **setup.sh** | Ancien : app + systemd (référence). |
| **update.sh** | Ancien : mise à jour app (référence). |
| **CHECKLIST.md** | Checklist (DNS, Nginx, Certbot). |

## Prérequis

- DNS des domaines (ex. blueprintmodular.com, blueprint-modular.fr) → IP du VPS
- Nginx installé ; dossier `/var/www/blueprint-modular` créé (le script le fait si besoin)
