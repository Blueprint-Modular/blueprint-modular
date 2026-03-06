# Audit Blueprint Modular v0.1 → v0.2 (sans complaisance)

**Date** : 2026-03  
**Périmètre** : composants BPM exposés via `@blueprint-modular/core` (sources dans `components/bpm/` ; le package n’a pas de `packages/core/src/components/`, il réexporte depuis le repo).  
**Référence backlog** : [MODULAR_BACKLOG.md](MODULAR_BACKLOG.md).

---

## 1. Méthodologie

Pour chaque composant, quatre questions :

1. **Le LLM l’utilise-t-il correctement sans exemple ?** (testable avec un prompt Claude type « Affiche un tableau avec colonnes X, Y ».)
2. **Le composant gère-t-il son propre état loading/error ?** Sinon → boilerplate garanti dans l’app.
3. **L’API (props) est-elle cohérente avec les autres composants du même niveau ?**
4. **Les cas limites sont-ils couverts ?** (liste vide, erreur, loading.)

---

## 2. Audit par composant / famille

### 2.1 Affichage de données

| Composant | Note /10 | LLM sans exemple | Loading/error propre | API cohérente | Cas limites |
|-----------|----------|------------------|----------------------|---------------|-------------|
| **Table** | 7 | Oui (columns + data) | Non | Oui | Vide : rendu vide, pas d’EmptyState intégré. Pas d’erreur. |
| **Metric** | 8 | Oui | Non | Oui | Pas de loading. Delta/format bien couverts. |
| **JsonViewer** | 6 | Moyen (structure à deviner) | Non | Oui | Données invalides non gérées. |
| **Empty** | 4 | Oui mais minimal | N/A | Oui | Pas de message par défaut. |
| **EmptyState** | 7 | Oui (title, description, action) | N/A | Oui | Bon pour liste vide. |

**Frictions** : Table ne propose pas de « liste vide » cliquable ; l’app doit brancher EmptyState à la main. Aucun composant « table avec fetch » → beaucoup de copier-coller useState/useEffect.

**Propositions** :  
- Table : prop optionnelle `emptyMessage` ou `emptyComponent`.  
- **Nouveau** : `bpm.liveTable({ source, interval })` (priorité P1 backlog).

---

### 2.2 Graphiques

| Composant | Note /10 | LLM sans exemple | Loading/error propre | API cohérente | Cas limites |
|-----------|----------|------------------|----------------------|---------------|-------------|
| **PlotlyChart** | 5 | Non (iframeSrc vs data) | Non | Partiel | Pas de data+layout natif ; placeholder texte. |
| **LineChart** | 6 | Oui (data[]) | Non | Oui | data vide → div vide (pas de message). |
| **BarChart** | 6 | Oui | Non | Oui | Idem. |
| **AreaChart** | 6 | Oui | Non | Oui | Idem. |
| **ScatterChart** | 6 | Oui | Non | Oui | Idem. |
| **AltairChart** | 5 | Spécialisé (spec) | Non | Oui | Dépendance externe. |

**Frictions** : Tous les charts supposent des données déjà chargées. Aucun mini-graphique inline (sparkline) pour tableaux ou cartes.

**Propositions** :  
- Charts : afficher un message ou EmptyState quand `data.length === 0`.  
- **Nouveau** : `bpm.sparkline({ data, color })` (priorité P4).  
- PlotlyChart : documenter clairement iframeSrc vs intégration react-plotly ; ou accepter data+layout en prop.

---

### 2.3 Formulaires et saisie

| Composant | Note /10 | LLM sans exemple | Loading/error propre | API cohérente | Cas limites |
|-----------|----------|------------------|----------------------|---------------|-------------|
| **Input** | 8 | Oui | N/A | Oui | Bon. |
| **Textarea** | 8 | Oui | N/A | Oui | Bon. |
| **NumberInput** | 8 | Oui | N/A | Oui | Bon. |
| **DateInput** | 7 | Oui | N/A | Oui | Bon. |
| **Selectbox** | 8 | Oui (value, options) | N/A | Oui | Bon. |
| **Checkbox** | 8 | Oui | N/A | Oui | Bon. |
| **Toggle** | 8 | Oui | N/A | Oui | Bon. |
| **Autocomplete** | 7 | Oui | N/A | Oui | Options vides gérées. |
| **FileUploader** | 6 | Moyen | Partiel | Oui | Erreur upload à gérer côté app. |
| **ColorPicker** | 6 | Oui | N/A | Oui | UX variable selon env. |

