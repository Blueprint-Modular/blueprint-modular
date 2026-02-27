"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { Panel, Spinner, Selectbox, Table, EmptyState } from "@/components/bpm";

type AuditEntry = {
  id: string;
  domainId: string | null;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  beforeState: string | null;
  afterState: string | null;
  changedFields: string[];
  timestamp: string;
};

const ACTION_LABELS: Record<string, string> = {
  create: "Création",
  update: "Modification",
  delete: "Suppression",
  login: "Connexion",
  export: "Export",
};
const RESOURCE_LABELS: Record<string, string> = {
  asset: "Actif",
  ticket: "Ticket",
  change: "Changement",
  contract: "Contrat",
  assignment: "MAD",
};

export default function AssetManagerAuditPage() {
  const params = useParams();
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("");
  const [filterAction, setFilterAction] = useState("");

  useEffect(() => {
    if (!domainId) return;
    setLoading(true);
    const sp = new URLSearchParams({ domainId, limit: "100" });
    if (filterType) sp.set("resourceType", filterType);
    if (filterAction) sp.set("action", filterAction);
    fetch(`/api/asset-manager/audit-log?${sp}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setLogs(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [domainId, filterType, filterAction]);

  const typeOptions = [
    { value: "", label: "Tous les types" },
    ...Object.entries(RESOURCE_LABELS).map(([id, label]) => ({ value: id, label })),
  ];
  const actionOptions = [
    { value: "", label: "Toutes actions" },
    ...Object.entries(ACTION_LABELS).map(([id, label]) => ({ value: id, label })),
  ];

  const columns = [
    {
      key: "timestamp",
      label: "Date",
      render: (val: unknown) => (val ? new Date(String(val)).toLocaleString("fr-FR") : "—"),
    },
    { key: "userId", label: "Utilisateur" },
    {
      key: "action",
      label: "Action",
      render: (val: unknown) => ACTION_LABELS[String(val)] ?? String(val),
    },
    {
      key: "resourceType",
      label: "Ressource",
      render: (val: unknown) => RESOURCE_LABELS[String(val)] ?? String(val),
    },
    {
      key: "resourceId",
      label: "Détail",
      render: (val: unknown, row: unknown) => {
        const log = row as AuditEntry;
        if (!log?.resourceId) return "—";
        const href =
          log.resourceType === "asset"
            ? `/modules/asset-manager/${domainId}/assets/${log.resourceId}`
            : log.resourceType === "ticket"
              ? `/modules/asset-manager/${domainId}/tickets/${log.resourceId}`
              : log.resourceType === "change"
                ? `/modules/asset-manager/${domainId}/changes/${log.resourceId}`
                : null;
        if (!href) return log.resourceId.slice(0, 12) + "…";
        return (
          <Link href={href} className="hover:underline" style={{ color: "var(--bpm-accent-cyan)" }}>
            {log.resourceId.slice(0, 12)}…
          </Link>
        );
      },
    },
  ];

  if (!domainId) {
    return (
      <div className="doc-page">
        <Panel variant="warning" title="Domaine requis" />
      </div>
    );
  }

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <nav className="doc-breadcrumb">
          <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>Modules</Link> →{" "}
          <Link href="/modules/asset-manager" style={{ color: "var(--bpm-accent-cyan)" }}>Gestion d&apos;actifs</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>Tableau de bord</Link> → Journal d&apos;audit
        </nav>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
          Journal d&apos;audit
        </h1>
        <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
          Historique des actions sur les actifs, tickets, contrats et changements.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <Selectbox
          label="Type de ressource"
          value={filterType}
          onChange={(v) => setFilterType(String(v))}
          options={typeOptions}
        />
        <Selectbox
          label="Action"
          value={filterAction}
          onChange={(v) => setFilterAction(String(v))}
          options={actionOptions}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="medium" />
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-xl border bg-[var(--bpm-surface)] p-4" style={{ border: "1px solid #E5E7EB", borderRadius: 12 }}>
          <EmptyState
            title="Aucune entrée d'audit"
            description="Les actions sur les actifs, tickets, contrats et changements apparaîtront ici."
            icon={<ClipboardList size={64} style={{ color: "var(--bpm-text-secondary)", opacity: 0.6 }} />}
          />
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--bpm-border)" }}>
          <Table
            columns={columns}
            data={logs}
            minWidth={560}
            keyColumn="id"
          />
        </div>
      )}

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>← Tableau de bord</Link>
      </nav>
    </div>
  );
}
