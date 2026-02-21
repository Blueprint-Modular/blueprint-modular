# Déploiement Blueprint Modular sur un domaine dédié (OVH + VPS)

Ce guide décrit comment exposer le site Blueprint Modular sur un **nom de domaine acheté chez OVH**, sur le **même VPS** que MyPortfolio (ou un autre).

Remplacez `VOTRE_DOMAINE.fr` par votre domaine réel (ex. `blueprint-modular.fr`, `bpm.example.com`).

---

## Checklist avant de commencer

- [ ] Domaine acheté chez OVH (ou autre) et accès à la zone DNS
- [ ] VPS avec accès SSH (même serveur que MyPortfolio ou dédié)
- [ ] Clé SSH configurée (ex. `~/.ssh/portfolio_beam_key`) et testée : `ssh -i ... ubuntu@IP_VPS "echo OK"`
- [ ] Fichiers du site prêts dans le dossier `blueprint-modular` : `index.html`, `components.html`, `reference.html`, **Logo BPM.png** (voir [README](./README.md) § Fichiers — si vous clonez depuis le repo parent, vous pouvez copier un logo depuis `frontend/public` en le renommant en `Logo BPM.png`)

**Fichier exemple Nginx :** vous pouvez partir du fichier **`nginx-bpm-domain.conf.example`** dans ce dossier : copiez-le sur le VPS, renommez-le avec votre domaine, puis remplacez `VOTRE_DOMAINE.fr` dans tout le fichier. Après obtention du SSL, vous pouvez vous inspirer de **`nginx-bpm-domain-https.conf.example`** pour la config HTTPS complète.

---

## Ordre recommandé

1. **DNS** (OVH) → pointer le domaine vers l’IP du VPS  
2. **Attendre** la propagation DNS (quelques minutes à 1 h)  
3. **VPS** → créer le répertoire `/var/www/blueprint-modular`  
4. **Nginx** → créer un vhost **HTTP uniquement** (port 80) pour le domaine  
5. **Certbot** → obtenir le certificat SSL (Certbot a besoin que le domaine réponde en HTTP sur le VPS)  
6. **Nginx** → compléter le vhost avec le bloc HTTPS (ou laisser Certbot l’ajouter)  
7. **Déployer** les fichiers (rsync / script PowerShell)  
8. **Activer** le site et recharger Nginx  

---

## Première fois (résumé)

1. **DNS** : zone OVH → enregistrement A pour `@` et `www` vers l’IP du VPS.  
2. **VPS** : `sudo mkdir -p /var/www/blueprint-modular && sudo chown ubuntu:ubuntu /var/www/blueprint-modular`.  
3. **Nginx HTTP** : créer le vhost à partir de `nginx-bpm-domain.conf.example` (bloc HTTP seul), activer le site, recharger Nginx.  
4. **Certbot** : `sudo certbot certonly --nginx -d VOTRE_DOMAINE.fr -d www.VOTRE_DOMAINE.fr`.  
5. **Nginx HTTPS** : compléter le vhost avec le bloc HTTPS (voir § 3 étape B ou `nginx-bpm-domain-https.conf.example`), recharger Nginx.  
6. **Déployer** : depuis le dossier `blueprint-modular` : `.\deploy_blueprint_modular.ps1` (Windows) ou `./deploy_blueprint_modular.sh` (Linux/WSL).

---

## 1. DNS chez OVH