**Frictions** : Faibles. FileUploader pourrait exposer `error` / `onError` de façon plus visible.

---

### 2.4 Feedback et états

| Composant | Note /10 | LLM sans exemple | Loading/error propre | API cohérente | Cas limites |
|-----------|----------|------------------|----------------------|---------------|-------------|
| **Spinner** | 8 | Oui (text?, size) | N/A | Oui | Bon. |
| **Progress** | 7 | Oui (value, max) | N/A | Oui | Pas de seuils colorés. |
| **Message** | 8 | Oui (type, children) | N/A | Oui | Bon pour bloc inline. |
| **StatusBox** | 7 | Oui (state: running/complete/error) | Oui (running → Spinner) | Oui | Bon pattern. |
| **Modal** | 8 | Oui (isOpen, onClose) | N/A | Oui | Bon. |
| **Toast** | 6 | Contexte provider | N/A | Oui | Plus complexe à utiliser sans doc. |
| **Drawer** | 7 | Oui | N/A | Oui | Bon. |

**Frictions** : Pas de bannière d’alerte persistante (type « alerte maintenance »). Progress ne permet pas de seuils colorés (jauge).

**Propositions** :  
- **Nouveau** : `bpm.gauge({ value, min, max, thresholds })` (priorité P2).  
- **Nouveau** : `bpm.alertBanner({ message, severity, blinking })` (priorité P3).

---

### 2.5 Layout et structure

| Composant | Note /10 | LLM sans exemple | Loading/error propre | API cohérente | Cas limites |
|-----------|----------|------------------|----------------------|---------------|-------------|
| **Page** (local) | 7 | Oui (children) | N/A | Oui | Bon. |
| **Tabs** | 8 | Oui (tabs[], defaultTab) | N/A | Oui | Bon. |
| **Card** | 8 | Oui | N/A | Oui | Bon. |
| **Panel** | 8 | Oui | N/A | Oui | Bon. |
| **Container** | 7 | Oui | N/A | Oui | Bon. |
| **Grid** / **Column** | 7 | Oui | N/A | Oui | Bon. |
| **Accordion** | 7 | Oui (sections) | N/A | Oui | Bon. |
| **Expander** | 7 | Oui | N/A | Oui | Bon. |
| **Divider** | 8 | Oui | N/A | Oui | Bon. |

**Frictions** : Faibles. Cohérence globale correcte.

---

### 2.6 Autres (média, navigation, divers)

| Composant | Note /10 | Commentaire |
|-----------|----------|-------------|
| **Button** | 8 | API claire, variants. |
| **Badge** / **Chip** | 8 | Bon. |
| **Title** / **Title1–4** | 8 | Bon. |
| **Breadcrumb** | 7 | Bon. |
| **Pagination** | 7 | Bon (page, total). |
| **Tooltip** | 7 | Bon. |
| **Popover** | 7 | Bon. |
| **Image** | 6 | Pas de fallback erreur intégré. |
| **Audio** / **Video** | 6 | Contrôles natifs, pas d’état loading standardisé. |
| **Markdown** | 7 | Bon. |
| **CodeBlock** | 7 | Bon. |
| **Theme** | 6 | Dépend ThemeProvider / contexte app. |
| **HighlightBox** | 7 | Bon. |
| **Timeline** | 7 | Bon. |
| **Treeview** | 6 | Structure de nœuds à bien documenter. |
| **CrudPage** | 6 | Complexe ; LLM peut se tromper sur les props. |
| **AssistantPanel** | 6 | Dépend contexte IA. |
| **OfflineIndicator** | 7 | Bon pour PWA. |
| **FAB** | 7 | Bon. |
| **TopNav** | 7 | Bon. |
| **Skeleton** | 8 | Bon pour loading. |
| **LoadingBar** | 7 | Bon. |
| **PdfViewer** | 5 | Dépendance lourde, erreur à gérer. |
| **Map** | 5 | Config externe. |
| **Barcode** / **QRCode** / **NfcBadge** | 6 | Spécialisés, usage clair. |

