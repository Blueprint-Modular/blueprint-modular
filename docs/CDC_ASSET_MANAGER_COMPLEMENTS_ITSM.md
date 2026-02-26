# Compléments ITSM — Module `asset-manager` Blueprint Modular

> Addendum au cahier des charges v1.0. Éléments issus de l’analyse ITSM : cycle de vie, contrats, mouvements, escalade SLA, base de connaissances, gestion des changements, CMDB, RBAC et audit.

---

## 1. Cycle de vie des actifs

Le statut actuel gère l’état instantané. On ajoute un **cycle de vie** avec étapes et transitions explicites.

### Étapes du cycle de vie

```
Achat → Réception → Déploiement → En service → Maintenance → Renouvellement → Réforme
```

- Chaque transition : entrée dans l’**audit log**, **notification** optionnelle, mise à jour du **statut** de l’actif.
- À implémenter : champ `lifecycleStage` sur `Asset` (ou modèle dédié) + configuration des transitions et actions dans le domaine (ex. `domain.it.json` → `lifecycle_stages`).

### Contrats et garanties

Modèle **`AssetContract`** (Prisma : `AssetContract`) :

| Champ | Description |
|-------|-------------|
| `reference` | Numéro contrat fournisseur |
| `type` | garantie \| maintenance \| leasing \| credit_bail \| licence |
| `label`, `supplier`, `startDate`, `endDate` | |
| `amount` | Montant annuel HT |
| `autoRenewal`, `noticeDays` | Renouvellement et préavis (jours) |
| `assetIds` | JSON array des actifs couverts |
| `documentUrl` | PDF contrat |
| `alertDaysBefore` | Alerte X jours avant échéance |

**Alertes** : fin de garantie &lt; 90 j, fin de contrat &lt; `notice_days`, date de renouvellement recommandée.

### Mouvements physiques

Modèle **`AssetMovement`** (Prisma) :

- `movementType` : reception \| deployment \| transfer \| return \| repair_out \| repair_in \| disposal
- `fromLocationId`, `toLocationId`, `fromUserId`, `toUserId`, `performedById`, `date`, `reason`, `ticketId`, `notes`

Affichage : onglet **Historique** de la fiche actif via **bpm.timeline**.

---

## 2. Escalade SLA et base de connaissances

### Escalade automatique des tickets

Dans `domain.*.json` :

```json
"sla_escalation": [
  {
    "priority_id": "critical",
    "levels": [
      { "after_percent": 50, "action": "notify_manager", "message": "Ticket critique à 50% du SLA" },
      { "after_percent": 80, "action": "reassign_group", "target_group": "senior_tech", "message": "Escalade SLA imminente" },
      { "after_percent": 100, "action": "notify_director", "message": "SLA dépassé — intervention requise" }
    ]
  }
]
```

Job planifié (toutes les 5 min) : vérifier tickets ouverts et déclencher les actions d’escalade.

### Base de connaissances

Modèle **`KnowledgeArticle`** (Prisma) :

- `title`, `slug`, `content` (Markdown), `categoryId`, `assetTypeId`, `tags`, `visibility` (public \| technicians_only)
- `sourceTicketId` : article créé depuis un ticket résolu
- `viewsCount`, `helpfulCount`, `notHelpfulCount`
- `createdById`, `validatedById`, `publishedAt`

Fonctionnalités cibles :

- Suggestion d’articles à la création de ticket (catégorie + mots-clés).
- Bouton « Publier en base de connaissance » sur un ticket résolu.
- Portail : recherche dans les articles publics avant création de ticket.
- Notation utile / pas utile.

---

## 3. Gestion des changements (Change Management)

### Modèle `ChangeRequest` (Prisma)

- `reference` : CHG-[YEAR]-[SEQ:4]
- `type` : standard \| normal \| emergency
- `title`, `description`, `impact`, `riskLevel`, `rollbackPlan`
- `assetsImpacted`, `ticketsLinked` (JSON arrays)
- `requesterId`, `implementerId`, `cabReviewerIds`
- `status` : draft \| submitted \| cab_review \| approved \| rejected \| scheduled \| in_progress \| completed \| failed \| cancelled
- `plannedStart` / `plannedEnd`, `actualStart` / `actualEnd`
- `implementationNotes`, `success`, `postImplementationReview`

