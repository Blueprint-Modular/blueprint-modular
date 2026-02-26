"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Panel, Button, Spinner, Selectbox } from "@/components/bpm";

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

export default function AssetManagerAssignmentDetailPage() {
  const params = useParams();
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const id = typeof params?.id === "string" ? params.id : "";
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editStatus, setEditStatus] = useState("");
  const [editConditionReturn, setEditConditionReturn] = useState("");
  const [editContractSigned, setEditContractSigned] = useState(false);

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
    return (
      <div className="doc-page flex justify-center py-12">
        <Spinner size="medium" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="doc-page">
        <Panel variant="warning" title="Mise à disposition introuvable">Cette MAD n&apos;existe pas ou vous n&apos;y avez pas accès.</Panel>
        <Link href={`/modules/asset-manager/${domainId}/assignments`} style={{ color: "var(--bpm-accent-cyan)" }}>← Liste des MAD</Link>
      </div>
    );
  }

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/asset-manager">Gestion d&apos;actifs</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}`}>Tableau de bord</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}/assignments`}>MAD</Link> → {assignment.reference}
        </nav>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>{assignment.reference}</h1>
        <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
          {assignment.asset?.label ?? "—"} — Bénéficiaire : {assignment.assignee?.name ?? assignment.assignee?.email ?? "—"}
        </p>
      </div>

      <Panel variant="info" title="Informations">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <dt style={{ color: "var(--bpm-text-secondary)" }}>Actif</dt>
          <dd>{assignment.asset ? `${assignment.asset.reference} — ${assignment.asset.label}` : "—"}</dd>
          <dt style={{ color: "var(--bpm-text-secondary)" }}>Bénéficiaire</dt>
          <dd>{assignment.assignee?.name ?? assignment.assignee?.email ?? "—"}</dd>
          <dt style={{ color: "var(--bpm-text-secondary)" }}>Début</dt>
          <dd>{new Date(assignment.startDate).toLocaleDateString("fr-FR")}</dd>
          <dt style={{ color: "var(--bpm-text-secondary)" }}>Fin prévue</dt>
          <dd>{assignment.expectedEndDate ? new Date(assignment.expectedEndDate).toLocaleDateString("fr-FR") : "—"}</dd>
          <dt style={{ color: "var(--bpm-text-secondary)" }}>Fin réelle</dt>
          <dd>{assignment.actualEndDate ? new Date(assignment.actualEndDate).toLocaleDateString("fr-FR") : "—"}</dd>
          <dt style={{ color: "var(--bpm-text-secondary)" }}>Ticket lié</dt>
          <dd>{assignment.ticket ? `${assignment.ticket.reference} — ${assignment.ticket.title}` : "—"}</dd>
          {assignment.reason && (
            <>
              <dt style={{ color: "var(--bpm-text-secondary)" }}>Motif</dt>
              <dd>{assignment.reason}</dd>
            </>
          )}
        </dl>
      </Panel>

      <Panel variant="info" title="Modifier" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Selectbox label="Statut" value={editStatus} onChange={(v) => setEditStatus(String(v))} options={STATUS_OPTIONS} />
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>État au retour</label>
            <textarea
              value={editConditionReturn}
              onChange={(e) => setEditConditionReturn(e.target.value)}
              rows={2}
              className="w-full rounded border p-2 text-sm"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
            />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={editContractSigned} onChange={(e) => setEditContractSigned(e.target.checked)} />
            <span style={{ color: "var(--bpm-text-primary)" }}>Contrat signé</span>
          </label>
        </div>
        <div className="mt-4">
          <Button size="small" onClick={handleSave} disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</Button>
        </div>
      </Panel>

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href={`/modules/asset-manager/${domainId}/assignments`} style={{ color: "var(--bpm-accent-cyan)" }}>← Liste des MAD</Link>
        <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>Tableau de bord</Link>
      </nav>
    </div>
  );
}
