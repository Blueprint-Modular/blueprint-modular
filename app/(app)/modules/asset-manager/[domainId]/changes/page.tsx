"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Download, RefreshCw } from "lucide-react";
import { Table, Spinner, Panel, Button, Selectbox, EmptyState } from "@/components/bpm";

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
  const searchParams = useSearchParams();
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const [changes, setChanges] = useState<ChangeRequest[]>([]);
  const [config, setConfig] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState(() => searchParams.get("status") ?? "");

  useEffect(() => {
    setFilterStatus(searchParams.get("status") ?? "");
  }, [searchParams]);

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
        <Link href="/modules/asset-manager" style={{ color: "var(--bpm-accent-cyan)" }}>← Gestion de parc</Link>
      </div>
    );
  }

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <nav className="doc-breadcrumb">
          <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>Modules</Link> →{" "}
          <Link href="/modules/asset-manager" style={{ color: "var(--bpm-accent-cyan)" }}>Gestion de parc</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>Tableau de bord</Link> → Changements
        </nav>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>Gestion des changements</h1>
            <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
              Demandes de changement (CAB), planification et suivi.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="small"
              onClick={() => {
                const headers = ["Référence", "Titre", "Type", "Statut", "Risque", "Début prévu"];
                const rows = changes.map((c) => [
                  c.reference,
                  c.title,
                  TYPE_LABELS[c.type] ?? c.type,
                  STATUS_LABELS[c.status] ?? c.status,
                  RISK_LABELS[c.riskLevel] ?? c.riskLevel,
                  c.plannedStart ? new Date(c.plannedStart).toLocaleDateString("fr-FR") : "",
                ]);
                const csv = [headers.join(";"), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))].join("\r\n");
                const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `changements-${domainId}-${new Date().toISOString().slice(0, 10)}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              disabled={changes.length === 0}
              className="asset-manager-export-btn-header"
            >
              <Download size={18} className="shrink-0" />
              <span className="asset-manager-export-label">Exporter</span>
            </Button>
            <Link href={`/modules/asset-manager/${domainId}/changes/calendar`}>
              <Button size="small" variant="outline">Calendrier</Button>
            </Link>
            <Link href={`/modules/asset-manager/${domainId}/changes/new`}>
              <Button size="small">+ Nouvelle demande</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <Selectbox label="Statut" value={filterStatus} onChange={(v) => setFilterStatus(String(v))} options={statusOptions} placeholder="Tous" />
        {!loading && changes.filter((c) => c.status === "cab_review").length > 0 && !filterStatus && (
          <Link
            href={`/modules/asset-manager/${domainId}/changes?status=cab_review`}
            className="rounded px-3 py-1.5 text-sm font-medium"
            style={{ background: "var(--bpm-accent-amber, #f59e0b)", color: "#fff" }}
          >
            {changes.filter((c) => c.status === "cab_review").length} en attente CAB
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="medium" />
        </div>
      ) : changes.length === 0 ? (
        <div className="rounded-xl border bg-[var(--bpm-surface)] p-4" style={{ border: "1px solid #E5E7EB", borderRadius: 12 }}>
          <EmptyState
            title="Aucune demande de changement"
            description="Créez une première demande (CAB) pour commencer."
            icon={<RefreshCw size={64} style={{ color: "var(--bpm-text-secondary)", opacity: 0.6 }} />}
            action={
              <Link href={`/modules/asset-manager/${domainId}/changes/new`}>
                <Button variant="primary" size="small">+ Nouvelle demande</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--bpm-border)" }}>
          <Table
            columns={columns}
            data={changes}
            minWidth={560}
            keyColumn="id"
            onRowClick={(row) => router.push(`/modules/asset-manager/${domainId}/changes/${(row as ChangeRequest).id}`)}
          />
        </div>
      )}

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>← Tableau de bord</Link>
        <Link href="/modules/asset-manager/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>Documentation</Link>
      </nav>
    </div>
  );
}
