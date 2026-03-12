# blueprint-maker — skills de génération .Maker

Ce dossier contient les **skills** utilisés par le service .Maker pour générer des apps BPM (tableaux de bord KPI, etc.).

## Emplacement des skills

- **`lib/generator/MAKER_SKILL.md`** — Patterns de génération (verbatim). Contient le pattern KPI Dashboard (bpm.pageLayout, vues Overview/Détail/Historique, bpm.metric, bpm.plotlyChart, bpm.table).
- **`lib/generator/BPM_API.md`** — Contrat interface composants (bpm.metric, bpm.pageLayout, bpm.plotlyChart, bpm.table, etc.) avec props et exemples.
- **`lib/generator/CRITICAL_RULES.md`** — Règles non négociables (vues obligatoires XxxView(), bpm.plotlyChart uniquement, Material Symbols, 0 violation bloquante).
- **`lib/generator/MAKER_SKILL_DATA.md`** — Données fictives sectorielles (industrie, retail, services) pour KPIs réalistes en français.

## Build et déploiement

Si blueprint-maker est un package Node séparé (avec `package.json` à la racine de ce dossier) :

```bash
cd blueprint-maker
npm run build
```

Commit et push (depuis le repo qui contient blueprint-maker, ex. blueprint-modular) :

```bash
git add -A && git commit -m "feat: pattern KPI Dashboard calibré + données KPI sectorielles"
git push origin main   # ou master selon la branche par défaut
```

Déploiement sur bpm-prod (SSH) :

```bash
ssh bpm-prod
cd ~/blueprint-maker && git pull && npm ci && npm run build && pm2 restart blueprint-maker && pm2 save
```

*Si blueprint-maker est uniquement un sous-dossier du repo blueprint-modular (sans package.json ici), le build s’effectue depuis la racine du monorepo ; les skills sont déjà versionnés dans blueprint-modular.*
