# Audit composants manquants (M-8)

Analyse des cas d'usage métier non couverts ou partiellement couverts par les 62+ composants bpm.* existants.

---

## Candidats évalués

### bpm.calendar
- **Cas d'usage :** Sélecteur de date ou période avec vue calendrier (planning, réservation, reporting).
- **Props minimales :** `value`, `onChange`, `min`, `max`, `mode?: 'single' | 'range'`, `locale`.
- **Priorité :** haute.
- **Justification :** DateInput et DateRangePicker couvrent la saisie par champ, pas la sélection visuelle par calendrier. Pattern récurrent en apps métier (réservation créneaux, planification).
- **Recommandation :** **IMPLÉMENTER** — composant standard dans les apps React (react-day-picker ou équivalent).

---

### bpm.searchBar
- **Cas d'usage :** Barre de recherche avec suggestions et debounce (recherche produit, client, document).
- **Props minimales :** `value`, `onChange`, `onSearch?: (query: string) => void`, `placeholder`, `debounceMs`, `suggestions?: []` ou rendu async.
- **Priorité :** haute.
- **Justification :** Autocomplete couvre liste filtrée mais pas debounce ni pattern "recherche globale". Les LLMs recréent souvent une search bar custom.
- **Recommandation :** **IMPLÉMENTER** — wrapper autour d’Input + debounce + liste déroulante ou déléguer à Autocomplete avec prop `debounceMs`.

---

### bpm.stepper
- **Cas d'usage :** Indicateur d’étapes (workflow, onboarding).
- **État :** **Existe** — `bpm.stepper` (Stepper.tsx) avec steps, currentStep, onStepClick.
- **Recommandation :** **DÉPRIORISER** (déjà implémenté).

---

### bpm.colorPicker
- **Cas d'usage :** Sélection de couleur pour thèmes ou paramètres.
- **État :** **Existe** — `bpm.colorPicker` (ColorPicker.tsx).
- **Recommandation :** **DÉPRIORISER** (déjà implémenté).

---

### bpm.richText
- **Cas d'usage :** Éditeur de texte enrichi léger (gras, liste, lien) pour descriptions, commentaires, wiki.
- **Props minimales :** `value`, `onChange`, `placeholder`, `minHeight`, `toolbar?: boolean`.
- **Priorité :** moyenne.
- **Justification :** Aujourd’hui on utilise Textarea ou HTML custom. Les apps métier (fiches, wiki, procédures) ont besoin de formatage simple sans intégrer TipTap/Slate à la main.
- **Recommandation :** **IMPLÉMENTER** — éditeur minimal (contenteditable ou lib légère) pour réduire le code custom.

---

### bpm.fileUpload
- **Cas d'usage :** Zone de dépôt de fichiers avec prévisualisation.
- **État :** **Existe** — `bpm.fileUploader` (FileUploader.tsx) couvre dépôt et callback onFiles.
- **Recommandation :** **DÉPRIORISER** (déjà implémenté sous le nom fileUploader).

---

### bpm.kanban
- **Cas d'usage :** Vue kanban (colonnes + cartes déplaçables) pour suivi de tâches ou leads.
- **Props minimales :** `columns: { id, label, cardIds }[]`, `cards: { id, label, ... }[]`, `onMove?: (cardId, fromCol, toCol) => void`.
- **Priorité :** moyenne.
- **Justification :** Pattern très demandé (CRM, gestion de tâches). Aujourd’hui implémentation custom avec dnd-kit ou react-beautiful-dnd.
- **Recommandation :** **IMPLÉMENTER** (priorité moyenne) — composant lourd mais réutilisable ; sinon **DÉPRIORISER** si l’équipe privilégie des tableaux + statuts.

---

### bpm.gantt
- **Cas d'usage :** Diagramme de Gantt simplifié pour planning de chantiers ou projets.
- **Props minimales :** `tasks: { id, label, start, end, progress? }[]`, `startDate`, `endDate`, `onTaskClick?`.
- **Priorité :** basse.
- **Justification :** Utile en contexte BTP/projet ; les libs Gantt sont lourdes et les besoins varient beaucoup.
- **Recommandation :** **DÉPRIORISER** pour l’instant — couvrir par bpm.table avec colonnes dates + barres en renderCell, ou documenter une lib externe recommandée.

---

## Autres composants manquants identifiés

| Composant proposé | Cas d'usage | Props minimales | Priorité | Recommandation |
|------------------|-------------|-----------------|----------|----------------|
| bpm.dateRangePicker (existe) | Période date début–fin | value, onChange, min, max | — | Déjà présent |
| bpm.notificationBell | Icône cloche + badge count + liste déroulante | count, items, onItemClick | moyenne | IMPLÉMENTER si besoin UX notifs |
| bpm.dataGrid | Tableau avec tri/filtre/pagination intégrés | columns, data, pageSize, sortable | haute | Partiellement couvert par bpm.table ; étendre Table ou IMPLÉMENTER wrapper |

---

## Résumé

- **IMPLÉMENTER en priorité :** bpm.calendar, bpm.searchBar, bpm.richText.
- **IMPLÉMENTER si ressource :** bpm.kanban.
- **Déjà couverts :** bpm.stepper, bpm.colorPicker, bpm.fileUploader.
- **DÉPRIORISER :** bpm.gantt (pour l’instant).
