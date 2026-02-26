"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Panel, Button, Spinner, Selectbox, Input } from "@/components/bpm";
import type { DomainConfig } from "@/lib/asset-manager/get-domain-config";

type Asset = {
  id: string;
  reference: string;
  label: string;
  assetTypeId: string;
  statusId: string;
  lifecycleStage?: string | null;
  brand?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  notes?: string | null;
  attributes: { key: string; valueText?: string | null; valueNumber?: number | null; valueDate?: string | null; valueBool?: boolean | null }[];
  createdBy?: { name?: string | null } | null;
};

type Movement = {
  id: string;
  assetId: string;
  movementType: string;
  date: string;
  reason?: string | null;
  notes?: string | null;
  ticketId?: string | null;
  createdAt: string;
};

const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  reception: "Réception",
  deployment: "Déploiement",
  transfer: "Transfert",
  return: "Retour",
  repair_out: "Sortie réparation",
  repair_in: "Retour réparation",
  disposal: "Réforme",
};

const RELATION_TYPE_LABELS: Record<string, string> = {
  depends_on: "Dépend de",
  connected_to: "Connecté à",
  hosted_on: "Hébergé sur",
  fed_by: "Alimenté par",
  controls: "Contrôle",
};

type CIRelation = {
  id: string;
  sourceAssetId: string;
  targetAssetId: string;
  relationType: string;
  description?: string | null;
  sourceAsset: { id: string; reference: string; label: string };
  targetAsset: { id: string; reference: string; label: string };
};

const DEFAULT_LIFECYCLE_STAGES = [
  { id: "achat", label: "Achat" },
  { id: "reception", label: "Réception" },
  { id: "deploiement", label: "Déploiement" },
  { id: "en_service", label: "En service" },
  { id: "maintenance", label: "Maintenance" },
  { id: "renouvellement", label: "Renouvellement" },
  { id: "reforme", label: "Réforme" },
];