### Workflow

```
Brouillon → Soumis → Revue CAB → Approuvé → Planifié → En cours → Terminé
                               ↘ Rejeté
                                             ↘ Échoué → Rollback
```

- **Standard** : pré-approuvé (ex. redémarrage programmé).
- **Normal** : revue CAB obligatoire (vote unanime ou majorité, configurable).
- **Emergency** : approbation accélérée, notification immédiate.

### Calendrier des changements

Vue **bpm.panel** avec calendrier des changements planifiés pour détecter les conflits (même infra, même jour).

### Config domaine

```json
"change_management": {
  "enabled": true,
  "cab_group_id": "cab",
  "standard_change_types": ["Redémarrage programmé", "Mise à jour antivirus", "Patch OS standard"],
  "approval_mode": "unanimous",
  "emergency_approvers": ["admin", "it_manager"]
}
```

---

## 4. CMDB (Configuration Management Database)

### Relations entre actifs

Les actifs sont les **Configuration Items (CI)**. Modèle **`CIRelation`** (Prisma) :

- `sourceAssetId`, `targetAssetId`, `relationType`, `description`, `createdById`

### Types de relations (configurables par domaine)

**IT :** `depends_on`, `connected_to`, `hosted_on`, `backed_up_by`, `protected_by`, `prints_to`

**Maintenance :** `fed_by`, `controls`, `upstream_of`, `backed_up_by`, `shares_utility`

### Vue cartographie (frontend)

Composant **CMDBGraph** (React Flow ou D3) :

- `rootAssetId`, `depth` (niveaux de relations)
- `onNodeClick(assetId)` → navigation fiche actif
- `highlightImpact` : colorer les CI impactés par un ticket ouvert

---

## 5. Sécurité et infrastructure

### RBAC granulaire

Modèle **`Permission`** (Prisma) :

- `roleId`, `domainId` (it \| maintenance \| *), `resource` (assets \| tickets \| changes \| cmdb \| …), `actions` (read, create, update, delete, approve)

Exemples : technicien IT = assets/tickets read+create+update sur domaine it ; responsable maintenance = * sur maintenance + changes:approve ; directeur = *:read + changes:approve.

### Audit trail

Modèle **`AuditLog`** (Prisma) :

- `userId`, `action`, `resourceType`, `resourceId`, `beforeState` / `afterState` (JSON), `changedFields`, `ipAddress`, `userAgent`, `timestamp`

Écran dédié (admin) avec filtres : utilisateur, ressource, période, type d’action.

### Sauvegardes et disponibilité

- **pg_backup** : dump PostgreSQL quotidien (rétention 30 j), optionnel S3.
- Health checks sur tous les services.
- `restart: unless-stopped` dans docker-compose.
- Endpoint `/health` (déjà présent côté Next.js).

---

## 6. Synthèse des sous-modules et roadmap

### Architecture du module `asset-manager`

| Sous-module | Phase | Contenu |
|-------------|-------|---------|
| **inventory** | 1 | Inventaire actifs, fiches, champs dynamiques |
| **helpdesk** | 1 | Tickets, SLA, priorités, catégories |
| **assignments** | 1 | Mises à disposition / affectations |
| **lifecycle** | 2 | Contrats, mouvements, cycle de vie, alertes |
| **knowledge-base** | 2 | Articles KB, suggestion, « Publier depuis ticket » |
| **change-management** | 2 | Demandes de changement, CAB, planning |
| **cmdb** | 3 | Relations CI, graphe de dépendances |

### Roadmap

| Phase | Contenu | Valeur métier |
|-------|---------|----------------|
| **Phase 1** | Inventaire + Tickets + MAD | Traçabilité de base, remplacement tablettes Excel |
| **Phase 2** | Cycle de vie + Contrats + KB + Change Mgmt | Conformité ITIL, réduction coûts, moins d’incidents répétitifs |
| **Phase 3** | CMDB + Escalade avancée + Reporting | Vision systémique, analyse d’impact, ROI mesurable |

---

*Compléments v1.1 — BEAM Consulting pour NXTFOOD | Blueprint Modular `asset-manager`*
