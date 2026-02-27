"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Panel, Button, Spinner, Selectbox, Badge } from "@/components/bpm";
import { FicheHeader, FicheSectionCard, FicheFieldGrid, FicheNav, FicheSkeleton } from "@/components/fiche";

type ChangeRequest = {
  id: string;
  reference: string;
  type: string;
  title: string;
  description: string;
  impact: string;
  riskLevel: string;
  rollbackPlan: string;
  status: string;
  plannedStart: string | null;
  plannedEnd: string | null;
  createdAt: string;
  updatedAt: string;
};

const TYPE_LABELS: Record<string, string> = { standard: "Standard", normal: "Normal", emergency: "Urgent" };
const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon", submitted: "Soumis", cab_review: "Revue CAB", approved: "Approuvé", rejected: "Rejeté",
  scheduled: "Planifié", in_progress: "En cours", completed: "Terminé", failed: "Échoué", cancelled: "Annulé",
};
const RISK_LABELS: Record<string, string> = { low: "Faible", medium: "Moyen", high: "Élevé", critical: "Critique" };

function getRiskBandColor(riskLevel: string): string {
  switch (riskLevel) {
    case "critical": return "#ef4444";
    case "high": return "#f59e0b";
    case "medium": return "var(--bpm-accent-cyan)";
    case "low": return "var(--bpm-accent-mint)";
    default: return "var(--bpm-border)";
  }
}

function getRiskBadgeVariant(riskLevel: string): "error" | "warning" | "primary" | "success" | "default" {
  switch (riskLevel) {
    case "critical": return "error";
    case "high": return "warning";
    case "medium": return "primary";
    case "low": return "success";
    default: return "default";
  }
}

function getStatusBadgeVariant(status: string): "success" | "warning" | "error" | "default" {
  switch (status) {
    case "approved":
    case "completed":
      return "success";
    case "rejected":
    case "failed":
    case "cancelled":
      return "error";
    case "draft":
    case "submitted":
    case "cab_review":
    case "scheduled":
    case "in_progress":
      return "warning";
    default:
      return "default";
  }
}

function formatRollbackDisplay(value: string): React.ReactNode {
  const trimmed = (value ?? "").trim();
  if (!trimmed || trimmed.toUpperCase() === "NC") {
    return <span className="italic" style={{ color: "var(--bpm-text-secondary)" }}>— Non renseigné</span>;
  }
  return trimmed;
}

