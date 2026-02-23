"""
Registry of BPM components for documentation.
Single source of truth: used to generate lib/generated/bpm-components.json for the Next.js app.
Run: python scripts/generate-bpm-components-json.py
"""
from typing import TypedDict


class ComponentDoc(TypedDict):
    slug: str
    name: str
    description: str
    category: str


# Order defines prev/next navigation in docs. Categories grouped for display.
COMPONENT_DOC: list[ComponentDoc] = [
    # Affichage de données
    {"slug": "metric", "name": "bpm.metric", "description": "Métrique avec valeur, label et delta.", "category": "Affichage de données"},
    {"slug": "table", "name": "bpm.table", "description": "Tableau triable avec lignes alternées.", "category": "Affichage de données"},
    {"slug": "title", "name": "bpm.title", "description": "Titre niveaux 1 à 4.", "category": "Affichage de données"},
    {"slug": "badge", "name": "bpm.badge", "description": "Badge / étiquette (success, warning, etc.).", "category": "Affichage de données"},
    {"slug": "progress", "name": "bpm.progress", "description": "Barre de progression.", "category": "Affichage de données"},
    {"slug": "skeleton", "name": "bpm.skeleton", "description": "Placeholder de chargement (skeleton).", "category": "Affichage de données"},
    # Mise en page
    {"slug": "panel", "name": "bpm.panel", "description": "Panneau informatif (info, success, warning, error).", "category": "Mise en page"},
    {"slug": "tabs", "name": "bpm.tabs", "description": "Onglets pour organiser le contenu.", "category": "Mise en page"},
    {"slug": "expander", "name": "bpm.expander", "description": "Bloc repliable.", "category": "Mise en page"},
    {"slug": "accordion", "name": "bpm.accordion", "description": "Accordéon (sections repliables).", "category": "Mise en page"},
    {"slug": "card", "name": "bpm.card", "description": "Carte avec titre et contenu.", "category": "Mise en page"},
    {"slug": "highlight-box", "name": "bpm.highlight-box", "description": "Carte avec barre latérale (numéro + label) et contenu structuré (titre, moment, RTB, cible).", "category": "Mise en page"},
    {"slug": "divider", "name": "bpm.divider", "description": "Séparateur horizontal.", "category": "Mise en page"},
    {"slug": "grid", "name": "bpm.grid", "description": "Grille responsive.", "category": "Mise en page"},
    {"slug": "emptystate", "name": "bpm.emptystate", "description": "État vide (aucune donnée).", "category": "Mise en page"},
    # Interaction
    {"slug": "button", "name": "bpm.button", "description": "Bouton d'action (primary, secondary, outline).", "category": "Interaction"},
    {"slug": "toggle", "name": "bpm.toggle", "description": "Interrupteur on/off.", "category": "Interaction"},
    {"slug": "theme", "name": "bpm.theme", "description": "Bascule thème clair / sombre.", "category": "Interaction"},
    {"slug": "selectbox", "name": "bpm.selectbox", "description": "Liste déroulante.", "category": "Interaction"},
    {"slug": "numberinput", "name": "bpm.numberinput", "description": "Champ numérique min/max/step.", "category": "Interaction"},
    {"slug": "input", "name": "bpm.input", "description": "Champ texte une ligne.", "category": "Interaction"},
    {"slug": "textarea", "name": "bpm.textarea", "description": "Zone de texte multiligne.", "category": "Interaction"},
    {"slug": "checkbox", "name": "bpm.checkbox", "description": "Case à cocher.", "category": "Interaction"},
    {"slug": "radiogroup", "name": "bpm.radiogroup", "description": "Groupe de boutons radio.", "category": "Interaction"},
    {"slug": "slider", "name": "bpm.slider", "description": "Curseur min/max/step.", "category": "Interaction"},
    {"slug": "dateinput", "name": "bpm.dateinput", "description": "Sélecteur de date.", "category": "Interaction"},
    {"slug": "colorpicker", "name": "bpm.colorpicker", "description": "Sélecteur de couleur.", "category": "Interaction"},
    {"slug": "chip", "name": "bpm.chip", "description": "Pastille / chip.", "category": "Interaction"},
    # Feedback
    {"slug": "message", "name": "bpm.message", "description": "Bandeau info/success/warning/error.", "category": "Feedback"},
    {"slug": "spinner", "name": "bpm.spinner", "description": "Indicateur de chargement.", "category": "Feedback"},
    {"slug": "tooltip", "name": "bpm.tooltip", "description": "Info-bulle au survol.", "category": "Feedback"},
    # Navigation & structure
    {"slug": "breadcrumb", "name": "bpm.breadcrumb", "description": "Fil d'Ariane.", "category": "Navigation"},
    {"slug": "stepper", "name": "bpm.stepper", "description": "Étapes (stepper).", "category": "Navigation"},
    {"slug": "sidebar", "name": "bpm.sidebar", "description": "Décorateur pour définir le contenu de la barre latérale.", "category": "Navigation"},
    {"slug": "avatar", "name": "bpm.avatar", "description": "Avatar utilisateur.", "category": "Affichage de données"},
    # Utilitaires
    {"slug": "modal", "name": "bpm.modal", "description": "Fenêtre modale.", "category": "Utilitaires"},
    {"slug": "codeblock", "name": "bpm.codeblock", "description": "Bloc de code avec Copier.", "category": "Utilitaires"},
]
