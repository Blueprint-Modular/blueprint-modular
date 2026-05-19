# Erreur : Mauvais Repository Actif — SVG Generator v3 (Otl Aicher)

**Date** : 2026-05-19
**Branche** : `cursor/feat/svg-gen-v3-aicher-5aff`
**Mission demandée** : Créer un SVG generator pour le designer Otl Aicher dans `lib/design/motifs/`, en suivant le pattern des SVG generators existants, puis tester la génération du motif.

## Constat

Le check obligatoire défini dans `AGENTS.md` section 0.4 échoue :

```bash
test -f lib/design/designer-database.json && test -f lib/design/designer-resolver.ts && echo "REPO_OK_MAKER" || echo "CHECK_REPO"
# → CHECK_REPO
```

### Résultats de validation

| Vérification | Commande | Résultat |
|--------------|----------|----------|
| `lib/design/designer-database.json` | `test -f …` | absent |
| `lib/design/designer-resolver.ts` | `test -f …` | absent |
| `lib/design/motifs/` (dossier cible de la mission) | `find . -type d -name motifs` | absent |
| Mention "Aicher" / "Otl" dans le code | `grep -ri "aicher\|otl"` | aucune correspondance |
| Mention "SVG generator" / `svg-gen` | `grep -ri "svg.gen\|svgGen"` | aucune correspondance |

**5 sur 5 validations ont échoué.** Aucun élément du pipeline designer / motifs n'existe dans ce repo.

### Identification du repo actif

- **Répertoire de travail** : `/workspace`
- **Remote** : `github.com/Blueprint-Master/blueprint-modular`
- **Nom du repo** : `blueprint-modular` (bibliothèque UI `bpm.*`, `@blueprint-modular/core`)

## Contexte des deux repos

| Repo | Rôle | Contient `lib/design/motifs/` ? |
|------|------|----------------------------------|
| `blueprint-modular` | Système de composants UI `bpm.*` | NON |
| `blueprint-maker` | App génératrice, pipeline designer/motifs | OUI (attendu) |

La mission concerne le pipeline déterministe de génération de motifs SVG décrit dans `AGENTS.md` section 11.3 (« Design language pipeline »), qui vit dans `blueprint-maker/lib/design/` et `blueprint-maker/lib/builder/`. Ce code n'est pas vendu dans `blueprint-modular`.

## Conformité AGENTS.md

- Section 0.5 : « Si le check retourne `CHECK_REPO`, arrête-toi et demande clarification à l'utilisateur avant toute modification. »
- Section 3.2 : interdit de modifier sans lecture préalable des fichiers concernés — fichiers ici inexistants.
- Section 3.3 : escalade quand « le contexte fourni est insuffisant pour décider de la cause racine ».

Cette PR est ouverte en **draft** uniquement pour porter le diagnostic et la trace de la mission non exécutée. Aucun fichier de production n'est modifié.

## Précédent

Cas identique déjà documenté dans `docs/error-wrong-repo.md` (commits `7c50011`, `aa1be05`) pour une mission diagnostic Builder→CSS. Le présent fichier suit la même convention.

## Action requise (humain)

Pour exécuter la mission :

1. Relancer la mission dans le repo `blueprint-maker` :

   ```bash
   git clone git@github.com:Blueprint-Master/blueprint-maker.git
   cd blueprint-maker
   # Vérifier la présence du pipeline designer
   test -f lib/design/designer-database.json && test -f lib/design/designer-resolver.ts && echo "REPO_OK_MAKER"
   ls lib/design/motifs/
   ```

2. Fournir à l'agent (en plus de la mission) :
   - La liste des SVG generators existants dans `lib/design/motifs/` (au moins un servant de pattern de référence).
   - La spec « SVG generator v3 » : signature attendue, format de sortie, contrat avec `designer-resolver.ts`.
   - La fiche designer « Otl Aicher » dans `designer-database.json` (palette, grille, typographie, contraintes graphiques).

Sans ces éléments, l'implémentation conduirait à du code spéculatif, contraire à `AGENTS.md` section 1.2 (« Pas de raccourci, pas de hack »).

## Mission non exécutée

Conformément à AGENTS.md section 0.5, aucune analyse ni modification n'a été tentée dans le mauvais repo.

---

*Document généré automatiquement suite à l'échec de la validation initiale obligatoire.*
