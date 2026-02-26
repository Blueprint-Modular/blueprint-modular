# Asset Manager — Reste à faire

État par rapport au CDC et aux compléments ITSM. Les **modèles Prisma** Phase 2/3 et infra sont déjà en place (migrations appliquées).

---

## Phase 1 (inventaire, tickets, MAD) — Partiellement fait

| Élément | État | Reste à faire |
|--------|------|----------------|
| **Inventaire actifs** | ✅ API + UI (liste, détail, création) | Affichage/édition du champ `lifecycleStage` sur la fiche actif ; filtres avancés |
| **Tickets** | ✅ API GET en place, modèles OK | **UI** : liste des tickets (table + filtres), fiche détail ticket, création/édition, workflow statuts, liaison actif |
| **Mises à disposition** | ✅ API GET en place, modèles OK | **UI** : liste des MAD, fiche détail, création/édition, signature/retour, lien ticket |

---

## Phase 2 — Cycle de vie, contrats, mouvements, KB, changements

Modèles Prisma : `AssetContract`, `AssetMovement`, `KnowledgeArticle`, `ChangeRequest` + champ `Asset.lifecycleStage` déjà présents.

### 2.1 Cycle de vie des actifs
- [ ] **Config domaine** : ajouter dans `domain.*.json` les étapes de cycle de vie (achat → réception → … → réforme) et transitions autorisées.
- [ ] **UI fiche actif** : afficher et modifier `lifecycleStage` ; bouton « Changer d’étape » avec validation + écriture **AuditLog** (et optionnellement notification).
- [ ] **Audit** : à chaque transition, enregistrer une entrée dans `AuditLog` (avant/après, user, date).

### 2.2 Contrats et garanties (`AssetContract`)
- [ ] **API** : CRUD `/api/asset-manager/contracts` (GET liste, GET/:id, POST, PUT, DELETE) avec `domainId`, lien actifs (JSON `assetIds`).
- [ ] **UI** : liste des contrats, fiche détail, création/édition, champs (référence, type, dates, montant, préavis, alerte).
- [ ] **Alertes** : job ou cron (ou vérification au chargement) pour « fin de garantie < 90 j », « fin de contrat < notice_days », affichage des alertes en tableau de bord ou bandeau.

### 2.3 Mouvements physiques (`AssetMovement`)
- [ ] **API** : CRUD `/api/asset-manager/movements` (par actif : GET `?assetId=…` ou GET `/assets/:id/movements`).
- [ ] **UI** : onglet **Historique** sur la fiche actif, composant type **bpm.timeline** listant les mouvements (réception, déploiement, transfert, retour, réparation, réforme).
- [ ] Création d’un mouvement depuis la fiche actif (type, date, lieu/user source/cible, lien ticket optionnel).

### 2.4 Escalade SLA (tickets)
- [ ] **Config** : dans `domain.*.json`, ajouter `sla_escalation` (niveaux par priorité, `after_percent`, `action`, `message`).
- [ ] **Job planifié** : tâche (cron / APScheduler / Vercel cron) toutes les 5 min : tickets ouverts → calcul % SLA → déclencher actions (notify_manager, reassign_group, notify_director, etc.).
- [ ] **Notifications** : branchement avec le module Notification BPM pour envoi des alertes d’escalade.

### 2.5 Base de connaissances (`KnowledgeArticle`)
- [ ] **API** : CRUD `/api/asset-manager/knowledge` (liste, détail, création, édition, suppression) ; recherche par catégorie / type d’actif / tags.
- [ ] **UI** : sous-module **Base de connaissances** (liste articles, fiche article Markdown, création/édition).
- [ ] **Suggestion à la création de ticket** : lors de la saisie du titre/catégorie, appeler l’API pour suggérer des articles (matching catégorie + mots-clés).
- [ ] **Bouton « Publier en base de connaissance »** sur un ticket résolu : préremplir un article depuis le ticket (titre, solution, lien `sourceTicketId`).
- [ ] **Portail utilisateur** : page recherche d’articles (visibilité public) avant création de ticket ; notation utile / pas utile (`helpfulCount`, `notHelpfulCount`).