1. Connectez-vous à [OVH Manager](https://www.ovh.com/manager/) → **Noms de domaine** → votre domaine.
2. Onglet **Zone DNS**.
3. Ajoutez une entrée **A** :
   - **Sous-domaine** : `@` (pour le domaine nu) et/ou `www` (pour www.VOTRE_DOMAINE.fr).
   - **Cible** : l’**IP publique de votre VPS** (ex. `145.239.199.236` si c’est le même que MyPortfolio).
   - **TTL** : 300 ou 3600.
4. Sauvegardez. La propagation peut prendre quelques minutes à 1 h.

Vérification (après propagation) :

```bash
# Remplacer par votre domaine
nslookup VOTRE_DOMAINE.fr
# doit renvoyer l’IP du VPS
```

---

## 2. Préparer le répertoire sur le VPS

En SSH sur le VPS (même utilisateur que pour MyPortfolio, ex. `ubuntu`) :

```bash
# Créer le répertoire pour le site Blueprint Modular
sudo mkdir -p /var/www/blueprint-modular
sudo chown ubuntu:ubuntu /var/www/blueprint-modular
```

Vous y déposerez ensuite les fichiers du projet (voir § 5).

---

## 3. Configuration Nginx pour le nouveau domaine

Sur le VPS, créez un nouveau fichier de site Nginx (ou copiez `nginx-bpm-domain.conf.example` depuis votre machine puis adaptez) :

```bash
# Option : copier l'exemple depuis votre PC (depuis le dossier blueprint-modular)
# scp -i ~/.ssh/portfolio_beam_key nginx-bpm-domain.conf.example ubuntu@IP_VPS:/tmp/
# Puis sur le VPS :
sudo cp /tmp/nginx-bpm-domain.conf.example /etc/nginx/sites-available/VOTRE_DOMAINE.fr
sudo sed -i 's/VOTRE_DOMAINE\.fr/votre-domaine-reel.fr/g' /etc/nginx/sites-available/VOTRE_DOMAINE.fr
# Ou éditer à la main :
sudo nano /etc/nginx/sites-available/VOTRE_DOMAINE.fr
```

**Étape A — Pour obtenir le certificat SSL :** commencez par un bloc **HTTP seul** (port 80), avec `root` vers le site. Certbot a besoin que le domaine réponde en HTTP sur ce serveur.

```nginx
# Bloc HTTP (obligatoire pour Certbot)
server {
    listen 80;
    listen [::]:80;
    server_name VOTRE_DOMAINE.fr www.VOTRE_DOMAINE.fr;

    root /var/www/blueprint-modular;
    index index.html;

    location = / {
        try_files /index.html =404;
        add_header Content-Type "text/html; charset=utf-8";
    }
    location = /components {
        try_files /components.html =404;
        add_header Content-Type "text/html; charset=utf-8";
    }
    location = /reference {
        try_files /reference.html =404;
        add_header Content-Type "text/html; charset=utf-8";
    }
    location / {
        try_files $uri $uri/ =404;
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

Activez le site et testez : `sudo ln -sf /etc/nginx/sites-available/VOTRE_DOMAINE.fr /etc/nginx/sites-enabled/` puis `sudo nginx -t` et `sudo systemctl reload nginx`. Passez à l’étape 4 (Certbot).

**Étape B — Après Certbot :** ajoutez le bloc HTTPS en **début de fichier** (redirection HTTP → HTTPS) et complétez avec le serveur HTTPS. Vous pouvez aussi remplacer le vhost par le contenu de **`nginx-bpm-domain-https.conf.example`** (remplacer `VOTRE_DOMAINE.fr` partout). Ou utilisez `sudo certbot --nginx -d VOTRE_DOMAINE.fr -d www.VOTRE_DOMAINE.fr` : Certbot ajoutera automatiquement le SSL au fichier existant. Vérifiez ensuite que `root` et les `location` sont bien conservés.

Exemple de configuration **complète** (une fois le certificat obtenu) :

```nginx
# Redirection HTTP → HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name VOTRE_DOMAINE.fr www.VOTRE_DOMAINE.fr;
    return 301 https://$server_name$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name VOTRE_DOMAINE.fr www.VOTRE_DOMAINE.fr;

    ssl_certificate /etc/letsencrypt/live/VOTRE_DOMAINE.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/VOTRE_DOMAINE.fr/privkey.pem;

    root /var/www/blueprint-modular;
    index index.html;

    location = / {
        try_files /index.html =404;
        add_header Content-Type "text/html; charset=utf-8";
    }
    location = /components {
        try_files /components.html =404;
        add_header Content-Type "text/html; charset=utf-8";
    }
    location = /reference {
        try_files /reference.html =404;
        add_header Content-Type "text/html; charset=utf-8";
    }
    location / {
        try_files $uri $uri/ =404;
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

Enregistrez et quittez (`Ctrl+O`, `Ctrl+X`).

---

## 4. Certificat SSL (Certbot)

Sur le VPS, **une fois le DNS propagé** et le vhost HTTP actif (étape 3) :

```bash
# Installer certbot si besoin
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Obtenir le certificat (le domaine doit déjà répondre en HTTP sur ce serveur)
sudo certbot certonly --nginx -d VOTRE_DOMAINE.fr -d www.VOTRE_DOMAINE.fr
```

Suivez les instructions (email, acceptation des conditions). Les certificats seront dans `/etc/letsencrypt/live/VOTRE_DOMAINE.fr/`.

Certbot modifie souvent le fichier Nginx pour ajouter le SSL. Vérifiez que `root /var/www/blueprint-modular` et les `location` (/, /components, /reference) sont toujours présents. Si besoin, complétez le fichier avec le bloc HTTPS de l’étape 3B, puis :

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 5. Déployer les fichiers

Depuis votre machine, **dans le dossier `blueprint-modular`** :

**Option A — Script PowerShell (Windows) :**

```powershell
cd blueprint-modular
.\deploy_blueprint_modular.ps1
```

(Adaptez `$SERVER_IP` et `$SSH_KEY` dans le script si besoin.)

**Option B — rsync (Linux / WSL) :**

```bash
cd blueprint-modular
rsync -avz -e "ssh -i $HOME/.ssh/portfolio_beam_key" \
  ./index.html ./components.html ./reference.html "./Logo BPM.png" \
  ubuntu@145.239.199.236:/var/www/blueprint-modular/
```

**Option C — SCP (Windows PowerShell) :**

```powershell
scp -i $env:USERPROFILE\.ssh\portfolio_beam_key index.html, components.html, reference.html, "Logo BPM.png" ubuntu@145.239.199.236:/var/www/blueprint-modular/
```

(Adapter l’IP si votre VPS est différent.)

Vérifier que les fichiers sont présents sur le serveur :

```bash
ssh -i ~/.ssh/portfolio_beam_key ubuntu@145.239.199.236 "ls -la /var/www/blueprint-modular"
```

---

## 6. Vérification

- **https://VOTRE_DOMAINE.fr** → page d’accueil Blueprint Modular  
- **https://VOTRE_DOMAINE.fr/components** → catalogue composants  
- **https://VOTRE_DOMAINE.fr/reference** → référence API  
- **https://VOTRE_DOMAINE.fr/Logo BPM.png** → logo

---

## 7. Dépannage

| Problème | Piste de résolution |
|----------|---------------------|
| **502 Bad Gateway** | Nginx pointe vers un backend qui ne tourne pas. Pour un site statique, `root` doit être `/var/www/blueprint-modular` et il ne doit pas y avoir de `proxy_pass` vers un port. Vérifiez le vhost. |
| **404 sur / ou /components** | Les `location = /` et `location = /components` doivent utiliser `try_files /index.html` et `try_files /components.html`. Vérifiez que les fichiers sont bien dans `/var/www/blueprint-modular/`. |
| **Certificat SSL invalide / erreur Certbot** | Le domaine doit résoudre vers l'IP du VPS *avant* de lancer Certbot. Vérifiez avec `nslookup VOTRE_DOMAINE.fr`. Le vhost HTTP (port 80) doit être actif et servi par Nginx. |
| **Page blanche ou CSS cassé** | Les liens dans les HTML sont en chemins absolus (`/`, `/components`, `/reference`). Vérifiez que le site est bien servi à la racine du domaine (pas dans un sous-dossier). |
| **Fichiers non mis à jour après déploiement** | Vérifiez les droits : `ls -la /var/www/blueprint-modular`. Nginx lit avec l'utilisateur `www-data` ; `chown ubuntu:ubuntu` est correct si vous déployez en scp/rsync avec l'utilisateur `ubuntu` (Nginx peut lire). |

---

## 8. Renouvellement du certificat SSL

Les certificats Let's Encrypt sont valables 90 jours. Le renouvellement peut être automatisé avec un cron (souvent déjà installé avec Certbot).

**Vérifier le renouvellement automatique (sur le VPS) :**

```bash
sudo systemctl status certbot.timer
# ou
sudo certbot renew --dry-run
```

Si `certbot.timer` est actif, les certificats sont renouvelés automatiquement. Sinon, renouvelez à la main avant expiration :

```bash
sudo certbot renew
sudo nginx -t && sudo systemctl reload nginx
```

---

## Résumé des commandes (à adapter)

| Étape | Commande / action |
|-------|-------------------|
| DNS OVH | Zone DNS → A @ et www → IP du VPS |
| VPS dossier | `sudo mkdir -p /var/www/blueprint-modular && sudo chown ubuntu:ubuntu /var/www/blueprint-modular` |
| Nginx (HTTP) | Créer `/etc/nginx/sites-available/VOTRE_DOMAINE.fr` avec le bloc HTTP (§ 3 étape A), activer et recharger Nginx |
| SSL | `sudo certbot certonly --nginx -d VOTRE_DOMAINE.fr -d www.VOTRE_DOMAINE.fr` |
| Nginx (HTTPS) | Compléter le vhost avec le bloc HTTPS (§ 3 étape B) ou utiliser **nginx-bpm-domain-https.conf.example** ; puis `sudo nginx -t && sudo systemctl reload nginx` |
| Déployer | Depuis `blueprint-modular` : `.\deploy_blueprint_modular.ps1` ou rsync / scp vers `/var/www/blueprint-modular/` |
| Renouvellement SSL | `sudo certbot renew` puis `sudo systemctl reload nginx` (ou laisser certbot.timer le faire) |

Si vous utilisez un autre utilisateur ou une autre IP pour le VPS, remplacez `ubuntu` et `145.239.199.236` dans le script et les commandes.
