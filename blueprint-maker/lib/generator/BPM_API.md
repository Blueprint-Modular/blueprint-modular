# Contrat interface composants BPM — .Maker

Référence pour la génération d’apps (tableaux de bord KPI, etc.). Seules les props documentées ici sont garanties supportées.

---

## bpm.metric

Affiche un indicateur avec libellé, valeur et évolution (delta). **Obligatoire** pour tout KPI dans un tableau de bord.

| Prop | Type | Requis | Description |
|------|------|--------|-------------|
| label | string | Oui | Libellé affiché au-dessus de la valeur (ex. "TRS", "Chiffre d'affaires"). |
| value | string \| number | Oui | Valeur principale. Ex. `78`, `"78 %"`, `142500`. |
| delta | number \| string \| null | Non | Variation affichée. Ex. `1.2` (→ +1,2), `-0.5`, `"+12%"`. Interprétation : positif = vert (normal), négatif = rouge (normal) sauf si deltaType="inverse". |
| deltaType | "aucun" \| "normal" \| "inverse" | Non | normal = + vert / - rouge ; inverse = + rouge / - vert (ex. coûts). Défaut : normal. |
| currency | string | Non | Unité pour le delta. Ex. `"%"`, `"EUR"`, `""`. Défaut : EUR. |
| name | string | Non | Nom pour référencer la métrique (chat IA : $metric:name, @name). |
| valueLocale | string | Non | Locale format nombre (ex. "fr-FR", "en-US"). Défaut : fr-FR. |
| valueDecimals | number | Non | Nombre de décimales pour value. Défaut : 0. |
| valueGrouping | boolean | Non | Séparateur de milliers. Défaut : true. |
| border | boolean | Non | Bordure autour de la métrique. Défaut : true. |
| subtext | string \| null | Non | Micro-info sous la métrique (gris). |
| compact | boolean | Non | Hauteur réduite (~80px). |

**Exemples (Python/JSX alignés) :**
- `bpm.metric(label="TRS", value="78 %", delta=1.2, currency="%")` — tendance positive
- `bpm.metric(label="Taux rebut", value="1.8 %", delta=-0.2, deltaType="inverse", currency="%")`
- `bpm.metric(label="MTTR", value="2.4 h", delta=-0.3)` — pas d’unité devise
- Pas de prop `trend` dans l’API actuelle : la tendance est déduite de `delta` (+ = up, - = down).

---

## bpm.metricRow

Ligne horizontale de KPIs. Parent recommandé pour une grille de bpm.metric en vue Overview.

| Prop | Type | Requis | Description |
|------|------|--------|-------------|
| children | ReactNode | Oui | Un ou plusieurs bpm.metric. |

Exemple : `bpm.metricRow({ children: <> {bpm.metric(...)} {bpm.metric(...)} </> })`.

---

## bpm.pageLayout

Layout avec sidebar repliable, titre et zone de contenu. **Obligatoire** pour une app type tableau de bord multi-vues.

| Prop | Type | Requis | Description |
|------|------|--------|-------------|
| title | string | Oui | Titre affiché en haut de la sidebar. |
| items | SidebarItem[] | Oui | Entrées du menu. Chaque item : { key, label, icon }. |
| currentItem | string | Oui | Clé de l’entrée active (ex. "overview", "detail", "historique"). |
| onNavigate | (key: string) => void | Oui | Callback à la sélection d’une entrée. |
| children | ReactNode | Oui | Contenu principal (souvent le rendu de la vue courante). |
| defaultCollapsed | boolean | Non | Sidebar repliée par défaut. Défaut : false. |
| theme | "light" \| "dark" | Non | Thème courant (affiche bouton thème si onThemeChange fourni). |
| onThemeChange | (theme: "light" \| "dark") => void | Non | Callback changement de thème. |

