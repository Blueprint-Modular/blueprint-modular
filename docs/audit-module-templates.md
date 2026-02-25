# Audit du module Templates à 360° — Blueprint Modular

*Document de référence. Les propositions P0–P1 ont été traitées dans le simulateur ; le module a été sorti du bpm.panel et le flux en 3 étapes amorcé.*

---

## 1. FOND — Ce que le module contient et expose

### Ce qui existe
Le module propose une bibliothèque de modèles prédéfinis (rapports, fiches, emails) que l'utilisateur choisit avant de remplir des champs pour générer un document (PDF, HTML ou enregistrement en base). Le simulateur expose 3 modèles de démo : "Rapport mensuel", "Fiche projet", "Email type". L'intégration côté Python se fait via `bpm.selectbox(options=modeles, label="Choisir un modèle")`.

### Lacunes de fond identifiées
- **La structure de données des modèles n'est pas documentée.** La documentation complète tient en deux phrases et un extrait de code de 2 lignes. On ne sait pas ce qu'est un modèle : a-t-il un id ? Un label ? Un type ? Un body (contenu avec variables) ? Une liste de fields à remplir ? Une catégorie ? Un format de sortie ? Un auteur ? Une date de mise à jour ? Sans cette structure, il est impossible pour un développeur de construire une bibliothèque de modèles cohérente.
- **Les champs variables du modèle ne sont pas définis.** La promesse centrale du module est "remplir les champs" avant génération — mais aucun champ n'existe dans le simulateur ni dans la documentation. On ignore comment déclarer les variables d'un modèle (`{{client}}`, `{{date}}`, `{{montant}}`…), leur type (texte, date, nombre, select), leur caractère obligatoire, et leur ordre d'affichage.
- **Le format de sortie n'est pas spécifié.** La doc mentionne "PDF, HTML ou enregistrement en base" sans expliquer comment choisir le format, ni comment configurer le moteur de rendu (template Jinja2 ? DOCX ? HTML simple ?).
- **Pas de notion de catégorie ou de famille de modèles.** Avec 3 modèles tout se lit d'un coup, mais une bibliothèque réelle peut en contenir des dizaines. Sans catégorisation (RH, Finance, Commercial, Juridique…), la liste devient illisible.
- **Pas de versionnement ni d'historique.** Un modèle évolue dans le temps. Sans version, les documents générés à partir d'un modèle modifié ne sont plus cohérents avec les anciens.

---

## 2. FORME — Interface, design, mise en page

### Ce qui fonctionne
Le titre "Simulateur — Templates" est clair. Le sous-titre ("Choisir un modèle et remplir les champs") décrit bien le flux attendu. Le bouton "Créer à partir du modèle" a un libellé actionnable et précis.

### Problèmes de forme identifiés
- Le module était enfermé dans un **bpm.panel** (conteneur gris avec bord bleu à gauche et icône "ℹ"). Pour un sélecteur de modèles qui doit être une page à part entière permettant de parcourir une bibliothèque visuelle, ce panel étranglait l'espace disponible.
- L'icône "ℹ" bleue en en-tête était sans signification claire (pattern systémique du bpm.panel).
- Le sélecteur de modèle était une **liste déroulante aveugle** : pas de description, pas d'aperçu, pas d'exemple de rendu, pas d'indication du nombre de champs à remplir.
- **Aucun aperçu du modèle sélectionné** : la zone sous le sélecteur restait vide.
- Le **formulaire ne s'adaptait pas au modèle choisi** : seul "Nom du document" était présent ; les champs variables spécifiques à chaque modèle n'apparaissaient jamais.
- Le champ "Nom du document" était présent avant même qu'un modèle soit choisi (flux non séquentiel).
- Pas de distinction visuelle entre les types de modèles (icône, couleur, badge).

---

## 3. FONCTIONNEMENT — Interactions, logique, comportements

### Ce qui fonctionne
Le dropdown s'ouvre correctement au clic et liste les 3 modèles disponibles. Le composant custom (bpm-selectbox) est rendu en portal hors de l'arbre DOM principal.

