# Règles non négociables — .Maker

- **Vues obligatoires** : toute app avec plusieurs sections (ex. tableau de bord KPI) doit exposer une **vue nommée** par section. Pattern : `OverviewView()`, `DetailView()`, `HistoriqueView()` — une fonction/vue par entrée de navigation, le contenu de `bpm.pageLayout` est le rendu de la vue courante (ex. `currentItem === "overview"` → `OverviewView()`).
- **Composants graphiques** : `bpm.plotlyChart` UNIQUEMENT pour les tendances et courbes. Jamais `bpm.lineChart`, `bpm.barChart`, `bpm.areaChart` en production (alias ou composants legacy).
- **Métriques** : chaque KPI doit utiliser `bpm.metric` avec `label`, `value`, `delta` (si évolution), et si l’API le permet `trend` (ex. "up" | "down" | "neutral"). Pas de div/span custom pour afficher une valeur KPI.
- **Navigation** : `bpm.pageLayout` avec `items` (key, label, icon). `icon` : valeurs **Material Symbols** en snake_case uniquement (ex. `dashboard`, `insights`, `history`) — jamais d’emojis.
- **CSS** : aucun token CSS personnalisé en dehors de `var(--bpm-*)`. Pas de couleurs en dur (hex/rgb) pour fonds, textes, bordures. 0 warning tokens.
- **Violations bloquantes** : 0. Toute sortie qui introduit un composant inexistant, une prop non documentée dans BPM_API.md, ou une structure sans vue nommée pour une section est rejetée.
