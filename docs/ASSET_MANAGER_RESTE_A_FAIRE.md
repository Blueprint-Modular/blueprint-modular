# Gestion de parc — Reste à faire

État par rapport au CDC et aux compléments ITSM. Les **modèles Prisma** Phase 2/3 et infra sont déjà en place (migrations appliquées).

**État actuel (mis à jour)** : Phase 1 à 3 et compléments en place. Dashboard avec alertes, filtres actifs, retour MAD, SLA visuel, suggestion/publier KB, revue CAB (Approuver/Rejeter + Soumettre au CAB), calendrier changements, **vue graphe CMDB** (Cartographie), **export CSV** (actifs, tickets, contrats, changements), **audit trail** (service + API + Journal d’audit). Reste : RBAC, job escalade SLA, sauvegardes.

**Voir aussi** : [ASSET_MANAGER_AUDIT.md](ASSET_MANAGER_AUDIT.md) — audit complet (UI/UX, lacunes, propositions P1/P2/P3 : champs communs, liaison actif–ticket–contrat, dashboard alertes, cycle de vie, retour MAD, SLA visuel, import CSV, workflow CAB, SAM, QR code, recherche globale, audit trail, notifications).

---

## Phase 1 (inventaire, tickets, MAD) — Fait

| Élément | État | Reste à faire |
|--------|------|----------------|
| **Inventaire actifs** | ✅ API + UI (liste, détail, création) | ✅ `lifecycleStage` affiché/édité ; filtres type, statut, cycle de vie |
| **Tickets** | ✅ API CRUD + UI (liste + filtres, fiche, nouveau, statut/solution) | ✅ Suggestion articles KB à la création ; ✅ « Publier en KB » depuis ticket résolu ; barre SLA sur fiche |
| **Mise à disposition** | ✅ API CRUD + UI (liste + filtre statut, fiche, nouvelle MAD, statut/retour/signature) | ✅ Bouton « Restituer » (clôture MAD + actif remis en stock) |

---

## Phase 2 — Cycle de vie, contrats, mouvements, KB, changements

Modèles Prisma : `AssetContract`, `AssetMovement`, `KnowledgeArticle`, `ChangeRequest` + champ `Asset.lifecycleStage` déjà présents.

### 2.1 Cycle de vie des actifs
- [x] **Config domaine** : étapes de cycle de vie dans `domain.*.json` (lifecycle_stages).
- [x] **UI fiche actif** : afficher et modifier `lifecycleStage` (Selectbox) ; liste actifs filtrable par étape.
- [ ] **Audit** : à chaque transition, enregistrer une entrée dans `AuditLog` (avant/après, user, date).

### 2.2 Contrats et garanties (`AssetContract`)
- [x] **API** : CRUD `/api/asset-manager/contracts` avec `domainId`, lien actifs.
- [x] **UI** : liste des contrats, fiche détail, création/édition (référence, type, dates, montant, préavis).
- [x] **Alertes** : tableau de bord — widget « Contrats arrivant à échéance sous 30 jours » (au chargement de la page).

### 2.3 Mouvements physiques (`AssetMovement`)
- [x] **API** : CRUD `/api/asset-manager/movements` (GET `?assetId=…` ou `?domainId=…`).
- [x] **UI** : onglet **Historique** sur la fiche actif (timeline), création de mouvement depuis la fiche.

### 2.4 Escalade SLA (tickets)
- [ ] **Config** : dans `domain.*.json`, ajouter `sla_escalation` (niveaux par priorité, `after_percent`, `action`, `message`).
- [ ] **Job planifié** : tâche (cron / APScheduler / Vercel cron) toutes les 5 min : tickets ouverts → calcul % SLA → déclencher actions (notify_manager, reassign_group, notify_director, etc.).
- [ ] **Notifications** : branchement avec le module Notification BPM pour envoi des alertes d’escalade.

### 2.5 Connaissances (`KnowledgeArticle`)
- [x] **API** : CRUD `/api/asset-manager/knowledge` (liste, détail, création, édition, suppression) ; filtres catégorie / type d’actif / tags.
- [x] **UI** : sous-module **Connaissances** (liste, fiche article, création/édition).
- [x] **Suggestion à la création de ticket** : articles de la même catégorie affichés sur le formulaire nouveau ticket.
- [x] **Bouton « Publier en base de connaissance »** sur un ticket résolu (lien vers nouvel article avec titre + solution/description préremplis).
- [ ] **Portail utilisateur** : recherche d’articles publics avant création de ticket ; notation utile / pas utile.