export default function AssetDetailPage() {
  const params = useParams();
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const id = typeof params?.id === "string" ? params.id : "";
  const [config, setConfig] = useState<DomainConfig | null>(null);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingLifecycle, setSavingLifecycle] = useState(false);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [newMovementType, setNewMovementType] = useState("deployment");
  const [newMovementDate, setNewMovementDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [newMovementReason, setNewMovementReason] = useState("");
  const [newMovementNotes, setNewMovementNotes] = useState("");
  const [savingMovement, setSavingMovement] = useState(false);
  const [relations, setRelations] = useState<CIRelation[]>([]);
  const [loadingRelations, setLoadingRelations] = useState(false);
  const [showRelationForm, setShowRelationForm] = useState(false);
  const [newRelationTargetId, setNewRelationTargetId] = useState("");
  const [newRelationType, setNewRelationType] = useState("depends_on");
  const [savingRelation, setSavingRelation] = useState(false);
  const [domainAssets, setDomainAssets] = useState<{ id: string; reference: string; label: string }[]>([]);

  useEffect(() => {
    if (!domainId || !id) return;
    Promise.all([
      fetch(`/api/asset-manager/config/${domainId}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/asset-manager/assets/${id}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([cfg, a]) => {
        setConfig(cfg);
        setAsset(a);
      })
      .finally(() => setLoading(false));
  }, [domainId, id]);

  const fetchMovements = useCallback(() => {
    if (!id) return;
    setLoadingMovements(true);
    fetch(`/api/asset-manager/movements?assetId=${encodeURIComponent(id)}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => setMovements(Array.isArray(list) ? list : []))
      .finally(() => setLoadingMovements(false));
  }, [id]);

  useEffect(() => {
    if (!asset?.id) return;
    fetchMovements();
  }, [asset?.id, fetchMovements]);

  const fetchRelations = useCallback(() => {
    if (!domainId || !id) return;
    setLoadingRelations(true);
    fetch(`/api/asset-manager/ci-relations?domainId=${encodeURIComponent(domainId)}&assetId=${encodeURIComponent(id)}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => setRelations(Array.isArray(list) ? list : []))
      .finally(() => setLoadingRelations(false));
  }, [domainId, id]);

  useEffect(() => {
    if (!asset?.id) return;
    fetchRelations();
  }, [asset?.id, fetchRelations]);

  const handleAddRelation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset || !domainId || !newRelationTargetId || savingRelation) return;
    setSavingRelation(true);
    try {
      const res = await fetch("/api/asset-manager/ci-relations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          domainId,
          sourceAssetId: asset.id,
          targetAssetId: newRelationTargetId,
          relationType: newRelationType,
        }),
      });
      if (res.ok) {
        setNewRelationTargetId("");
        setShowRelationForm(false);
        fetchRelations();
      }
    } finally {
      setSavingRelation(false);
    }
  };

  const handleDeleteRelation = async (relId: string) => {
    if (!confirm("Supprimer cette relation ?")) return;
    const res = await fetch(`/api/asset-manager/ci-relations/${relId}`, { method: "DELETE", credentials: "include" });
    if (res.ok) fetchRelations();
  };

  const loadDomainAssetsForRelation = useCallback(() => {
    if (domainId && domainAssets.length === 0) {
      fetch(`/api/asset-manager/assets?domainId=${encodeURIComponent(domainId)}`, { credentials: "include" })
        .then((r) => (r.ok ? r.json() : []))
        .then((list) => setDomainAssets(Array.isArray(list) ? list.filter((a: { id: string }) => a.id !== asset?.id) : []));
    }
  }, [domainId, asset?.id, domainAssets.length]);

  const getStatusLabel = (sid: string) => config?.statuses.find((s) => s.id === sid)?.label ?? sid;
  const getTypeLabel = (tid: string) => config?.asset_types.find((t) => t.id === tid)?.label ?? tid;
  const lifecycleStages = config?.lifecycle_stages?.length ? config.lifecycle_stages : DEFAULT_LIFECYCLE_STAGES;
  const getLifecycleLabel = (lid: string | null | undefined) =>
    lid ? (lifecycleStages.find((s) => s.id === lid)?.label ?? lid) : "—";

  const handleLifecycleChange = async (value: string) => {
    if (!asset || savingLifecycle) return;
    const stage = value || null;
    setSavingLifecycle(true);
    try {
      const res = await fetch(`/api/asset-manager/assets/${asset.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ lifecycleStage: stage }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAsset(updated);
      }
    } finally {
      setSavingLifecycle(false);
    }
  };

  const handleAddMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asset || savingMovement) return;
    setSavingMovement(true);
    try {
      const res = await fetch("/api/asset-manager/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          assetId: asset.id,
          movementType: newMovementType,
          date: newMovementDate,
          reason: newMovementReason.trim() || null,
          notes: newMovementNotes.trim() || null,
        }),
      });
      if (res.ok) {
        setNewMovementReason("");
        setNewMovementNotes("");
        setShowMovementForm(false);
        fetchMovements();
      }
    } finally {
      setSavingMovement(false);
    }
  };

  if (loading) {
    return (
      <div className="doc-page flex justify-center py-12">
        <Spinner size="medium" />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="doc-page">
        <div className="doc-page-header mb-6">
          <nav className="doc-breadcrumb">
            <Link href="/modules">Modules</Link> → <Link href="/modules/asset-manager">Gestion d&apos;actifs</Link>
          </nav>
          <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>Gestion d&apos;actifs</h1>
        </div>
        <Panel variant="warning" title="Actif introuvable">
          L&apos;actif demandé n&apos;existe pas ou vous n&apos;y avez pas accès.
        </Panel>
        <nav className="doc-pagination mt-6">
          <Link href={`/modules/asset-manager/${domainId}/assets`} style={{ color: "var(--bpm-accent-cyan)" }}>← Retour à la liste</Link>
        </nav>
      </div>
    );
  }

  const attrsByKey = Object.fromEntries(asset.attributes.map((a) => [a.key, a]));

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/asset-manager">Gestion d&apos;actifs</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}/assets`}>{config?.asset_label_plural ?? "Actifs"}</Link> → {asset.reference}
        </nav>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
          {asset.label}
        </h1>
        <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
          {asset.reference} — {getTypeLabel(asset.assetTypeId)} — {getStatusLabel(asset.statusId)}
        </p>
      </div>

      <Panel variant="info" title="Informations générales">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <dt style={{ color: "var(--bpm-text-secondary)" }}>Référence</dt>
          <dd>{asset.reference}</dd>
          <dt style={{ color: "var(--bpm-text-secondary)" }}>Type</dt>
          <dd>{getTypeLabel(asset.assetTypeId)}</dd>
          <dt style={{ color: "var(--bpm-text-secondary)" }}>Statut</dt>
          <dd>{getStatusLabel(asset.statusId)}</dd>
          <dt style={{ color: "var(--bpm-text-secondary)" }}>Étape de cycle de vie</dt>
          <dd>
            <Selectbox
              label=""
              value={asset.lifecycleStage ?? ""}
              onChange={(v) => handleLifecycleChange(String(v))}
              options={[{ value: "", label: "— Non défini" }, ...lifecycleStages.map((s) => ({ value: s.id, label: s.label }))]}
              placeholder="Choisir"
            />
            {savingLifecycle && <span className="ml-2 text-xs" style={{ color: "var(--bpm-text-secondary)" }}>Enregistrement…</span>}
          </dd>
          {asset.brand && (
            <>
              <dt style={{ color: "var(--bpm-text-secondary)" }}>Marque</dt>
              <dd>{asset.brand}</dd>
            </>
          )}
          {asset.model && (
            <>
              <dt style={{ color: "var(--bpm-text-secondary)" }}>Modèle</dt>
              <dd>{asset.model}</dd>
            </>
          )}
          {asset.serialNumber && (
            <>
              <dt style={{ color: "var(--bpm-text-secondary)" }}>N° série</dt>
              <dd>{asset.serialNumber}</dd>
            </>
          )}
        </dl>
      </Panel>

      {config?.asset_types && asset.attributes.length > 0 && (
        <Panel variant="info" title="Caractéristiques" className="mt-4">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {config.asset_types
              .find((t) => t.id === asset.assetTypeId)
              ?.fields.filter((f) => attrsByKey[f.key])
              .map((f) => {
                const a = attrsByKey[f.key];
                let val = "";
                if (a?.valueText != null) val = a.valueText;
                else if (a?.valueNumber != null) val = String(a.valueNumber);
                else if (a?.valueDate) val = new Date(a.valueDate).toLocaleDateString("fr-FR");
                else if (a?.valueBool != null) val = a.valueBool ? "Oui" : "Non";
                return (
                  <span key={f.key} className="col-span-2 md:col-span-1 flex gap-2">
                    <dt style={{ color: "var(--bpm-text-secondary)", minWidth: "8rem" }}>{f.label}</dt>
                    <dd>{val}</dd>
                  </span>
                );
              })}
          </dl>
        </Panel>
      )}

      <Panel variant="info" title="Historique des mouvements" className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
            {movements.length} mouvement{movements.length !== 1 ? "s" : ""}
          </span>
          <Button
            size="small"
            variant="outline"
            onClick={() => setShowMovementForm((v) => !v)}
          >
            {showMovementForm ? "Annuler" : "+ Ajouter un mouvement"}
          </Button>
        </div>
        {showMovementForm && (
          <form onSubmit={handleAddMovement} className="mb-4 p-4 rounded-lg border border-[var(--bpm-border)]" style={{ background: "var(--bpm-bg-secondary)" }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <Selectbox
                label="Type"
                value={newMovementType}
                onChange={(v) => setNewMovementType(String(v))}
                options={Object.entries(MOVEMENT_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
              />
              <Input
                label="Date"
                type="date"
                value={newMovementDate}
                onChange={(v) => setNewMovementDate(v)}
              />
            </div>
            <Input
              label="Raison (optionnel)"
              value={newMovementReason}
              onChange={setNewMovementReason}
              placeholder="Ex. Affectation bureau 101"
            />
            <div className="mt-3">
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Notes (optionnel)</label>
              <textarea
                value={newMovementNotes}
                onChange={(e) => setNewMovementNotes(e.target.value)}
                rows={2}
                className="w-full rounded border p-2 text-sm"
                style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
                placeholder="Commentaire"
              />
            </div>
            <Button type="submit" size="small" className="mt-3" disabled={savingMovement}>
              {savingMovement ? "Enregistrement…" : "Enregistrer le mouvement"}
            </Button>
          </form>
        )}
        {loadingMovements ? (
          <div className="flex justify-center py-6">
            <Spinner size="small" />
          </div>
        ) : movements.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Aucun mouvement enregistré.</p>
        ) : (
          <ul className="space-y-2">
            {movements.map((m) => (
              <li
                key={m.id}
                className="flex flex-wrap items-baseline gap-2 py-2 border-b border-[var(--bpm-border)] last:border-0 text-sm"
              >
                <span className="font-medium" style={{ color: "var(--bpm-text-primary)", minWidth: "10rem" }}>
                  {new Date(m.date).toLocaleDateString("fr-FR")}
                </span>
                <span className="rounded px-2 py-0.5 text-xs font-medium" style={{ background: "var(--bpm-accent-cyan)", color: "#fff" }}>
                  {MOVEMENT_TYPE_LABELS[m.movementType] ?? m.movementType}
                </span>
                {m.reason && <span style={{ color: "var(--bpm-text-secondary)" }}>{m.reason}</span>}
                {m.notes && <span className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>— {m.notes}</span>}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel variant="info" title="Dépendances / Cartographie" className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
            {relations.length} relation{relations.length !== 1 ? "s" : ""}
          </span>
          <Button size="small" variant="outline" onClick={() => { setShowRelationForm((v) => !v); loadDomainAssetsForRelation(); }}>
            {showRelationForm ? "Annuler" : "+ Ajouter une relation"}
          </Button>
        </div>
        {showRelationForm && (
          <form onSubmit={handleAddRelation} className="mb-4 p-4 rounded-lg border border-[var(--bpm-border)]" style={{ background: "var(--bpm-bg-secondary)" }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <Selectbox
                label="Actif cible"
                value={newRelationTargetId}
                onChange={(v) => setNewRelationTargetId(String(v))}
                options={domainAssets.map((a) => ({ value: a.id, label: `${a.reference} — ${a.label}` }))}
                placeholder="Choisir un actif"
              />
              <Selectbox
                label="Type de relation"
                value={newRelationType}
                onChange={(v) => setNewRelationType(String(v))}
                options={Object.entries(RELATION_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
              />
            </div>
            <Button type="submit" size="small" disabled={savingRelation || !newRelationTargetId}>
              {savingRelation ? "Enregistrement…" : "Ajouter"}
            </Button>
          </form>
        )}
        {loadingRelations ? (
          <div className="flex justify-center py-4">
            <Spinner size="small" />
          </div>
        ) : relations.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Aucune relation. Ajoutez une dépendance ou un lien avec un autre actif.</p>
        ) : (
          <ul className="space-y-2">
            {relations.map((rel) => {
              const isSource = rel.sourceAssetId === asset.id;
              const other = isSource ? rel.targetAsset : rel.sourceAsset;
              const direction = isSource ? "→" : "←";
              return (
                <li key={rel.id} className="flex flex-wrap items-center gap-2 py-2 border-b border-[var(--bpm-border)] last:border-0 text-sm">
                  <span className="rounded px-2 py-0.5 text-xs font-medium" style={{ background: "var(--bpm-accent-cyan)", color: "#fff" }}>
                    {RELATION_TYPE_LABELS[rel.relationType] ?? rel.relationType}
                  </span>
                  <span style={{ color: "var(--bpm-text-secondary)" }}>{direction}</span>
                  <Link href={`/modules/asset-manager/${domainId}/assets/${other.id}`} className="font-medium" style={{ color: "var(--bpm-accent-cyan)" }}>
                    {other.reference} — {other.label}
                  </Link>
                  <Button size="small" variant="outline" onClick={() => handleDeleteRelation(rel.id)} className="ml-auto text-xs">
                    Supprimer
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      {asset.notes && (
        <Panel variant="info" title="Notes" className="mt-4">
          <p className="text-sm whitespace-pre-wrap">{asset.notes}</p>
        </Panel>
      )}

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href={`/modules/asset-manager/${domainId}/assets`} style={{ color: "var(--bpm-accent-cyan)" }}>
          ← Liste des actifs
        </Link>
        <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>
          Tableau de bord
        </Link>
        <Link href="/modules/asset-manager/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>
          Documentation
        </Link>
      </nav>
    </div>
  );
}
