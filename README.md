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

## Structure du projet (frontend / backend)

| Dossier / fichier | Rôle |
|-------------------|------|
| **frontend/** | Tout le code client (UI, doc, composants). |
| **frontend/bpm/** | Composants React BPM + composants doc (DocNav, DocSidebar, DocLayout, CodeBlock). |
| **frontend/doc-app/** | Site doc en React (recommandé). Build : `cd frontend/doc-app && npm run build` → `dist/`. |
| **frontend/static/** | Site doc HTML statique : index.html, doc.css, get-started/, api-reference/, deploy/, knowledge-base/, cheat-sheet, components, reference. |
| **frontend/api-docs/** | Pages pour l'URL /api/docs (MyPortfolio). |
| **backend/** | Réservé au code serveur (API, etc.). Aucun backend pour l'instant — voir backend/README.md. |
| **deploy/** | Scripts de déploiement : setup.sh, update.sh, nginx.conf. |
| **Logo BPM.png**, **Logo-BPM-*** | Logos (racine). |
| **app.py**, **pages/** | Ancienne app de démo (référence). |
| **deploy_blueprint_modular.ps1** | Déploie **frontend/static/** + Logo vers le VPS. |
| **DEPLOIEMENT_DOMAINE.md** | Guide : DNS, Nginx, Certbot. |

*(Ancienne liste détaillée ci-dessous.)*

| Fichier / dossier | Rôle |
|------------------|------|
| **index.html** (dans frontend/static/) | **Page d'accueil doc** (headline BPM, installation rapide, liens Get started / API Reference / Deploy, What's new) |
| **doc.css** | Feuille de style commune du site doc (thème BPM, accent #d4af37, dark mode) |
| **get-started/** | Installation, Fundamentals, First app |
| **api-reference/** | Text, Data, Metrics, Charts, Inputs, Layout, Panels, Media, Status, Chat, Config |
| **bpm/** | Composants React BPM (Button, Panel, Table, etc.) + **composants doc** : DocNav, DocSidebar, DocLayout, CodeBlock. |
| **doc-app/** | **Site doc en React** : utilise uniquement les composants BPM. Build : `cd doc-app && npm run build` → `dist/`. |
| **app.py**, **pages/** | Ancienne app de démo (conservée pour référence) — **non utilisée** ; la doc est dans **doc-app**. |
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
| **deploy_blueprint_modular_full.ps1** | Script PowerShell : déploiement complet (app + static) via archive + SSH (puis `deploy/update.sh` sur le serveur). |
| **deploy_blueprint_modular.sh** | Script Bash (Linux / WSL) équivalent (fichiers statiques). |

Les liens internes du site à la racine utilisent `/`, `/components` et `/reference`. Les fichiers dans `api-docs/` utilisent `/api/docs`, `/api/docs/components`, `/api/docs/reference`.

### Fichiers pour le déploiement

Le script **deploy_blueprint_modular.ps1** déploie **frontend/static/** et **Logo BPM.png** (Ã  la racine). **favicon.ico** Ã  la racine est optionnel.

## Prévisualisation en local

**Site doc statique (HTML)** — depuis le dossier des fichiers statiques :

```bash
cd frontend/static && python -m http.server 8080
# Puis ouvrir http://localhost:8080
```

**Site doc (React + BPM)** — recommandé :

```bash
cd frontend/doc-app && npm install && cp "../../Logo BPM.png" "public/Logo BPM.png" && npm run dev
# Puis ouvrir l’URL affichée (http://localhost:5173)
```

## Déploiement — www.blueprint-modular.com (fichiers statiques)

Le site doc est construit avec les **composants BPM** (React) dans **frontend/doc-app/**.

1. En local : `cd frontend/doc-app && npm run build` → les fichiers sont dans **frontend/doc-app/dist/**.
2. Déployer **frontend/doc-app/dist/** vers le VPS, ou utiliser **deploy_blueprint_modular.ps1** (depuis Windows) pour le site **HTML statique** (**frontend/static/**), ou **deploy/deploy-from-git.sh** (sur le serveur, après clone du repo — voir **deploy/README.md**).
3. Nginx : servir les fichiers statiques (voir **deploy/nginx.conf** : `root` + `try_files`).

Repo : [github.com/remigit55/blueprint-modular](https://github.com/remigit55/blueprint-modular).

---

## Déploiement site statique (ancien / alternatif)

Pour déployer uniquement les **fichiers HTML statiques** :

1. Lire **[DEPLOIEMENT_DOMAINE.md](./DEPLOIEMENT_DOMAINE.md)**.
2. Configurer le DNS, créer le vhost Nginx (partir de **nginx-bpm-domain.conf.example**), Certbot, puis déployer les fichiers avec **deploy_blueprint_modular.ps1** ou **deploy_blueprint_modular.sh** (variables SERVER_IP, SSH_KEY à adapter).

## Projet isolé (Cursor / VS Code)

Pour travailler uniquement sur Blueprint Modular sans charger tout le repo MyPortfolio : **Fichier → Ouvrir le dossier** → sélectionner le dossier **`blueprint-modular`** (et non la racine du repo). Tout le nécessaire pour éditer les HTML, prévisualiser et déployer est ici ; aucune dépendance Node ou Python n'est requise pour le site statique. Voir aussi la section **Projet portable** en tête de ce README.
