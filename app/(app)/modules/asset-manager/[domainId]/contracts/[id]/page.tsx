"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Panel, Button, Spinner, Selectbox, Input, Badge, Card } from "@/components/bpm";
import { FicheHeader, FicheSectionCard, FicheFieldGrid, FicheNav, FicheSkeleton } from "@/components/fiche";

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
    return <FicheSkeleton singleSection />;
  }

  if (!contract) {
    return (
      <div className="doc-page">
        <Panel variant="warning" title="Contrat introuvable">Ce contrat n&apos;existe pas ou vous n&apos;y avez pas accès.</Panel>
        <FicheNav backLink={`/modules/asset-manager/${domainId}/contracts`} backLabel="← Liste des contrats" />
      </div>
    );
  }

  const typeLabel = TYPE_OPTIONS.find((o) => o.value === contract.type)?.label ?? contract.type;

  return (
    <div className="doc-page">
      <FicheHeader
        breadcrumb={
          <>
            <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>Modules</Link> → <Link href="/modules/asset-manager" style={{ color: "var(--bpm-accent-cyan)" }}>Gestion de parc</Link> →{" "}
            <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>Tableau de bord</Link> →{" "}
            <Link href={`/modules/asset-manager/${domainId}/contracts`} style={{ color: "var(--bpm-accent-cyan)" }}>Contrats</Link> → {contract.reference}
          </>
        }
        title={contract.label}
        subtitle={
          <>
            <Badge variant="default">{contract.reference}</Badge>
            <Badge variant="default">{typeLabel}</Badge>
          </>
        }
      />

      <Card variant="outlined" className="mt-4">
        <div className="bpm-card-body p-4">
          <h3 className="text-base font-semibold mb-3" style={{ color: "var(--bpm-text-primary)" }}>Détail du contrat</h3>
          <FicheFieldGrid
            withDividers
            items={[
              { label: "Référence", value: contract.reference },
              { label: "Type", value: typeLabel, asBadge: true },
              {
                label: "Libellé",
                value: <Input value={editLabel} onChange={(v) => setEditLabel(v)} placeholder="Libellé" />,
              },
              {
                label: "Fournisseur",
                value: <Input value={editSupplier} onChange={(v) => setEditSupplier(v)} placeholder="Fournisseur" />,
              },
              {
                label: "Début",
                value: (
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full rounded-lg border px-2 py-1.5 text-sm"
                    style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
                  />
                ),
              },
              {
                label: "Fin",
                value: (
                  <input
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="w-full rounded-lg border px-2 py-1.5 text-sm"
                    style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
                  />
                ),
              },
              {
                label: "Montant (€)",
                value: <Input value={editAmount} onChange={(v) => setEditAmount(v)} placeholder="Montant" />,
              },
              {
                label: "Préavis (jours)",
                value: <Input value={editNoticeDays} onChange={(v) => setEditNoticeDays(v)} placeholder="30" />,
              },
              {
                label: "Renouvellement auto",
                value: (
                  <Selectbox
                    value={editAutoRenewal ? "yes" : "no"}
                    onChange={(v) => setEditAutoRenewal(v === "yes")}
                    options={[{ value: "no", label: "Non" }, { value: "yes", label: "Oui" }]}
                  />
                ),
              },
            ]}
          />
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Notes</label>
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              rows={3}
              className="bpm-textarea w-full rounded-lg border px-3 py-2 text-sm resize-y"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
              placeholder="Notes"
            />
          </div>
          <div className="mt-4">
            <Button variant="primary" size="medium" onClick={handleSave} disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
        </div>
      </Card>

      <FicheNav
        backLink={`/modules/asset-manager/${domainId}/contracts`}
        backLabel="← Liste des contrats"
        secondaryLinks={[
          { href: `/modules/asset-manager/${domainId}`, label: "Tableau de bord" },
          { href: "/modules/asset-manager/documentation", label: "Documentation" },
        ]}
      />
    </div>
  );
}
