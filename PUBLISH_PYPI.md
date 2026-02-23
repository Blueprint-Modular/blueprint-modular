# Publier blueprint-modular sur PyPI

**État actuel :** le package est publié sur PyPI. Installation : `pip install blueprint-modular`.  
Page projet : https://pypi.org/project/blueprint-modular/

---

## Option 1 : Trusted Publishing (en place, sans token)

1. **Sur PyPI** : section **Publishing** → Trusted publisher configuré avec :
   - **Owner :** `remigit55`
   - **Repository name :** `blueprint-modular`
   - **Workflow name :** `workflow.yml`
   - **Environment name (optional) :** laisser vide ou `pypi` (le workflow n’utilise pas d’environnement GitHub)

2. **Publier une nouvelle version** : incrémenter la version (voir ci-dessous), commit, puis pousser un tag `v*`. Le workflow `.github/workflows/workflow.yml` build et envoie sur PyPI.
   ```bash
   git tag v0.1.3
   git push origin v0.1.3
   ```

## Option 2 : Publication manuelle (token)

## Vérifier que le nom est disponible

```bash
pip index versions blueprint-modular 2>/dev/null || echo "Nom disponible"
```

## Test sur TestPyPI (recommandé)

```bash
# Upload
python -m twine upload --repository testpypi dist/*
# Username: __token__
# Password: (votre token TestPyPI, préfixe pypi-)

# Tester l'installation depuis TestPyPI
pip install --index-url https://test.pypi.org/simple/ blueprint-modular
bpm --version
# → blueprint-modular 0.1.0
```

## Publication sur PyPI

1. Créer un compte sur https://pypi.org/account/register/ (2FA obligatoire).
2. Générer un API token : https://pypi.org/manage/account/token/
3. Upload :

```bash
python -m twine upload dist/*
# Username: __token__
# Password: (votre token PyPI)
```

## Vérification après publication

```bash
pip install blueprint-modular
bpm --version
bpm --help
bpm init --name test-app
cd test-app
bpm run app.py
```

Page du projet : https://pypi.org/project/blueprint-modular/

## Mise à jour de version

1. Modifier la version dans :
   - `pyproject.toml` : `version = "0.1.3"`
   - `bpm/__init__.py` : `__version__ = "0.1.3"`
   - `bpm/cli.py` : utilise `__version__` de `bpm`, pas de doublon

2. Commit + push, puis créer et pousser le tag (publication automatique via le workflow) :
   ```bash
   git add pyproject.toml bpm/__init__.py
   git commit -m "chore: version 0.1.3"
   git push origin master
   git tag v0.1.3
   git push origin v0.1.3
   ```

PyPI n'accepte pas d'écraser une version existante : toujours incrémenter avant de re-publier.