### Problèmes de fonctionnement identifiés — dont un bug critique
- **BUG CRITIQUE (corrigé)** : la sélection d'un modèle ne fonctionnait pas car le simulateur passait `value={null}` et `onChange={() => {}}` au Selectbox — aucune gestion d'état. Corrigé en ajoutant un état `selectedModel` et en reliant `value` / `onChange`.
- **BUG (corrigé)** : le bouton "Créer à partir du modèle" effaçait le champ "Nom du document" sans feedback. Corrigé : le bouton est désactivé tant qu'aucun modèle n'est sélectionné ou que le nom est vide ; un message d'erreur s'affiche si l'utilisateur tente de créer sans remplir.
- Aucune validation des champs obligatoires → désactivation du bouton et message explicite (P1).
- Pas de retour après une création réussie → toast de confirmation (P12) ajouté dans le simulateur.
- Aucun flux de remplissage des champs variables → à implémenter (formulaire dynamique depuis `fields` du modèle).
- Pas de recherche dans la bibliothèque.
- Pas de gestion du clavier (↑ ↓ Enter) dans la liste.

---

## 4. PROPOSITIONS D'AMÉLIORATION

### Proposition structurante : sortir du bpm.panel et repenser le flux en 3 étapes
- **Étape 1 : Choisir un modèle** → **Étape 2 : Remplir les champs** → **Étape 3 : Générer / Prévisualiser**
- Le simulateur a été sorti du panel ; conteneur épuré avec sections claires ; amorce du flux (étape 1 visible, champs démo à l’étape 2 quand un modèle est sélectionné).

### Correctifs prioritaires (bugs) — réalisés
- **P0** — Corriger le bug de sélection du bpm-selectbox : état `selectedModel` + `value={selectedModel}` et `onChange={setSelectedModel}` dans le simulateur. Le composant Selectbox lui-même était correct.
- **P1** — Bouton "Créer" désactivé si pas de modèle ou nom vide ; message d'erreur sous le formulaire si clic sans remplir ; pas de réinitialisation silencieuse.

### Fond
- **P2** — Définir et documenter la structure complète d'un modèle (id, label, category, description, icon, output, fields[], body avec placeholders).
- **P3** — Implémenter la gestion des catégories (onglets ou filtres : Reporting, Commercial, RH, Juridique…).
- **P4** — Ajouter un corps de modèle avec variables (`body` + moteur de rendu).

### Forme
- **P5** — Remplacer le dropdown par une galerie de cartes visuelles (icône, nom, description, badge catégorie, nombre de champs).
- **P6** — Aperçu du modèle à droite (liste des champs, aperçu HTML avec variables en surbrillance).
- **P7** — Stepper visuel (Step 1 → Step 2 → Step 3) avec boutons Suivant / Retour.
- **P8** — Formulaire dynamique à l'étape 2 généré depuis `fields` du modèle.
- **P9** — Prévisualisation HTML à l'étape 3 avant génération finale.

### Fonctionnement
- **P10** — Navigation clavier (↑ ↓ Enter Escape) dans la liste / galerie.
- **P11** — Recherche dans la bibliothèque (filtre par nom ou description).
- **P12** — Toast de confirmation après génération (implémenté dans le simulateur).
- **P13** — Connexion avec le module Export planifié (documenter).
- **P14** — Historique des documents générés (connexion Audit/Log).
- **P15** — Enrichir le simulateur pour démontrer le flux complet (sélection → champs → prévisualisation → création).

---

## 5. RÉALISÉ DANS CE CYCLE
- Suppression du bpm.panel ; conteneur avec bordure et sections lisibles.
- État `selectedModel` et `documentName` ; Selectbox et Input reliés ; sélection persistée.
- Bouton "Créer" désactivé si modèle non choisi ou nom vide ; message d'erreur explicite au clic sans remplir.
- Toast de succès après création réussie.
- Section "Champs à remplir" affichée quand un modèle est sélectionné (champs démo par type de modèle : rapport, fiche, email).
- Lien "Retour au module Templates" en bas de page.
