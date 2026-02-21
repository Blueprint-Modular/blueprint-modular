# Checklist — Déploiement www.blueprint-modular.com

## Prérequis

- [ ] DNS **blueprint-modular.com** → IP du VPS (enregistreur de domaine)
- [ ] DNS **www.blueprint-modular.com** → même IP
- [ ] Sur le VPS : `ss -tlnp | grep 85` → port **8503** libre (adapter dans `setup.sh` et `nginx.conf` si besoin)

## Installation initiale (root sur le VPS)

- [ ] Exécuter `deploy/setup.sh` (clonage, venv, systemd)
- [ ] Créer `/var/www/blueprint-modular/.env` (ex. `cp .env.example .env` ou contenu minimal : `ENVIRONMENT=production`)
- [ ] Vérifier que `www-data` peut lire le repo : `chown -R www-data:www-data /var/www/blueprint-modular` si besoin

## Nginx

- [ ] Copier `deploy/nginx.conf` vers `/etc/nginx/sites-available/blueprint-modular`
- [ ] Activer : `ln -s /etc/nginx/sites-available/blueprint-modular /etc/nginx/sites-enabled/`
- [ ] `nginx -t` → configuration valide
- [ ] `systemctl reload nginx`

## SSL (Let's Encrypt)

- [ ] `certbot --nginx -d blueprint-modular.com -d www.blueprint-modular.com`
- [ ] Renouvellement automatique : cron Certbot déjà en place sur le VPS

## Vérifications finales

- [ ] `systemctl status blueprint-modular` → **active (running)**
- [ ] **https://blueprint-modular.com** accessible
- [ ] Redirection HTTP → HTTPS opérationnelle
- [ ] Redirection **www** → **apex** (blueprint-modular.com) opérationnelle

---

## Commandes utiles post-déploiement

```bash
# Statut du service
systemctl status blueprint-modular

# Logs en temps réel
journalctl -u blueprint-modular -f

# Redémarrage manuel
systemctl restart blueprint-modular

# Mise à jour depuis le repo
cd /var/www/blueprint-modular && bash deploy/update.sh

# Logs Nginx
tail -f /var/log/nginx/blueprint-modular.error.log
tail -f /var/log/nginx/blueprint-modular.access.log
```
