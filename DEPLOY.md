# Déploiement en production

## Checklist rapide

| Étape | Où / Comment |
|-------|----------------|
| **Migration Prisma** | Sur le **VPS** (où `DATABASE_URL` est défini) : exécutée automatiquement par `deploy-from-git.sh` lors du déploiement. Sinon à la main : `npx prisma migrate deploy`. |
| **Publication PyPI** | `git push origin v0.1.21` (déclenche le workflow GitHub → PyPI). |
| **Déploiement de l’app** | 1) Pousser les commits sur `master`. 2) Sur le VPS : `git pull && ./deploy/deploy-from-git.sh` — ou depuis Windows : `.\scripts\deploy-vps-remote.ps1`. Le script fait `npm run build`, `npx prisma migrate deploy`, puis redémarre PM2. |

---

## Version alignée (0.1.21)

La version **0.1.21** est alignée dans :
- `package.json` (app Next.js)
- `pyproject.toml` (package Python)
- `bpm/__init__.py` (`__version__`)
- Footer de l’app (`components/AppLayoutClient.tsx`)

---

## 1. Migration Prisma

Avec une base PostgreSQL configurée (`DATABASE_URL` dans `.env` ou l’environnement) :

```bash
npx prisma migrate deploy
```

En dev :

```bash
npx prisma migrate dev
```

Les migrations présentes (dont `20260226100000_wiki_author_template_optional`) ajoutent les champs `author_name`, `template` et rendent `author_id` optionnel sur les révisions/commentaires.

---

## 2. Build production (Next.js)

```bash
npm run build
```

Puis démarrer en production :

```bash
npm run start
```

---

## 3. Publication sur PyPI

Le projet utilise **Trusted Publishing** (workflow GitHub). Pour publier la version **0.1.21** :

1. Vérifier que les changements sont commités et poussés sur `master` (ou la branche par défaut).
2. Créer et pousser le tag :

```bash
git tag v0.1.21
git push origin v0.1.21
```

Le workflow `.github/workflows/workflow.yml` se déclenche au push du tag, build le package Python et le publie sur PyPI.

Vérification après publication :

```bash
pip install blueprint-modular
bpm --version
# → blueprint-modular 0.1.21
```

---

## 4. RAG / pgvector (optionnel)

La recherche sémantique (`POST /api/wiki/semantic-search`) utilise actuellement un **fallback full-text**. Pour un vrai RAG avec pgvector :

1. Configurer pgvector sur PostgreSQL et ajouter la colonne `embedding` (type `vector(1536)` ou équivalent).
2. Alimenter les embeddings à la sauvegarde des articles (service d’embedding type Ollama).
3. Adapter la route `semantic-search` pour une recherche par similarité cosine sur la colonne `embedding`.

Sans pgvector, l’app fonctionne normalement avec la recherche full-text.
