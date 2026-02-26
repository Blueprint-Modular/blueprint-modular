"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Panel, Button, Spinner, Selectbox, Input } from "@/components/bpm";

type AssetContract = {
  id: string;
  domainId: string;
  reference: string;
  type: string;
  label: string;
  supplier: string | null;
  startDate: string;
  endDate: string;
  amount: number | null;
  autoRenewal: boolean;
  noticeDays: number;
  assetIds: string | null;
  notes: string | null;
  documentUrl: string | null;
  alertDaysBefore: number;
  createdAt: string;
  updatedAt: string;
};

const TYPE_OPTIONS = [
  { value: "garantie", label: "Garantie" },
  { value: "maintenance", label: "Maintenance" },
  { value: "leasing", label: "Leasing" },
  { value: "credit_bail", label: "Crédit-bail" },
  { value: "licence", label: "Licence" },
];

export default function AssetManagerContractDetailPage() {
  const params = useParams();
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const id = typeof params?.id === "string" ? params.id : "";
  const [contract, setContract] = useState<AssetContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editLabel, setEditLabel] = useState("");
  const [editSupplier, setEditSupplier] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editNoticeDays, setEditNoticeDays] = useState("");
  const [editAutoRenewal, setEditAutoRenewal] = useState(false);
  const [editNotes, setEditNotes] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/asset-manager/contracts/${id}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((c) => {
        setContract(c);
        if (c) {
          setEditLabel(c.label);
          setEditSupplier(c.supplier ?? "");
          setEditStartDate(c.startDate ? new Date(c.startDate).toISOString().slice(0, 10) : "");
          setEditEndDate(c.endDate ? new Date(c.endDate).toISOString().slice(0, 10) : "");
          setEditAmount(c.amount != null ? String(c.amount) : "");
          setEditNoticeDays(String(c.noticeDays ?? 30));
          setEditAutoRenewal(c.autoRenewal);
          setEditNotes(c.notes ?? "");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = () => {
    if (!contract || saving) return;
    setSaving(true);
    fetch(`/api/asset-manager/contracts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        label: editLabel.trim(),
        supplier: editSupplier.trim() || null,
        startDate: editStartDate || null,
        endDate: editEndDate || null,
        amount: editAmount ? parseFloat(editAmount) : null,
        noticeDays: parseInt(editNoticeDays, 10) || 30,
        autoRenewal: editAutoRenewal,
        notes: editNotes.trim() || null,
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((updated) => {
        if (updated) setContract(updated);
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

  if (!contract) {
    return (
      <div className="doc-page">
        <Panel variant="warning" title="Contrat introuvable">Ce contrat n&apos;existe pas ou vous n&apos;y avez pas accès.</Panel>
        <nav className="doc-pagination mt-6">
          <Link href={`/modules/asset-manager/${domainId}/contracts`} style={{ color: "var(--bpm-accent-cyan)" }}>← Liste des contrats</Link>
        </nav>
      </div>
    );
  }

  const typeLabel = TYPE_OPTIONS.find((o) => o.value === contract.type)?.label ?? contract.type;

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/asset-manager">Gestion d&apos;actifs</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}`}>Tableau de bord</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}/contracts`}>Contrats</Link> → {contract.reference}
        </nav>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
          {contract.label}
        </h1>
        <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
          {contract.reference} — {typeLabel}
        </p>
      </div>

      <Panel variant="info" title="Détail du contrat">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-4">
          <dt style={{ color: "var(--bpm-text-secondary)" }}>Référence</dt>
          <dd>{contract.reference}</dd>
          <dt style={{ color: "var(--bpm-text-secondary)" }}>Type</dt>
          <dd>{typeLabel}</dd>
          <dt style={{ color: "var(--bpm-text-secondary)" }}>Libellé</dt>
          <dd>
            <Input value={editLabel} onChange={(v) => setEditLabel(v)} placeholder="Libellé" />
          </dd>
          <dt style={{ color: "var(--bpm-text-secondary)" }}>Fournisseur</dt>
          <dd>
            <Input value={editSupplier} onChange={(v) => setEditSupplier(v)} placeholder="Fournisseur" />
          </dd>
          <dt style={{ color: "var(--bpm-text-secondary)" }}>Début</dt>
          <dd>
            <input
              type="date"
              value={editStartDate}
              onChange={(e) => setEditStartDate(e.target.value)}
              className="w-full rounded border px-2 py-1.5 text-sm"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
            />
          </dd>
          <dt style={{ color: "var(--bpm-text-secondary)" }}>Fin</dt>
          <dd>
            <input
              type="date"
              value={editEndDate}
              onChange={(e) => setEditEndDate(e.target.value)}
              className="w-full rounded border px-2 py-1.5 text-sm"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
            />
          </dd>
          <dt style={{ color: "var(--bpm-text-secondary)" }}>Montant (€)</dt>
          <dd>
            <Input value={editAmount} onChange={(v) => setEditAmount(v)} placeholder="Montant" />
          </dd>
          <dt style={{ color: "var(--bpm-text-secondary)" }}>Préavis (jours)</dt>
          <dd>
            <Input value={editNoticeDays} onChange={(v) => setEditNoticeDays(v)} placeholder="30" />
          </dd>
          <dt style={{ color: "var(--bpm-text-secondary)" }}>Renouvellement auto</dt>
          <dd>
            <Selectbox
              value={editAutoRenewal ? "yes" : "no"}
              onChange={(v) => setEditAutoRenewal(v === "yes")}
              options={[{ value: "no", label: "Non" }, { value: "yes", label: "Oui" }]}
            />
          </dd>
        </dl>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Notes</label>
          <textarea
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
            rows={3}
            className="w-full rounded border p-2 text-sm"
            style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
            placeholder="Notes"
          />
        </div>
        <Button size="small" onClick={handleSave} disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</Button>
      </Panel>

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href={`/modules/asset-manager/${domainId}/contracts`} style={{ color: "var(--bpm-accent-cyan)" }}>← Liste des contrats</Link>
        <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>Tableau de bord</Link>
        <Link href="/modules/asset-manager/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>Documentation</Link>
      </nav>
    </div>
  );
}