### 2.6 Gestion des changements (`ChangeRequest`)
- [x] **API** : CRUD `/api/asset-manager/changes` (liste, détail, POST, PUT, transitions de statut).
- [ ] **Config domaine** : `change_management` dans `domain.*.json` (cab_group_id, standard_change_types, approval_mode).
- [x] **UI** : sous-module **Gestion des changements** — liste, fiche détail (description, impact, rollback, statut modifiable).
- [x] **Revue CAB** : boutons Approuver / Rejeter sur la fiche changement (statut « Revue CAB ») ; bouton « Soumettre au CAB » (draft/submitted → cab_review) ; API POST `.../approve` et `.../reject` ; bandeau « En attente CAB » sur la liste.
- [x] **Calendrier** : vue calendrier des changements planifiés (`/changes/calendar`), grille mensuelle avec lien vers chaque changement.

---

## Phase 3 — CMDB et reporting

### 3.1 CMDB — Relations entre actifs (`CIRelation`)
- [x] **API** : CRUD `/api/asset-manager/ci-relations` (GET `?assetId=…` ou `?sourceAssetId=…`/`?targetAssetId=…`, POST, DELETE).
- [x] **UI fiche actif** : section **Dépendances / Cartographie** — liste des relations, ajout/suppression.
- [x] **Vue graphe** : page **Cartographie CMDB** (`/cmdb-graph`) — graphe SVG (nœuds = actifs, arêtes = relations), layout force-directed, clic → fiche actif.

### 3.2 Escalade avancée et reporting
- [ ] Affiner les règles d’escalade et tableaux de bord (SLA par priorité, taux de résolution, etc.) si prévu au CDC.
- [x] **Exports CSV** : bouton « Exporter CSV » sur les listes actifs, tickets, contrats, changements (export des données affichées).

---

## Compléments sécurité et infrastructure

### RBAC (`Permission`)
- [ ] **API** : lecture/écriture des permissions (par rôle, domaine, ressource, actions) ; vérification des permissions dans chaque route API asset-manager (remplacer ou compléter le simple `getSessionOrTestUser`).
- [ ] **UI** : écran de gestion des permissions (admin) : choix rôle × domaine × ressource × actions.

### Audit trail (`AuditLog`)
- [x] **Écriture** : service `lib/asset-manager/audit.ts` ; écriture sur modification/suppression actifs (exemple) ; extensible aux autres ressources.
- [x] **API** : GET `/api/asset-manager/audit-log` (filtres : domainId, resourceType, action, userId, from, to).
- [x] **UI** : écran « Journal d’audit » (`/modules/asset-manager/[domainId]/audit`) avec filtres type et action.

### Sauvegardes et disponibilité
- [ ] Configurer un job de sauvegarde PostgreSQL (dump quotidien, rétention 30 j, optionnel S3).
- [ ] Health checks sur les services et endpoint `/health` si pas déjà fait.
- [ ] `restart: unless-stopped` et monitoring basique (optionnel).

---

## Synthèse priorisation

| Priorité | Contenu | État |
|----------|---------|------|
| ~~**P1**~~ | ~~UI Tickets (liste + fiche + création)~~ | ✅ Fait |
| ~~**P1**~~ | ~~UI Mise à disposition (liste + fiche + création)~~ | ✅ Fait |
| ~~**P2**~~ | ~~Cycle de vie (config + UI)~~ | ✅ Fait (config + filtre liste + fiche actif) |
| ~~**P2**~~ | ~~Contrats (API + UI)~~ | ✅ Fait ; alertes dashboard 30j |
| ~~**P2**~~ | ~~Mouvements (API + onglet Historique)~~ | ✅ Fait |
| ~~**P2**~~ | ~~Connaissances (API + UI)~~ | ✅ Fait ; suggestion ticket + publier depuis ticket |
| ~~**P2**~~ | ~~Gestion des changements (API + UI de base)~~ | ✅ Fait ; revue CAB + calendrier |
| **P2** | Escalade SLA | Filtre « En danger SLA » sur liste tickets ; API GET `/api/asset-manager/sla-escalation?domainId=` pour cron (job à brancher) |
| ~~**P3**~~ | ~~CMDB (API relations + UI Dépendances)~~ | ✅ Fait ; vue graphe Cartographie CMDB |
| **Infra** | RBAC | À faire (permissions par rôle/domaine/ressource) |
| ~~**Infra**~~ | ~~Audit (écriture + API + écran)~~ | ✅ Fait (actifs en exemple ; Journal d’audit) |

*Document généré à partir du CDC et des compléments ITSM — Blueprint Modular.*
