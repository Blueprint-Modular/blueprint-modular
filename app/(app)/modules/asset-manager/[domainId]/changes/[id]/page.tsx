"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Panel, Button, Spinner, Selectbox } from "@/components/bpm";

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

export default function AssetManagerChangeDetailPage() {
  const params = useParams();
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const id = typeof params?.id === "string" ? params.id : "";
  const [change, setChange] = useState<ChangeRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  if (loading) {
    return (
      <div className="doc-page flex justify-center py-12">
        <Spinner size="medium" />
      </div>
    );
  }

  if (!change) {
    return (
      <div className="doc-page">
        <Panel variant="warning" title="Demande introuvable">Cette demande n&apos;existe pas ou vous n&apos;y avez pas accès.</Panel>
        <nav className="doc-pagination mt-6">
          <Link href={`/modules/asset-manager/${domainId}/changes`} style={{ color: "var(--bpm-accent-cyan)" }}>← Changements</Link>
        </nav>
      </div>
    );
  }

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <nav className="doc-breadcrumb">
          <Link href={`/modules/asset-manager/${domainId}/changes`} style={{ color: "var(--bpm-accent-cyan)" }}>Changements</Link> → {change.reference}
        </nav>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>{change.title}</h1>
        <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
          {change.reference} — {TYPE_LABELS[change.type] ?? change.type} — {RISK_LABELS[change.riskLevel] ?? change.riskLevel}
        </p>
      </div>

      <Panel variant="info" title="Statut" className="mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Selectbox
            label=""
            value={change.status}
            onChange={(v) => handleStatusChange(String(v))}
            options={Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))}
          />
          {saving && <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Enregistrement…</span>}
        </div>
      </Panel>

      <Panel variant="info" title="Description" className="mb-4">
        <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--bpm-text-primary)" }}>{change.description}</p>
      </Panel>

      <Panel variant="info" title="Impact" className="mb-4">
        <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--bpm-text-primary)" }}>{change.impact}</p>
      </Panel>

      <Panel variant="info" title="Plan de rollback" className="mb-4">
        <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--bpm-text-primary)" }}>{change.rollbackPlan}</p>
      </Panel>

      <p className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
        Créé le {new Date(change.createdAt).toLocaleString("fr-FR")}
        {change.plannedStart && ` · Début prévu : ${new Date(change.plannedStart).toLocaleDateString("fr-FR")}`}
        {change.plannedEnd && ` · Fin prévue : ${new Date(change.plannedEnd).toLocaleDateString("fr-FR")}`}
      </p>

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href={`/modules/asset-manager/${domainId}/changes`} style={{ color: "var(--bpm-accent-cyan)" }}>← Changements</Link>
        <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>Tableau de bord</Link>
      </nav>
    </div>
  );
}