### 2.6 Gestion des changements (`ChangeRequest`)
- [ ] **API** : CRUD `/api/asset-manager/changes` (liste, détail, POST, PUT, transitions de statut).
- [ ] **Config domaine** : ajouter `change_management` dans `domain.*.json` (enabled, cab_group_id, standard_change_types, approval_mode, emergency_approvers).
- [ ] **UI** : sous-module **Gestion des changements** — liste des demandes de changement, fiche détail (description, impact, plan de rollback, actifs/tickets liés), workflow (brouillon → soumis → revue CAB → approuvé/rejeté → planifié → en cours → terminé/échoué).
- [ ] **Revue CAB** : écran ou modal pour les approbateurs (vote, commentaires), prise en compte du mode (unanime / majorité) et du type (standard / normal / emergency).
- [ ] **Calendrier** : vue calendrier des changements planifiés (bpm.panel + composant calendrier) pour détecter les conflits de dates sur les mêmes actifs.

---

## Phase 3 — CMDB et reporting

### 3.1 CMDB — Relations entre actifs (`CIRelation`)
- [ ] **API** : CRUD `/api/asset-manager/ci-relations` (liste par actif : GET `?sourceAssetId=…` ou `?targetAssetId=…`, POST, DELETE) ; types de relations définis dans la config domaine.
- [ ] **UI fiche actif** : section **Dépendances / Cartographie** — liste des relations (source → cible, type), ajout/suppression de relation.
- [ ] **Vue graphe** : composant **CMDBGraph** (React Flow ou D3) dans un bpm.panel : nœuds = actifs, arêtes = relations, `rootAssetId` + `depth` ; clic nœud → navigation vers fiche actif ; optionnel : surligner les CI impactés par un ticket ouvert (`highlightImpact`).

### 3.2 Escalade avancée et reporting
- [ ] Affiner les règles d’escalade et tableaux de bord (SLA par priorité, taux de résolution, etc.) si prévu au CDC.
- [ ] Exports / rapports (CSV, PDF) sur actifs, tickets, contrats, changements — selon besoins métier.

---

## Compléments sécurité et infrastructure

### RBAC (`Permission`)
- [ ] **API** : lecture/écriture des permissions (par rôle, domaine, ressource, actions) ; vérification des permissions dans chaque route API asset-manager (remplacer ou compléter le simple `getSessionOrTestUser`).
- [ ] **UI** : écran de gestion des permissions (admin) : choix rôle × domaine × ressource × actions.

### Audit trail (`AuditLog`)
- [ ] **Écriture** : à chaque création/modification/suppression sur actifs, tickets, contrats, changements, MAD, appeler un service qui écrit dans `AuditLog` (before/after, changed_fields, user, ip, user_agent).
- [ ] **API** : GET `/api/asset-manager/audit-log` (filtres : user, resourceType, resourceId, date range) — réservé admin.
- [ ] **UI** : écran « Journal d’audit » (admin) avec filtres et export.

### Sauvegardes et disponibilité
- [ ] Configurer un job de sauvegarde PostgreSQL (dump quotidien, rétention 30 j, optionnel S3).
- [ ] Health checks sur les services et endpoint `/health` si pas déjà fait.
- [ ] `restart: unless-stopped` et monitoring basique (optionnel).

---

## Synthèse priorisation

| Priorité | Contenu | Effort estimé |
|----------|---------|----------------|
| **P1** | UI Tickets (liste + fiche + création) | 2–3 j |
| **P1** | UI Mises à disposition (liste + fiche + création) | 1–2 j |
| **P2** | Cycle de vie (config + UI transition + AuditLog) | 1 j |
| **P2** | Contrats (API + UI + alertes) | 1–2 j |
| **P2** | Mouvements (API + onglet Historique timeline) | 1 j |
| **P2** | Base de connaissances (API + UI + suggestion ticket) | 2–3 j |
| **P2** | Gestion des changements (API + UI + workflow CAB + calendrier) | 3–4 j |
| **P2** | Escalade SLA (config + job + notifications) | 1–2 j |
| **P3** | CMDB (API relations + graphe) | 2–3 j |
| **Infra** | RBAC + Audit (écriture + écran lecture) | 2 j |

*Document généré à partir du CDC et des compléments ITSM — Blueprint Modular.*