---

## 3. Synthèse des points de friction

1. **Aucun composant « données + fetch »** : Table, charts, listes supposent des données déjà en mémoire → boilerplate répétitif (useState, useEffect, fetch, loading, error).
2. **Liste vide** : Table et charts rendent du vide sans message ; EmptyState existe mais n’est pas branché par défaut.
3. **Pas de jauge avec seuils** : Progress est 0–100 % sans couleurs par seuil ; besoin métier fort (KPI, objectifs).
4. **Pas de bannière d’alerte** : Message est inline ; Toast éphémère ; pas de bandeau persistant (maintenance, incident).
5. **Pas de sparkline** : Pas de mini-graphique pour cellules ou cartes.
6. **Tokens / styles** : Beaucoup d’inline styles dans le code généré ; pas d’exposition claire des design tokens (couleurs, espacements) pour le LLM.
7. **PlotlyChart** : API actuelle (iframeSrc ou placeholder) ne correspond pas à l’attente « data + layout » du LLM.
8. **Modal** : Doc et Maker alignés sur `isOpen` ; vérifier que tous les exemples utilisent bien `isOpen`.

---

## 4. Priorités v0.2 (issues du backlog Mirror)

| Priorité | Action |
|----------|--------|
| **P1** | **bpm.liveTable({ source, interval })** — Table avec fetch + polling intégré ; gère loading/error/empty en interne. |
| **P2** | **bpm.gauge({ value, min, max, thresholds })** — Jauge avec seuils colorés (ex. vert / orange / rouge). |
| **P3** | **bpm.alertBanner({ message, severity, blinking })** — Bannière d’alerte persistante (info | warning | error). |
| **P4** | **bpm.sparkline({ data, color })** — Mini graphique inline (ligne ou barres). |
| **P5** | **bpm.tokens** — Exposition des design tokens (couleurs, espacements) pour réduire les inline styles dans le code généré. |

---

## 5. Propositions de corrections (court terme)

- **Table** : prop optionnelle `emptyComponent` ou `emptyMessage` ; documentation explicite pour le LLM (columns obligatoire dans l’app, optionnel en package pour rétrocompat).
- **LineChart / BarChart / AreaChart / ScatterChart** : si `data.length === 0`, afficher un message ou utiliser EmptyState (ou prop `emptyMessage`).
- **PlotlyChart** : documenter iframeSrc vs data+layout ; ou ajouter support data+layout si dépendance react-plotly acceptée.
- **Progress** : proposition d’extension optionnelle `thresholds?: { value: number; color: string }[]` pour préparer la future gauge, ou documenter gauge comme composant dédié.
- **USAGE.md (core)** : rappeler `modal.isOpen`, `spinner.size` (small|medium|large), et l’usage de EmptyState avec Table/charts quand données vides.

---

## 6. Conclusion

- **Points forts** : Formulaires, layout, feedback de base (Spinner, Message, Modal, StatusBox) sont solides et utilisables par le LLM avec une doc minimale.
- **Manques principaux** : pas de « données + fetch » (liveTable), pas de jauge à seuils, pas d’alert banner, pas de sparkline, pas de tokens exposés.
- **Note globale estimée** : **6,5/10** — base utilisable mais boilerplate et cas limites laissent une marge importante pour v0.2.

Livrable : le présent fichier **AUDIT_V01.md** ; backlog de référence **MODULAR_BACKLOG.md**.  
Commit suggéré : `audit: Blueprint Modular v0.1 sans complaisance → roadmap v0.2`.
