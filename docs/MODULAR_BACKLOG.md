# Blueprint Modular — Backlog (réf. Mirror)

Document de référence pour l’audit v0.1 → v0.2 et les priorités issues du retour Mirror.

## Contexte

- **Package** : `@blueprint-modular/core` (objet `bpm.*`).
- **Composants** : implémentés dans `components/bpm/`, exportés via `packages/core/src/bpm.tsx`.
- **Usage cible** : apps générées (Maker), sandbox, docs ; le LLM (Claude, etc.) doit pouvoir les utiliser sans exemple pour les cas courants.

## Priorités v0.2 (issues du backlog Mirror)

| Priorité | Composant / thème | Description |
|----------|-------------------|-------------|
| P1 | **bpm.liveTable({ source, interval })** | Table avec fetch + polling intégré ; évite le boilerplate useState/useEffect/fetch partout. |
| P2 | **bpm.gauge({ value, min, max, thresholds })** | Jauge avec seuils colorés (ex. vert / orange / rouge) ; complète Progress/Metric. |
| P3 | **bpm.alertBanner({ message, severity, blinking })** | Bannière d’alerte persistante (différent de Message toast) ; severity = info | warning | error. |
| P4 | **bpm.sparkline({ data, color })** | Mini graphique inline (ligne ou barres) ; pour cellules de tableau ou cartes. |
| P5 | **bpm.tokens** | Exposition des design tokens (couleurs, espacements) pour éliminer les inline styles dans le code généré. |

## Thèmes transverses (audit v0.1)

- **Loading / error** : combien de composants gèrent leur propre état loading/error ? Sinon → boilerplate garanti côté app.
- **API cohérente** : même niveau de granularité (objet de props, noms de props) entre composants similaires.
- **Cas limites** : liste vide, erreur, loading ; utilisation sans exemple par un LLM.
