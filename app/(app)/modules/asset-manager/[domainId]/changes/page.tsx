"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Table, Spinner, Panel, Button, Selectbox } from "@/components/bpm";

type ChangeRequest = {
  id: string;
  reference: string;
  type: string;
  title: string;
  status: string;
  riskLevel: string;
  plannedStart: string | null;
  plannedEnd: string | null;
  createdAt: string;
};

const TYPE_LABELS: Record<string, string> = {
  standard: "Standard",
  normal: "Normal",
  emergency: "Urgent",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  submitted: "Soumis",
  cab_review: "Revue CAB",
  approved: "Approuvé",
  rejected: "Rejeté",
  scheduled: "Planifié",
  in_progress: "En cours",
  completed: "Terminé",
  failed: "Échoué",
  cancelled: "Annulé",
};

const RISK_LABELS: Record<string, string> = {
  low: "Faible",
  medium: "Moyen",
  high: "Élevé",
  critical: "Critique",
};

export default function AssetManagerChangesPage() {
  const params = useParams();
  const router = useRouter();
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const [changes, setChanges] = useState<ChangeRequest[]>([]);
  const [config, setConfig] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    if (!domainId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const url = `/api/asset-manager/changes?domainId=${encodeURIComponent(domainId)}${filterStatus ? `&status=${encodeURIComponent(filterStatus)}` : ""}`;
    Promise.all([
      fetch(`/api/asset-manager/config/${domainId}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
      fetch(url, { credentials: "include" }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([cfg, data]) => {
        setConfig(cfg);
        setChanges(Array.isArray(data) ? data : []);
      })
      .catch(() => setChanges([]))
      .finally(() => setLoading(false));
  }, [domainId, filterStatus]);

  const columns = [
    { key: "reference", label: "Référence" },
    { key: "title", label: "Titre" },
    { key: "type", label: "Type", render: (val: unknown) => TYPE_LABELS[String(val)] ?? String(val) },
    { key: "status", label: "Statut", render: (val: unknown) => STATUS_LABELS[String(val)] ?? String(val) },
    { key: "riskLevel", label: "Risque", render: (val: unknown) => RISK_LABELS[String(val)] ?? String(val) },
    { key: "plannedStart", label: "Début prévu", render: (val: unknown) => (val ? new Date(String(val)).toLocaleDateString("fr-FR") : "—") },
  ];

  const statusOptions = [
    { value: "", label: "Tous les statuts" },
    ...Object.entries(STATUS_LABELS).map(([id, label]) => ({ value: id, label })),
  ];

  if (!config && !loading) {
    return (
      <div className="doc-page">
        <Panel variant="warning" title="Domaine inconnu">Vérifiez l&apos;URL.</Panel>
        <Link href="/modules/asset-manager" style={{ color: "var(--bpm-accent-cyan)" }}>← Gestion d&apos;actifs</Link>
      </div>
    );
  }

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <nav className="doc-breadcrumb">
          <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>Modules</Link> →{" "}
          <Link href="/modules/asset-manager" style={{ color: "var(--bpm-accent-cyan)" }}>Gestion d&apos;actifs</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>Tableau de bord</Link> → Changements
        </nav>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>Gestion des changements</h1>
            <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
              Demandes de changement (CAB), planification et suivi.
            </p>
          </div>
          <Link href={`/modules/asset-manager/${domainId}/changes/new`}>
            <Button size="small">+ Nouvelle demande</Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <Selectbox label="Statut" value={filterStatus} onChange={(v) => setFilterStatus(String(v))} options={statusOptions} placeholder="Tous" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="medium" />
        </div>
      ) : (
        <Panel variant="info" title={`${changes.length} demande(s)`}>
          {changes.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Aucune demande. Créez-en une avec « Nouvelle demande ».</p>
          ) : (
            <Table
              columns={columns}
              data={changes}
              keyColumn="id"
              onRowClick={(row) => router.push(`/modules/asset-manager/${domainId}/changes/${(row as ChangeRequest).id}`)}
            />
          )}
        </Panel>
      )}

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>← Tableau de bord</Link>
        <Link href="/modules/asset-manager/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>Documentation</Link>
      </nav>
    </div>
  );
}
