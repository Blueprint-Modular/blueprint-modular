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
    {"slug": "text", "name": "bpm.text", "description": "Texte simple (niveau corps).", "category": "Affichage de données"},
    {"slug": "caption", "name": "bpm.caption", "description": "Légende ou texte secondaire.", "category": "Affichage de données"},
    {"slug": "badge", "name": "bpm.badge", "description": "Badge / étiquette (success, warning, etc.).", "category": "Affichage de données"},
    {"slug": "progress", "name": "bpm.progress", "description": "Barre de progression.", "category": "Affichage de données"},
    {"slug": "skeleton", "name": "bpm.skeleton", "description": "Placeholder de chargement (skeleton).", "category": "Affichage de données"},
    {"slug": "jsonviewer", "name": "bpm.jsonviewer", "description": "Affichage JSON formaté et repliable.", "category": "Affichage de données"},
    {"slug": "avatar", "name": "bpm.avatar", "description": "Avatar utilisateur.", "category": "Affichage de données"},
    # Mise en page
    {"slug": "panel", "name": "bpm.panel", "description": "Panneau informatif (info, success, warning, error).", "category": "Mise en page"},
    {"slug": "tabs", "name": "bpm.tabs", "description": "Onglets pour organiser le contenu.", "category": "Mise en page"},
    {"slug": "expander", "name": "bpm.expander", "description": "Bloc repliable.", "category": "Mise en page"},
    {"slug": "accordion", "name": "bpm.accordion", "description": "Accordéon (sections repliables).", "category": "Mise en page"},
    {"slug": "card", "name": "bpm.card", "description": "Carte avec titre et contenu.", "category": "Mise en page"},
    {"slug": "highlight-box", "name": "bpm.highlight-box", "description": "Carte avec barre latérale (numéro + label) et contenu structuré (titre, moment, RTB, cible).", "category": "Mise en page"},
    {"slug": "divider", "name": "bpm.divider", "description": "Séparateur horizontal.", "category": "Mise en page"},
    {"slug": "grid", "name": "bpm.grid", "description": "Grille responsive.", "category": "Mise en page"},
    {"slug": "column", "name": "bpm.column", "description": "Diviser la page en 1, 2, 3 ou plus colonnes.", "category": "Mise en page"},
    {"slug": "emptystate", "name": "bpm.emptystate", "description": "État vide (aucune donnée).", "category": "Mise en page"},
    {"slug": "container", "name": "bpm.container", "description": "Conteneur avec titre optionnel.", "category": "Mise en page"},
    {"slug": "empty", "name": "bpm.empty", "description": "État vide minimal (icône + message).", "category": "Mise en page"},
    {"slug": "popover", "name": "bpm.popover", "description": "Contenu au clic ou au survol (popover).", "category": "Mise en page"},
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
    {"slug": "daterangepicker", "name": "bpm.daterangepicker", "description": "Sélecteur de plage de dates.", "category": "Interaction"},
    {"slug": "timeinput", "name": "bpm.timeinput", "description": "Saisie de l'heure.", "category": "Interaction"},
    {"slug": "rating", "name": "bpm.rating", "description": "Notation par étoiles.", "category": "Interaction"},
    {"slug": "fileuploader", "name": "bpm.fileuploader", "description": "Upload de fichier(s).", "category": "Interaction"},
    {"slug": "colorpicker", "name": "bpm.colorpicker", "description": "Sélecteur de couleur.", "category": "Interaction"},
    {"slug": "chip", "name": "bpm.chip", "description": "Pastille / chip.", "category": "Interaction"},
    # Feedback
    {"slug": "message", "name": "bpm.message", "description": "Bandeau info/success/warning/error.", "category": "Feedback"},
    {"slug": "spinner", "name": "bpm.spinner", "description": "Indicateur de chargement.", "category": "Feedback"},
    {"slug": "tooltip", "name": "bpm.tooltip", "description": "Info-bulle au survol.", "category": "Feedback"},
    {"slug": "statusbox", "name": "bpm.statusbox", "description": "Boîte de statut (success, warning, error, info).", "category": "Feedback"},
    # Navigation & structure
    {"slug": "breadcrumb", "name": "bpm.breadcrumb", "description": "Fil d'Ariane.", "category": "Navigation"},
    {"slug": "stepper", "name": "bpm.stepper", "description": "Étapes (stepper).", "category": "Navigation"},
    {"slug": "sidebar", "name": "bpm.sidebar", "description": "Décorateur pour définir le contenu de la barre latérale.", "category": "Navigation"},
    # Média
    {"slug": "audio", "name": "bpm.audio", "description": "Lecteur audio.", "category": "Média"},
    {"slug": "video", "name": "bpm.video", "description": "Lecteur vidéo.", "category": "Média"},
    {"slug": "html", "name": "bpm.html", "description": "Contenu HTML brut (iframe).", "category": "Média"},
    # Graphiques
    {"slug": "linechart", "name": "bpm.linechart", "description": "Graphique en courbes.", "category": "Graphiques"},
    {"slug": "barchart", "name": "bpm.barchart", "description": "Graphique en barres.", "category": "Graphiques"},
    {"slug": "areachart", "name": "bpm.areachart", "description": "Graphique en aires.", "category": "Graphiques"},
    {"slug": "scatterchart", "name": "bpm.scatterchart", "description": "Graphique en nuage de points.", "category": "Graphiques"},
    # Utilitaires
    {"slug": "modal", "name": "bpm.modal", "description": "Fenêtre modale.", "category": "Utilitaires"},
    {"slug": "codeblock", "name": "bpm.codeblock", "description": "Bloc de code avec Copier.", "category": "Utilitaires"},
]
