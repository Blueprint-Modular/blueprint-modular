# Audit — Blueprint Monitor

## 1. Fond — Structure des données & architecture

### Ce qui fonctionne bien

- **Modèle de données cohérent.** Schéma `presentation > slides[]` avec `{ id, title, script, notes, kpis[], questions_logged[] }` propre, extensible, sérialisable en JSON pour les API.
- **Architecture streaming correcte.** `streamAPI()` gère le parsing SSE ligne par ligne avec buffer, évite les artefacts de découpe — pattern adapté pour afficher les réponses Claude en temps réel.
- **Clé API en localStorage.** Stockage côté client, transmise en header `X-Anthropic-API-Key` au proxy ; pragmatique pour usage personnel, documenté.

### Problèmes identifiés

| # | Problème | Proposition |
|---|----------|-------------|
| 1 | **Perte d'état à chaque rechargement.** État (présentation, questions loggées, slide courante) uniquement en mémoire React. Rechargement ou changement d'onglet efface tout. | Persister `pres`, `cur`, `logged` en localStorage avec `useEffect` de synchro ; restauration au montage depuis localStorage. |
| 2 | **Absence de validation PPTX côté client.** Aucune vérification extension/taille avant envoi. Fichier 80 Mo part en multipart sans feedback. | Validation préalable : `file.name.endsWith('.pptx')`, `file.size <= 50 * 1024 * 1024` avec feedback immédiat (alert ou Panel). |
| 3 | **Questions loggées : réponse non affichable.** Dans `{ question, answer, slide_title }`, `answer` est stockée mais pas affichée — on ne voit que question et slide. | Rendre les entrées du log dépliables (accordéon) pour relire la réponse suggérée. |
| 4 | **Gestion d'erreur import PPTX.** Erreur uniquement `alert()`. | Utiliser `<Panel variant="error">` ou toast, cohérent avec le design system. |
| 5 | **Titre de la présentation non éditable.** Après import ou création manuelle, impossible de renommer. | Exposer un champ titre éditable (header ou modal). |

---

## 2. Forme — UI/UX & design system

### Ce qui fonctionne bien

- **Cohérence Blueprint.** Tokens CSS (T.bleu, T.cyan, T.vert, T.border…), composants (Badge, Chip, Panel, Btn, Tabs, Spinner), typo Inter. Animation `bpm-in` soignée.
- **Mode minimisé propre.** Pill repliée en haut à droite discrète ; bouton _ et raccourcis H/Échap bien implantés.
- **Header de commandes.** ◐ transparence, 🔑 clé API, ? raccourcis, _ minimiser — groupe logique compact.

### Problèmes identifiés

| # | Problème | Proposition |
|---|----------|-------------|
| 1 | **Largeur fixe ~430–520px.** Pas de poignée de redimensionnement ; gaspille de place sur grand écran, couvre trop sur petit. | Poignée de resize sur le bord gauche (drag horizontal), contrainte 360px–600px. |
| 2 | **Nav slides déborde silencieusement.** 15+ slides → overflow-x invisible, pas d’indication. | Ombres latérales (gradient fade), afficher "1/15" dans le header ; au-delà de 8 slides, option liste déroulante. |
| 3 | **Éditeur de script basique.** Double-clic peu affordant ; pas de compteur de mots / temps de lecture. | Bouton ✎ Éditer plus visible ; compteur mots + temps de lecture estimé (~X min à 130 mots/min). |
| 4 | **Onglets Q&R et Trad. confus.** Toggle FR/EN = langue de la réponse, pas clairement libellé. | Renommer en "Langue de la réponse ↓". Trad. : bouton "⟲ Inverser" pour swapper la direction. |
| 5 | **Résumé : pas d’état "en cours".** [S] pressé, rien n’indique dans l’onglet Résumé qu’une génération est en cours. | Badge spinner sur l’onglet Résumé pendant `loadSum`, comme le badge comptage sur Q&R. |
| 6 | **Pas de mode sombre.** Monitor ignore le toggle Thème Blueprint ; fond blanc sur Teams dark. | Lire `document.documentElement.classList.contains('dark')` ou context Blueprint ; fond #1e1e2e, textes inversés. |

