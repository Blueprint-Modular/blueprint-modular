"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Panel, Button, Spinner, Selectbox, Badge, Card } from "@/components/bpm";
import { FicheHeader, FicheSectionCard, FicheFieldGrid, FicheNav, FicheSkeleton } from "@/components/fiche";

type Assignment = {
  id: string;
  reference: string;
  assignmentType: string;
  startDate: string;
  expectedEndDate: string | null;
  actualEndDate: string | null;
  status: string;
  reason: string | null;
  conditionAtStart: string | null;
  conditionAtReturn: string | null;
  contractSigned: boolean;
  notes: string | null;
  asset: { id: string; reference: string; label: string } | null;
  assignee: { id: string; name: string | null; email: string | null } | null;
  technician: { id: string; name: string | null } | null;
  ticket: { id: string; reference: string; title: string } | null;
};

const STATUS_OPTIONS = [
  { value: "active", label: "En cours" },
  { value: "returned", label: "Retourné" },
  { value: "overdue", label: "En retard" },
  { value: "cancelled", label: "Annulé" },
];

function statusBadgeVariant(s: string): "primary" | "success" | "warning" | "error" | "default" {
  if (s === "returned") return "success";
  if (s === "active") return "primary";
  if (s === "overdue") return "error";
  if (s === "cancelled") return "default";
  return "default";
}

export default function AssetManagerAssignmentDetailPage() {
  const params = useParams();
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const id = typeof params?.id === "string" ? params.id : "";
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [returning, setReturning] = useState(false);
  const [editStatus, setEditStatus] = useState("");
  const [editConditionReturn, setEditConditionReturn] = useState("");
  const [editContractSigned, setEditContractSigned] = useState(false);

  const handleReturn = () => {
    if (!assignment || assignment.status !== "active" || returning) return;
    if (!confirm("Clôturer cette mise à Disposition et remettre l'actif en stock ?")) return;
    setReturning(true);
    fetch(`/api/asset-manager/assignments/${id}/return`, { method: "POST", credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((updated) => {
        if (updated) {
          setAssignment(updated);
          setEditStatus(updated.status);
          setEditConditionReturn(updated.conditionAtReturn ?? "");
          setEditContractSigned(updated.contractSigned);
        }
      })
      .finally(() => setReturning(false));
  };

  useEffect(() => {
    if (!id) return;
    fetch(`/api/asset-manager/assignments/${id}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((a) => {
        setAssignment(a);
        if (a) {
          setEditStatus(a.status);
          setEditConditionReturn(a.conditionAtReturn ?? "");
          setEditContractSigned(a.contractSigned);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = () => {
    if (!assignment || saving) return;
    setSaving(true);
    fetch(`/api/asset-manager/assignments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        status: editStatus,
        conditionAtReturn: editConditionReturn.trim() || null,
        contractSigned: editContractSigned,
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((updated) => {
        if (updated) setAssignment(updated);
      })
      .finally(() => setSaving(false));
  };

  if (loading) {
    return <FicheSkeleton sections={2} withForm />;
  }

  if (!assignment) {
    return (
      <div className="doc-page">
        <Panel variant="warning" title="Mise à Disposition introuvable">Cette MAD n&apos;existe pas ou vous n&apos;y avez pas accès.</Panel>
        <FicheNav backLink={`/modules/asset-manager/${domainId}/assignments`} backLabel="← Liste des MAD" />
      </div>
    );
  }

  const statusLabel = STATUS_OPTIONS.find((o) => o.value === assignment.status)?.label ?? assignment.status;

  return (
    <div className="doc-page">
      <FicheHeader
        breadcrumb={
          <>
            <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>Modules</Link> → <Link href="/modules/asset-manager" style={{ color: "var(--bpm-accent-cyan)" }}>Gestion de parc</Link> →{" "}
            <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>Tableau de bord</Link> →{" "}
            <Link href={`/modules/asset-manager/${domainId}/assignments`} style={{ color: "var(--bpm-accent-cyan)" }}>MAD</Link> → {assignment.reference}
          </>
        }
        title={assignment.reference}
        subtitle={
          <>
            <Badge variant="default">{assignment.asset?.label ?? "—"}</Badge>
            <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
              Bénéficiaire : {assignment.assignee?.name ?? assignment.assignee?.email ?? "—"}
            </span>
            <Badge variant={statusBadgeVariant(assignment.status)}>{statusLabel}</Badge>
          </>
        }
      />

      {assignment.status === "active" && (
        <FicheSectionCard title="Restituer l'actif" className="mt-4">
          <p className="text-sm mb-3" style={{ color: "var(--bpm-text-secondary)" }}>
            Clôture la MAD, enregistre la date de retour et remet l'actif en stock.
          </p>
          <Button variant="primary" size="medium" onClick={handleReturn} disabled={returning}>
            {returning ? "En cours…" : "Restituer l'actif"}
          </Button>
        </FicheSectionCard>
      )}

      <FicheSectionCard title="Informations" className="mt-4">
        <FicheFieldGrid
          withDividers
          items={[
            { label: "Actif", value: assignment.asset ? `${assignment.asset.reference} — ${assignment.asset.label}` : "" },
            { label: "Bénéficiaire", value: assignment.assignee?.name ?? assignment.assignee?.email ?? "" },
            { label: "Début", value: new Date(assignment.startDate).toLocaleDateString("fr-FR") },
            { label: "Fin prévue", value: assignment.expectedEndDate ? new Date(assignment.expectedEndDate).toLocaleDateString("fr-FR") : "" },
            { label: "Fin réelle", value: assignment.actualEndDate ? new Date(assignment.actualEndDate).toLocaleDateString("fr-FR") : "" },
            { label: "Ticket lié", value: assignment.ticket ? `${assignment.ticket.reference} — ${assignment.ticket.title}` : "" },
            ...(assignment.reason ? [{ label: "Motif", value: assignment.reason }] : []),
          ]}
        />
      </FicheSectionCard>

      <Card variant="outlined" className="mt-4">
        <div className="bpm-card-body p-4">
          <h3 className="text-base font-semibold mb-3" style={{ color: "var(--bpm-text-primary)" }}>Modifier</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Selectbox label="Statut" value={editStatus} onChange={(v) => setEditStatus(String(v))} options={STATUS_OPTIONS} />
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>État au retour</label>
              <textarea
                value={editConditionReturn}
                onChange={(e) => setEditConditionReturn(e.target.value)}
                rows={2}
                className="bpm-textarea w-full rounded-lg border px-3 py-2 text-sm resize-y"
                style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
              />
            </div>
            <label className="flex items-center gap-2 col-span-2">
              <input type="checkbox" checked={editContractSigned} onChange={(e) => setEditContractSigned(e.target.checked)} />
              <span style={{ color: "var(--bpm-text-primary)" }}>Contrat signé</span>
            </label>
          </div>
          <div className="mt-4">
            <Button variant="primary" size="medium" onClick={handleSave} disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
        </div>
      </Card>

      <FicheNav
        backLink={`/modules/asset-manager/${domainId}/assignments`}
        backLabel="← Liste des MAD"
        secondaryLinks={[{ href: `/modules/asset-manager/${domainId}`, label: "Tableau de bord" }]}
      />
    </div>
  );
}
