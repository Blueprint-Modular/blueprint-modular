# Blueprint Modular — Site de documentation

Site statique de documentation **Blueprint Modular** (BPM) : landing, composants et référence API. Projet isolé pour être hébergé sur un **domaine dédié** (OVH + VPS).

---

## Projet portable — une seule copie

**Pour reprendre le projet Blueprint Modular dans une autre instance Cursor :** copiez tout le dossier **`blueprint-modular`** (ce dossier). Un seul copier-coller suffit.

Ce dossier contient tout ce qui est lié au site Blueprint Modular :
- Les **3 pages du site** (accueil, Components, API Reference) pour déploiement sur un domaine à la racine
- Les **versions pour /api/docs** (sous-dossier `api-docs/`) pour intégration dans MyPortfolio
- Les **logos** (Logo BPM.png, Logo-BPM-nom.jpg, Logo-BPM-seul.png)
- Les **scripts de déploiement** (PowerShell et Bash) et le **guide** (DEPLOIEMENT_DOMAINE.md)
- Les **exemples Nginx** (HTTP et HTTPS)

Aucune dépendance au reste du repo : vous pouvez ouvrir uniquement ce dossier dans Cursor et tout éditer, prévisualiser et déployer.

---

## Contenu du projet

| Fichier / dossier | Rôle |
|------------------|------|
| **index.html** | **Page d'accueil doc** (headline BPM, installation rapide, liens Get started / API Reference / Deploy, What's new) |
| **doc.css** | Feuille de style commune du site doc (thème BPM, accent #d4af37, dark mode) |
| **get-started/** | Installation, Fundamentals, First app |
| **api-reference/** | Text, Data, Metrics, Charts, Inputs, Layout, Panels, Media, Status, Chat, Config |
| **app.py** | Entrypoint Streamlit pour **www.blueprint-modular.com** (déploiement VPS). |
| **requirements.txt** | Dépendances Python (streamlit) pour le déploiement Streamlit. |
| **pages/** | Pages Streamlit (Get started, API Reference, Deploy). |
| **deploy/** | **Scripts de déploiement** : setup.sh, update.sh, nginx.conf, CHECKLIST.md — voir deploy/README.md. |
| **.env.example** | Exemple pour .env sur le serveur (ENVIRONMENT=production). |
| **knowledge-base/** | FAQ, Troubleshooting |
| **cheat-sheet.html** | Cheat sheet (toutes les fonctions BPM) |
| **components.html** | Ancienne page catalogue composants (conservée si besoin) |
| **reference.html** | Ancienne référence API (conservée si besoin) |
| **Logo BPM.png** | Logo Blueprint Modular (accueil domaine) |
| **Logo-BPM-nom.jpg** | Logo avec nom (landing /api/docs) |
| **Logo-BPM-seul.png** | Logo seul (nav des pages /api/docs) |
| **api-docs/** | Versions des 3 pages pour l’URL /api/docs (voir api-docs/README.txt pour copier vers frontend/public) |
| **documentation/** | README indiquant que la doc est en HTML statique à la racine (voir ci-dessous). |
| **DEPLOIEMENT_DOMAINE.md** | Guide complet : DNS, Nginx, Certbot, déploiement |
| **nginx-bpm-domain.conf.example** | Exemple de vhost Nginx (HTTP seul, pour Certbot) |
| **nginx-bpm-domain-https.conf.example** | Exemple de vhost Nginx HTTPS complet (après Certbot) |
| **deploy_blueprint_modular.ps1** | Script PowerShell : copie des fichiers statiques (index, components, reference, logos) vers le VPS. |
| **deploy_blueprint_modular_full.ps1** | Script PowerShell : déploiement complet (Streamlit + static) via archive + SSH (puis `deploy/update.sh` sur le serveur). |
| **deploy_blueprint_modular.sh** | Script Bash (Linux / WSL) équivalent (fichiers statiques). |

Les liens internes du site à la racine utilisent `/`, `/components` et `/reference`. Les fichiers dans `api-docs/` utilisent `/api/docs`, `/api/docs/components`, `/api/docs/reference`.

### Fichiers à avoir avant déploiement

Les scripts de déploiement (deploy_blueprint_modular.ps1 / .sh) attendent : `index.html`, `components.html`, `reference.html`, **Logo BPM.png**. Les logos **Logo-BPM-nom.jpg** et **Logo-BPM-seul.png** sont déjà dans ce dossier (utilisés par les pages api-docs).

- **favicon.ico** est optionnel ; s’il est présent dans le dossier, il sera inclus au déploiement. (Présent à la racine du dossier.)

## Prévisualisation en local

**Site doc statique (HTML)** — depuis ce dossier :

```bash
python -m http.server 8080
# Puis ouvrir http://localhost:8080
```

**Application Streamlit** (celle déployée sur www.blueprint-modular.com) :

```bash
pip install -r requirements.txt
streamlit run app.py
# Puis ouvrir l’URL affichée (ex. http://localhost:8501)
```

## Déploiement — www.blueprint-modular.com (Streamlit + Nginx + systemd)

Le site est déployé en **Streamlit** sur le même VPS que myportfolio.beam-consulting.

1. Lire **[deploy/CHECKLIST.md](./deploy/CHECKLIST.md)** et **[deploy/README.md](./deploy/README.md)**.
2. Sur le VPS : exécuter **deploy/setup.sh** (clone, venv, systemd), créer **.env**, configurer Nginx à partir de **deploy/nginx.conf**, lancer Certbot pour SSL.
3. Mises à jour : sur le VPS, `cd /var/www/blueprint-modular && bash deploy/update.sh`.

Repo : [github.com/remigit55/blueprint-modular](https://github.com/remigit55/blueprint-modular).

---

## Déploiement site statique (ancien / alternatif)

Pour déployer uniquement les **fichiers HTML statiques** (sans Streamlit) :

1. Lire **[DEPLOIEMENT_DOMAINE.md](./DEPLOIEMENT_DOMAINE.md)**.
2. Configurer le DNS, créer le vhost Nginx (partir de **nginx-bpm-domain.conf.example**), Certbot, puis déployer les fichiers avec **deploy_blueprint_modular.ps1** ou **deploy_blueprint_modular.sh** (variables SERVER_IP, SSH_KEY à adapter).

## Projet isolé (Cursor / VS Code)

Pour travailler uniquement sur Blueprint Modular sans charger tout le repo MyPortfolio : **Fichier → Ouvrir le dossier** → sélectionner le dossier **`blueprint-modular`** (et non la racine du repo). Tout le nécessaire pour éditer les HTML, prévisualiser et déployer est ici ; aucune dépendance Node ou Python n'est requise pour le site statique. Voir aussi la section **Projet portable** en tête de ce README.
