"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Panel, Button, Spinner, Selectbox, Input } from "@/components/bpm";

const TYPE_OPTIONS = [
  { value: "garantie", label: "Garantie" },
  { value: "maintenance", label: "Maintenance" },
  { value: "leasing", label: "Leasing" },
  { value: "credit_bail", label: "Crédit-bail" },
  { value: "licence", label: "Licence" },
];

export default function AssetManagerContractNewPage() {
  const params = useParams();
  const router = useRouter();
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const [config, setConfig] = useState<{ domain_label?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reference, setReference] = useState("");
  const [type, setType] = useState("garantie");
  const [label, setLabel] = useState("");
  const [supplier, setSupplier] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [amount, setAmount] = useState("");
  const [noticeDays, setNoticeDays] = useState("30");
  const [autoRenewal, setAutoRenewal] = useState(false);
  const [notes, setNotes] = useState("");
  const [assetIds, setAssetIds] = useState<string[]>([]);
  const [assets, setAssets] = useState<{ id: string; reference: string; label: string }[]>([]);

  useEffect(() => {
    if (!domainId) return;
    Promise.all([
      fetch(`/api/asset-manager/config/${domainId}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/asset-manager/assets?domainId=${encodeURIComponent(domainId)}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([cfg, list]) => {
        setConfig(cfg);
        setAssets(Array.isArray(list) ? list : []);
      })
      .finally(() => setLoading(false));
  }, [domainId]);

  const toggleAsset = (aid: string) => {
    setAssetIds((prev) => (prev.includes(aid) ? prev.filter((id) => id !== aid) : [...prev, aid]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim() || !label.trim() || !startDate || !endDate || saving) return;
    setSaving(true);
    fetch("/api/asset-manager/contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        domainId,
        reference: reference.trim(),
        type,
        label: label.trim(),
        supplier: supplier.trim() || null,
        startDate,
        endDate,
        amount: amount ? parseFloat(amount) : null,
        noticeDays: parseInt(noticeDays, 10) || 30,
        autoRenewal,
        notes: notes.trim() || null,
        assetIds: assetIds.length > 0 ? assetIds : null,
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((created) => {
        if (created?.id) router.push(`/modules/asset-manager/${domainId}/contracts/${created.id}`);
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

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/asset-manager">Gestion d&apos;actifs</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}`}>Tableau de bord</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}/contracts`}>Contrats</Link> → Nouveau
        </nav>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>Nouveau contrat</h1>
      </div>

      <Panel variant="info" title="Créer un contrat">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Référence *" value={reference} onChange={(v) => setReference(v)} required placeholder="Ex. GAR-2025-001" />
          <Input label="Libellé *" value={label} onChange={(v) => setLabel(v)} required placeholder="Ex. Garantie constructeur" />
          <Selectbox label="Type *" value={type} onChange={(v) => setType(String(v))} options={TYPE_OPTIONS} />
          <Input label="Fournisseur" value={supplier} onChange={(v) => setSupplier(v)} placeholder="Fournisseur" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Début *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full rounded border px-2 py-1.5 text-sm"
                style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Fin *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full rounded border px-2 py-1.5 text-sm"
                style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
              />
            </div>
          </div>
          <Input label="Montant (€)" value={amount} onChange={(v) => setAmount(v)} placeholder="Optionnel" />
          <Input label="Préavis (jours)" value={noticeDays} onChange={(v) => setNoticeDays(v)} placeholder="30" />
          <Selectbox
            label="Renouvellement automatique"
            value={autoRenewal ? "yes" : "no"}
            onChange={(v) => setAutoRenewal(v === "yes")}
            options={[{ value: "no", label: "Non" }, { value: "yes", label: "Oui" }]}
          />
          {assets.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--bpm-text-secondary)" }}>Actifs couverts (optionnel)</label>
              <div className="max-h-40 overflow-y-auto rounded border p-2 space-y-1" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}>
                {assets.map((a) => (
                  <label key={a.id} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={assetIds.includes(a.id)}
                      onChange={() => toggleAsset(a.id)}
                      className="rounded"
                      style={{ accentColor: "var(--bpm-accent-cyan)" }}
                    />
                    <span style={{ color: "var(--bpm-text-primary)" }}>{a.reference} — {a.label}</span>
                  </label>
                ))}
              </div>
              {assetIds.length > 0 && (
                <p className="text-xs mt-1" style={{ color: "var(--bpm-text-secondary)" }}>{assetIds.length} actif(s) sélectionné(s)</p>
              )}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded border p-2 text-sm"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
              placeholder="Notes optionnelles"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" size="small" disabled={saving || !reference.trim() || !label.trim() || !startDate || !endDate}>
              {saving ? "Création…" : "Créer le contrat"}
            </Button>
            <Link href={`/modules/asset-manager/${domainId}/contracts`}>
              <Button type="button" variant="outline" size="small">Annuler</Button>
            </Link>
          </div>
        </form>
      </Panel>

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href={`/modules/asset-manager/${domainId}/contracts`} style={{ color: "var(--bpm-accent-cyan)" }}>← Liste des contrats</Link>
        <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>Tableau de bord</Link>
      </nav>
    </div>
  );
}
