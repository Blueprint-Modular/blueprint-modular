# Déploiement en production

## Checklist rapide

| Étape | Où / Comment |
|-------|----------------|
| **Version** | Source unique : `package.json`. Après modification : `npm run version:sync`. |
| **Migration Prisma** | Sur le **VPS** (où `DATABASE_URL` est défini) : exécutée automatiquement par `deploy-from-git.sh` lors du déploiement. Sinon à la main : `npx prisma migrate deploy`. |
| **Publication PyPI** | `git tag vX.Y.Z` puis `git push origin vX.Y.Z`. Incrémenter si version déjà sur PyPI. |
| **Déploiement de l’app** | 1) Push sur `master`. 2) Depuis Windows : `.\scripts\deploy-vps-remote.ps1` — ou sur le VPS : `git pull && ./deploy/deploy-from-git.sh`. Vitrine + doc + build Next.js + Prisma migrate + PM2. |

---

## Version alignée

Source unique : **`package.json`**. Après `npm run version:sync` : `pyproject.toml`, `bpm/__init__.py`, doc statique, et app (footer via `lib/version.ts`).

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

Le projet utilise **Trusted Publishing** (workflow GitHub). Pour publier une version (ex. **0.1.22**) :

1. Incrémenter la version dans `package.json`, puis lancer `npm run version:sync`.
2. Commit, push sur `master`, puis créer et pousser le tag :

```bash
git tag v0.1.22
git push origin v0.1.22
```

Le workflow `.github/workflows/workflow.yml` se déclenche au push du tag, build le package Python et le publie sur PyPI. **PyPI n'accepte pas d'écraser une version existante** : toujours incrémenter avant de republier.

Vérification après publication :

```bash
pip install blueprint-modular
bpm --version
# → blueprint-modular 0.1.22
```

---

## 4. RAG / pgvector (optionnel)

La recherche sémantique (`POST /api/wiki/semantic-search`) utilise actuellement un **fallback full-text**. Pour un vrai RAG avec pgvector :

1. Configurer pgvector sur PostgreSQL et ajouter la colonne `embedding` (type `vector(1536)` ou équivalent).
2. Alimenter les embeddings à la sauvegarde des articles (service d’embedding type Ollama).
3. Adapter la route `semantic-search` pour une recherche par similarité cosine sur la colonne `embedding`.

Sans pgvector, l’app fonctionne normalement avec la recherche full-text.