---

## 3. Fonctionnement — Logique métier & raccourcis

### Ce qui fonctionne bien

- **Raccourcis clavier.** set → ← Q T S H couvre le workflow. Guard `INPUT`/`TEXTAREA` évite les conflits en saisie.
- **Streaming SSE.** Réponse Claude progressive, [DONE] et [ERROR] gérés.
- **Contexte slide injecté.** Suggestion reçoit `{ title, script, notes, kpis }` de la slide courante.

### Problèmes identifiés

| # | Problème | Proposition |
|---|----------|-------------|
| 1 | **Raccourci S (et Q, T) bloqués en champ.** Guard bloque tous les raccourcis quand focus dans INPUT/TEXTAREA — on ne peut pas taper "s" ni utiliser Q/T depuis le champ. | Différencier : navigation (→ ← H) toujours actifs ; Q, T, S uniquement hors champ (`if (!inInput) { ... }`). |
| 2 | **Pas de raccourci pour envoyer la question.** Entrée envoie, mais casse le multiligne ; sur Mac, Cmd+Entrée est attendu. | Ctrl+Entrée / Cmd+Entrée pour envoyer, Entrée pour saut de ligne. Placeholder : "Ctrl+↵ pour envoyer". |
| 3 | **Pas d’annulation du streaming.** Réponse 10 s, pas de bouton "Arrêter". | `AbortController` sur le fetch ; bouton "✕ Arrêter" qui `abort()`. |
| 4 | **Pas de "copier la réponse" sur Q&R.** Après suggestion Claude, pas de copie rapide pour Teams/notes. | Bouton "Copier" sous chaque réponse streamée (comme sur le Résumé). |
| 5 | **Une seule présentation en mémoire.** 3 scorecards (Production, BEAM, autre) = réimport à chaque fois. | Gestionnaire multi-présentations en localStorage : liste `[{ id, title, slides }]`, menu déroulant header, Nouvelle / Dupliquer / Supprimer. |
| 6 | **Résumé sans questions loggées.** Si Q&R non utilisé, Claude peut inventer des "questions potentielles". | Dans le prompt : indiquer "questions_logged: []" et instruction "Si aucune question loggée, ne pas inventer de questions. Résumer uniquement les slides." |

---

## 4. Synthèse & roadmap priorisée

| Priorité | Amélioration | Impact | Effort |
|----------|--------------|--------|--------|
| P0 | Persistance état en localStorage | Critique (perte de données) | Faible |
| P0 | AbortController sur le streaming | UX live bloquante | Faible |
| P0 | Fix raccourcis clavier (guard inInput) | Bug logique | Faible |
| P1 | Gestionnaire multi-présentations | Usage réel daily | Moyen |
| P1 | Log dépliable avec réponses | Utilité pendant visio | Faible |
| P1 | Bouton "Copier" sur chaque réponse IA | Workflow daily | Faible |
| P2 | Redimensionnement du panneau (drag) | Confort écran | Moyen |
| P2 | Compteur mots / temps de lecture | Aide présentateur | Faible |
| P2 | Toggle langue Q&R clarifié | Clarté UX | Faible |
| P2 | Mode sombre Blueprint | Cohérence écosystème | Moyen |
| P3 | Validation PPTX côté client | Robustesse | Faible |
| P3 | Titre présentation éditable | Flexibilité | Faible |
| P3 | Prompt résumé sans questions inventées | Qualité output IA | Faible |

**P0** = corrections de quelques lignes — à intégrer avant première présentation live. **P1** = v1.1 fonctionnelle. **P2/P3** = backlog de polish.

---

*Audit — Blueprint Monitor. Composant principal : `components/Monitor/Monitor.tsx` (et hooks/API associés).*
