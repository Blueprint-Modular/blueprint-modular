"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function AssetManagerDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/asset-manager">Gestion d&apos;actifs</Link> → Documentation
        </nav>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>Documentation — Gestion d&apos;actifs</h1>
        <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
          Module de gestion d&apos;actifs, tickets et mises à disposition. L&apos;interface ouvre directement le tableau de bord.
        </p>
      </div>

      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
        Le module ne code pas en dur les types d&apos;actifs. Il s&apos;appuie sur un <strong>fichier de configuration JSON</strong> (<code>lib/asset-manager/config/</code>) qui décrit les types d&apos;actifs, leurs champs, les statuts, les catégories de tickets, les priorités et les règles de numérotation.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Configuration de domaine
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Les configs sont dans <code>lib/asset-manager/config/</code> : <code>domain.it.json</code>, <code>domain.maintenance.json</code>. Le schéma décrit <code>domain_id</code>, <code>asset_types</code> (id, label, icon, fields avec key, type, options…), <code>statuses</code>, <code>ticket_categories</code>, <code>priorities</code>, <code>numbering</code>.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        API
      </h2>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><code>GET /api/asset-manager/config</code> — Liste des domaines disponibles.</li>
        <li><code>GET /api/asset-manager/config/[domainId]</code> — Configuration d&apos;un domaine.</li>
        <li><code>GET /api/asset-manager/assets?domainId=it</code> — Liste des actifs (filtres optionnels : assetTypeId, statusId, search).</li>
        <li><code>POST /api/asset-manager/assets</code> — Création d&apos;un actif (body : domainId, assetTypeId, label, statusId, attributs…).</li>
        <li><code>GET /api/asset-manager/assets/[id]</code> — Détail d&apos;un actif.</li>
        <li><code>PUT /api/asset-manager/assets/[id]</code> — Mise à jour.</li>
        <li><code>DELETE /api/asset-manager/assets/[id]</code> — Suppression.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Compléments ITSM (Phase 2 et 3)
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Cycle de vie des actifs, contrats et garanties, mouvements physiques, escalade SLA, base de connaissances, gestion des changements (CAB), CMDB (graphe de dépendances), RBAC et audit trail sont décrits dans <strong>docs/ASSET_MANAGER_ITSM_COMPLEMENTS.md</strong>. Les modèles Prisma correspondants (AssetContract, AssetMovement, KnowledgeArticle, ChangeRequest, CIRelation, AuditLog, Permission) sont définis dans le schéma et une migration est fournie (<code>20260227100000_asset_manager_phase2_phase3</code>).
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Créer un nouveau domaine
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        Dupliquez <code>domain.it.json</code> en <code>domain.[votre_domaine].json</code>, adaptez <code>domain_id</code>, labels, <code>asset_types</code>, <code>statuses</code>, <code>ticket_categories</code>, <code>priorities</code> et <code>numbering</code>. Enregistrez le nouvel id dans <code>lib/asset-manager/get-domain-config.ts</code> (<code>KNOWN_DOMAINS</code>).
      </p>
      <CodeBlock
        code={`// get-domain-config.ts
const KNOWN_DOMAINS = ["it", "maintenance", "votre_domaine"] as const;`}
        language="typescript"
      />

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href="/modules/asset-manager" style={{ color: "var(--bpm-accent-cyan)" }}>
          ← Retour au module
        </Link>
      </nav>
    </div>
  );
}
