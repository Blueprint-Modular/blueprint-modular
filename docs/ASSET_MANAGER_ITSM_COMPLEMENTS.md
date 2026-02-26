# Compléments ITSM — Module asset-manager Blueprint Modular

Éléments additionnels au cahier des charges v1.0 (actifs, tickets, mises à disposition).  
Roadmap : Phase 1 ✅ → Phase 2 (cycle de vie, contrats, KB, changements) → Phase 3 (CMDB, escalade avancée).

---

## 1. Cycle de vie des actifs (Phase 2)

- **AssetLifecycleStage** : étapes `Achat → Réception → Déploiement → En service → Maintenance → Renouvellement → Réforme`. Transitions avec audit log + notification optionnelle + mise à jour du statut actif.
- **AssetContract** (garanties / maintenance / leasing) : référence, type, fournisseur, dates, montant, renouvellement auto, préavis, actifs couverts, alertes (fin garantie &lt; 90j, fin contrat &lt; préavis).
- **AssetMovement** : traçabilité physique — type (reception, deployment, transfer, return, repair_out, repair_in, disposal), from/to location, from/to user, performed_by, date, ticket_id. Affiché en **Historique** fiche actif via `bpm.timeline`.

---

## 2. Escalade SLA et base de connaissances (Phase 2)

- **sla_escalation** dans `domain.*.json` : par priorité, niveaux (after_percent, action: notify_manager | reassign_group | notify_director). Job background (toutes les 5 min) pour déclencher les actions.
- **KnowledgeArticle** : domain_id, title, slug, content (Markdown), category_id, asset_type_id, tags, visibility (public | technicians_only), source_ticket_id, views_count, helpful_count, not_helpful_count, validated_by, published_at.  
  - Suggestion d’articles à la création de ticket (catégorie + mots-clés).  
  - Bouton « Publier en base de connaissance » depuis un ticket résolu.  
  - Portail : recherche avant création de ticket + notation utile / pas utile.

---

## 3. Module Gestion des changements (Phase 2)

- **ChangeRequest** : reference (CHG-[YEAR]-[SEQ]), type (standard | normal | emergency), title, description, impact, risk_level, rollback_plan, assets_impacted, tickets_linked, requester_id, implementer_id, cab_reviewer_ids, status (draft → submitted → cab_review → approved/rejected → scheduled → in_progress → completed/failed/cancelled), planned_start/end, actual_start/end, implementation_notes, success, post_implementation_review.
- Workflow : Standard (pré-approuvé), Normal (revue CAB, vote unanime/majorité), Emergency (approbation accélérée).
- **domain.*.json** : `change_management.enabled`, `cab_group_id`, `standard_change_types`, `approval_mode`, `emergency_approvers`.
- Vue calendrier des changements planifiés (détection conflits).

---

## 4. Module CMDB (Phase 3)

- **CIRelation** : source_asset_id, target_asset_id, relation_type, description. Les actifs existants = CI.
- Types de relations (IT) : depends_on, connected_to, hosted_on, backed_up_by, protected_by, prints_to.
- Types (Maintenance) : fed_by, controls, upstream_of, backed_up_by, shares_utility.
- Vue **CMDBGraph** (React Flow / D3) : graphe à partir d’un actif, depth=2, onNodeClick, highlightImpact (ticket ouvert).

---

## 5. Sécurité et infrastructure

- **Permission** (RBAC) : role_id, domain_id, resource (assets | tickets | changes | cmdb…), actions (read, create, update, delete, approve). Ex. technicien IT : assets:read,create,update + tickets:read,create,update sur domaine it.
- **AuditLog** : domain_id, user_id, action, resource_type, resource_id, before_state, after_state, changed_fields, ip_address, user_agent, timestamp. Écran admin avec filtres.
- Docker / infra : pg_backup quotidien, health checks, restart policy, endpoint `/health`.

---

## 6. Synthèse roadmap

| Phase | Contenu | Valeur |
|-------|---------|--------|
| **Phase 1** | Inventaire + Tickets + MAD | Tracabilité de base, remplace Excel |
| **Phase 2** | Cycle de vie + Contrats + KB + Change Mgmt | Conformité ITIL, réduction coûts |
| **Phase 3** | CMDB + Escalade avancée + Reporting | Vision impact, ROI |

*Compléments v1.1 — BEAM Consulting | Blueprint Modular asset-manager*
