# Patterns de génération — .Maker

Philosophie : **patterns verbatim > règles déclaratives**. Le générateur s’appuie sur des squelettes de code exacts pour les types d’app demandés.

---

## PATTERN KPI DASHBOARD

Pour le prompt « tableau de bord KPI » (ou équivalent), générer une app avec :

1. **bpm.pageLayout** en racine, avec navigation entre au moins trois vues : **Overview** (synthèse), **Détail** (drill-down), **Historique** (tendances).
2. **Vues obligatoires** : une fonction/vue par section, nommée explicitement — `OverviewView()`, `DetailView()`, `HistoriqueView()` (voir CRITICAL_RULES.md).
3. **bpm.metric** pour chaque KPI : `label`, `value`, `delta` (évolution), et si l’API le permet indication de tendance. Pas de valeur en dur sans label ni delta quand une évolution a du sens.
4. **bpm.plotlyChart** pour les tendances (time-series) : données avec abscisses temporelles ou catégories, une trace minimum.
5. **bpm.table** pour le drill-down (liste de lignes détaillées, ex. par site, par produit, par période).

Structure cible (squelette) :

```python
# Navigation : clés alignées avec items du pageLayout
SIDEBAR_ITEMS = [
    {"key": "overview", "label": "Overview", "icon": "dashboard"},
    {"key": "detail", "label": "Détail", "icon": "table_chart"},
    {"key": "historique", "label": "Historique", "icon": "trending_up"},
]

def OverviewView():
    # Grille de KPIs : bpm.metric avec value, label, delta
    bpm.metricRow(children=[
        bpm.metric(label="TRS", value="78 %", delta=1.2, currency="%"),
        bpm.metric(label="Taux rebut", value="1.8 %", delta=-0.2, currency="%"),
        bpm.metric(label="Disponibilité", value="91 %", delta=0.5, currency="%"),
        bpm.metric(label="MTTR", value="2.4 h", delta=-0.3),
    ])
    # Optionnel : bpm.title2("Synthèse") au-dessus

def DetailView():
    # Drill-down : bpm.table avec colonnes pertinentes
    bpm.title2("Détail par ligne")
    bpm.table(columns=[
        {"key": "ligne", "label": "Ligne"},
        {"key": "trs", "label": "TRS"},
        {"key": "statut", "label": "Statut"},
    ], data=[
        {"ligne": "L1", "trs": "78.2 %", "statut": "OK"},
        {"ligne": "L2", "trs": "76.1 %", "statut": "OK"},
        {"ligne": "L3", "trs": "72.0 %", "statut": "Maintenance"},
    ])

def HistoriqueView():
    # Tendances : bpm.plotlyChart avec time-series
    bpm.title2("Évolution TRS")
    bpm.plotlyChart(
        data=[{
            "x": ["Sem. 1", "Sem. 2", "Sem. 3", "Sem. 4"],
            "y": [75.2, 76.8, 77.1, 78.0],
            "type": "scatter",
            "name": "TRS",
            "mode": "lines+markers",
        }],
        layout={"title": "TRS sur 4 semaines", "xaxis": {"title": "Semaine"}, "yaxis": {"title": "TRS (%)"}},
        height=320,
    )

# Page principale : rendu conditionnel selon currentItem
def main():
    current = state_current_item()  # ex. "overview" | "detail" | "historique"
    bpm.pageLayout(
        title="Tableau de bord KPI",
        items=SIDEBAR_ITEMS,
        currentItem=current,
        onNavigate=set_current_item,
        children=render_current_view(current),
    )

def render_current_view(current):
    if current == "overview": return OverviewView()
    if current == "detail": return DetailView()
    if current == "historique": return HistoriqueView()
    return OverviewView()
```

Données fictives : utiliser MAKER_SKILL_DATA.md (secteurs industrie, retail, services) pour des valeurs et fourchettes réalistes en français.

Règles associées : CRITICAL_RULES.md (vues nommées, bpm.plotlyChart uniquement, icons Material Symbols, 0 violation bloquante, 0 warning CSS).