export default function AssetManagerChangeDetailPage() {
  const params = useParams();
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const id = typeof params?.id === "string" ? params.id : "";
  const [change, setChange] = useState<ChangeRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rejectComment, setRejectComment] = useState("");

  useEffect(() => {
    if (!domainId || !id) return;
    fetch(`/api/asset-manager/changes/${id}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then(setChange)
      .finally(() => setLoading(false));
  }, [domainId, id]);

  const handleStatusChange = async (value: string) => {
    if (!change || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/asset-manager/changes/${change.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: value }),
      });
      if (res.ok) setChange(await res.json());
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    if (!change || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/asset-manager/changes/${change.id}/approve`, { method: "POST", credentials: "include" });
      if (res.ok) setChange(await res.json());
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!change || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/asset-manager/changes/${change.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ comment: rejectComment.trim() || undefined }),
      });
      if (res.ok) {
        setChange(await res.json());
        setRejectComment("");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <FicheSkeleton sections={3} />;
  }

  if (!change) {
    return (
      <div className="doc-page">
        <Panel variant="warning" title="Demande introuvable">Cette demande n&apos;existe pas ou vous n&apos;y avez pas accès.</Panel>
        <nav className="doc-pagination mt-6 flex flex-wrap gap-2">
          <Link href={`/modules/asset-manager/${domainId}/changes`}>
            <Button variant="outline" size="small" className="border-transparent bg-transparent">← Changements</Button>
          </Link>
        </nav>
      </div>
    );
  }

  return (
    <div className="doc-page">
      <FicheHeader
        breadcrumb={
          <>
            <Link href={`/modules/asset-manager/${domainId}/changes`} style={{ color: "var(--bpm-accent-cyan)" }}>Changements</Link>
            <span style={{ color: "var(--bpm-text-secondary)" }}> → </span>
            <span>{change.reference}</span>
          </>
        }
        title={change.title}
        subtitle={
          <>
            <Badge variant="default">{change.reference}</Badge>
            <Badge variant={change.type === "emergency" ? "error" : change.type === "standard" ? "success" : "primary"}>
              {TYPE_LABELS[change.type] ?? change.type}
            </Badge>
            <Badge variant={getRiskBadgeVariant(change.riskLevel)}>
              {RISK_LABELS[change.riskLevel] ?? change.riskLevel}
            </Badge>
            <Badge variant={getStatusBadgeVariant(change.status)}>
              {STATUS_LABELS[change.status] ?? change.status}
            </Badge>
          </>
        }
      />

      {(change.status === "draft" || change.status === "submitted") && (
        <FicheSectionCard title="Soumettre au CAB" className="mb-4">
          <p className="text-sm mb-3" style={{ color: "var(--bpm-text-secondary)" }}>
            Envoyer cette demande en revue CAB pour approbation.
          </p>
          <Button variant="primary" size="small" onClick={() => handleStatusChange("cab_review")} disabled={saving}>
            Soumettre au CAB
          </Button>
        </FicheSectionCard>
      )}

      {change.status === "cab_review" && (
        <FicheSectionCard title="Revue CAB" className="mb-4">
          <p className="text-sm mb-3" style={{ color: "var(--bpm-text-secondary)" }}>
            Approuvez ou rejetez cette demande de changement.
          </p>
          <div className="flex flex-wrap items-end gap-4">
            <Button variant="primary" size="small" onClick={handleApprove} disabled={saving}>
              {saving ? "En cours…" : "Approuver"}
            </Button>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Commentaire de rejet (optionnel)</label>
              <input
                type="text"
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="Motif du rejet..."
                className="w-full rounded border p-2 text-sm"
                style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
              />
            </div>
            <Button variant="outline" size="small" onClick={handleReject} disabled={saving}>
              Rejeter
            </Button>
          </div>
        </FicheSectionCard>
      )}

      <FicheSectionCard title="Détail de la demande" className="mb-6">
        <FicheFieldGrid
          withDividers
          items={[
            {
              label: "Statut",
              value: (
                <span className="flex items-center gap-2">
                  <Selectbox
                    label=""
                    value={change.status}
                    onChange={(v) => handleStatusChange(String(v))}
                    options={Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))}
                  />
                  {saving && <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Enregistrement…</span>}
                </span>
              ),
            },
            { label: "Type", value: TYPE_LABELS[change.type] ?? change.type, asBadge: true, badgeVariant: change.type === "emergency" ? "error" : change.type === "standard" ? "success" : "primary" },
            { label: "Priorité", value: RISK_LABELS[change.riskLevel] ?? change.riskLevel, asBadge: true, badgeVariant: getRiskBadgeVariant(change.riskLevel) },
            {
              label: "Dates",
              value: change.plannedStart || change.plannedEnd
                ? [
                    change.plannedStart ? `Début prévu : ${new Date(change.plannedStart).toLocaleDateString("fr-FR")}` : null,
                    change.plannedEnd ? `Fin prévue : ${new Date(change.plannedEnd).toLocaleDateString("fr-FR")}` : null,
                  ].filter(Boolean).join(" · ")
                : "",
            },
          ]}
        />
        <div className="border-t pt-4 mt-4" style={{ borderColor: "var(--bpm-border)" }}>
          <p className="text-xs font-semibold uppercase mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Description</p>
          <p className="text-sm whitespace-pre-wrap m-0" style={{ color: "var(--bpm-text-primary)" }}>{change.description}</p>
        </div>
        <div className="border-t pt-4 mt-4" style={{ borderColor: "var(--bpm-border)" }}>
          <p className="text-xs font-semibold uppercase mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Impact</p>
          <p className="text-sm whitespace-pre-wrap m-0" style={{ color: "var(--bpm-text-primary)" }}>{change.impact}</p>
        </div>
        <div className="border-t pt-4 mt-4" style={{ borderColor: "var(--bpm-border)" }}>
          <p className="text-xs font-semibold uppercase mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Plan de rollback</p>
          <div className="text-sm whitespace-pre-wrap m-0" style={{ color: "var(--bpm-text-primary)" }}>
            {formatRollbackDisplay(change.rollbackPlan)}
          </div>
        </div>
        <div className="border-t pt-4 mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ borderColor: "var(--bpm-border)", color: "var(--bpm-text-secondary)" }}>
          <span>Créé le {new Date(change.createdAt).toLocaleString("fr-FR")}</span>
          <span>Modifié le {new Date(change.updatedAt).toLocaleString("fr-FR")}</span>
        </div>
      </FicheSectionCard>

      <FicheNav
        backLink={`/modules/asset-manager/${domainId}/changes`}
        backLabel="← Changements"
        secondaryLinks={[{ href: `/modules/asset-manager/${domainId}`, label: "Tableau de bord" }]}
      />
    </div>
  );
}
