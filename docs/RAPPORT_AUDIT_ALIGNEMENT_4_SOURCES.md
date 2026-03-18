# Rapport — alignement 4 sources de vérité (2026-03-18)

## Sources

1. **Barrel** `packages/core/src/bpm.tsx` — liste des clés `bpm.*`
2. **`/components`** — `app/(public)/components/page.tsx`
3. **`/docs/components/*`** — ex. `app/(app)/docs/components/table/page.tsx`
4. **`public/llms.txt`** — généré par `scripts/generate-llms-txt.py`

## Divergences identifiées et corrections

| Composant / zone | Source | Problème | Correction |
|------------------|--------|----------|------------|
| Barrel → llms | `generate-llms-txt.py` | Regex `wrap(` ignorait `wrap<Props>(` → **title**, **chat**, **metricRow** absents de llms | Regex `wrap(?:<[^>]+>)?\(` |
| Barrel → llms | idem | **page** absent (pas de `wrap(`) | Détection `page: (` + entrée `PageProps` |
| Barrel → llms | idem | **toast** sans interface exportée | Bloc manuel props (message, type, onClose, …) |
| title1–4 | llms | Fichiers `Title1.tsx` … inexistants | Alias → `Title.tsx` + note niveau implicite |
| Règles globales | llms header | « renderCell dans columns » (faux vs `Table.tsx`) | **render** + INTERDIT renderCell |
| bpm.table | docs | `data` documenté non requis ; `Column[]` ; pas de `render` | Props alignées `Table.tsx` |
| bpm.table | BPM_API.md | Pas d’interdit explicite renderCell | Ligne INTERDIT renderCell |
| Comptage | CRITERES_SORTIE | « 94 » obsolète | **98** entrées barrel |

## Inventaire barrel (98 clés)

`page`, `title`, `title1`–`title4`, `titleBpm`, `metricRow`, `metric`, `table`, `chat`, `chatInterface`, + 88 autres (`accordion` … `video`), incl. `spinner`, `tabs`.

## Dérivé Maker

`blueprint-maker/lib/generator/BPM_API.md` — section **bpm.table** / TableColumn alignée sur llms (prop **render**, pas renderCell).