**SidebarItem :** `{ key: string, label: string, icon: string }`. **icon** : nom Material Symbols en snake_case (ex. `dashboard`, `table_chart`, `trending_up`). Jamais d’emojis.

Exemple : `bpm.pageLayout(title="Tableau de bord KPI", items=SIDEBAR_ITEMS, currentItem=current, onNavigate=set_current, children=render_current_view(current))`.

---

## bpm.plotlyChart

Graphique Plotly. **À utiliser pour toutes les tendances** (courbes, barres, time-series). Pas de bpm.lineChart / barChart / areaChart en production.

| Prop | Type | Requis | Description |
|------|------|--------|-------------|
| data | object[] | Oui* | Tableau de traces Plotly. *Obligatoire sauf si iframeSrc fourni. |
| layout | object | Non | Config layout (title, xaxis, yaxis, margin, etc.). |
| config | object | Non | Config Plotly (responsive, displayModeBar, etc.). |
| height | number | Non | Hauteur en pixels. Défaut : 380. |
| width | number \| string | Non | Largeur. Défaut : "100%". |
| iframeSrc | string | Non | URL iframe (compatibilité). |
| className | string | Non | Classes CSS. |

**Trace time-series (tendance) — exemple :**
```python
data=[{
    "x": ["Sem. 1", "Sem. 2", "Sem. 3", "Sem. 4"],
    "y": [75.2, 76.8, 77.1, 78.0],
    "type": "scatter",
    "name": "TRS",
    "mode": "lines+markers",
}]
layout={"title": "Évolution TRS", "xaxis": {"title": "Semaine"}, "yaxis": {"title": "TRS (%)"}}
height=320
```
Ne pas passer `data=[]` : afficher un message ou un guard (chartsReady) si pas de données.

---

## bpm.table

Tableau triable pour drill-down (détail par ligne, site, période, etc.).

| Prop | Type | Requis | Description |
|------|------|--------|-------------|
| columns | TableColumn[] | Oui | Définition des colonnes (key, label, optionnellement render). |
| data | Record<string, unknown>[] | Oui | Tableau de lignes. **Interdit :** JSX dans data[] — utiliser render dans TableColumn. |
| striped | boolean | Non | Lignes alternées. |
| hover | boolean | Non | Surlignage au survol. |
| onRowClick | (row) => void | Non | Callback au clic sur une ligne. |
| valueLocale | string | Non | Locale pour les nombres (ex. "fr-FR"). |
| valueDecimals | number | Non | Décimales par défaut. |
| valueGrouping | boolean | Non | Séparateur de milliers. Défaut : true. |
| emptyMessage | string | Non | Message si data vide. Défaut : "Aucune donnée disponible". |

**TableColumn :** `{ key: string, label: string, align?: "left"|"center"|"right", render?: (value, row) => ReactNode, decimals?, noWrap?, className? }`. Pour une colonne statut, utiliser **render** qui retourne bpm.badge(...). **INTERDIT :** `renderCell` (non supporté par Table.tsx — utiliser `render`).

Exemple : `bpm.table(columns=[{"key": "ligne", "label": "Ligne"}, {"key": "trs", "label": "TRS"}], data=[{"ligne": "L1", "trs": "78.2 %"}, ...])`.

---

## bpm.grid

Grille responsive pour disposer métriques ou cartes.

| Prop | Type | Requis | Description |
|------|------|--------|-------------|
| cols | number \| object | Non | Nombre de colonnes ou breakpoints (xs, sm, md, lg). |
| gap | number \| string | Non | Espacement entre cellules. |
| children | ReactNode | Non | Contenu (ex. bpm.metric, bpm.card). |

---

## bpm.title / bpm.title2

Titres de section. bpm.title2 pour sous-titres (niveau 2). Props : children (texte), optionnellement level pour bpm.title.

---

*Ce fichier couvre les composants nécessaires au pattern KPI Dashboard. Pour la liste complète des composants BPM, voir la référence générée (ex. llms.txt / registry).*
