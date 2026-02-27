"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Panel, Button, Spinner, Selectbox, Input, Badge, Card, EmptyState, Metric } from "@/components/bpm";
import { FicheHeader, FicheSectionCard, FicheFieldGrid, FicheNav, FicheSkeleton } from "@/components/fiche";
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

type TicketSummary = { id: string; reference: string; title: string; status: string; openedAt: string };
type ContractSummary = { id: string; reference: string; label: string; type: string; endDate: string | null; assetIds: string | null };

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
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [contracts, setContracts] = useState<ContractSummary[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [loadingContracts, setLoadingContracts] = useState(false);

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

  useEffect(() => {
    if (!domainId || !id) return;
    setLoadingTickets(true);
    fetch(`/api/asset-manager/tickets?domainId=${encodeURIComponent(domainId)}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((list: { assetId?: string | null }[]) => setTickets(Array.isArray(list) ? list.filter((t) => t.assetId === id) as TicketSummary[] : []))
      .finally(() => setLoadingTickets(false));
  }, [domainId, id]);

  useEffect(() => {
    if (!domainId || !id) return;
    setLoadingContracts(true);
    fetch(`/api/asset-manager/contracts?domainId=${encodeURIComponent(domainId)}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((list: ContractSummary[]) => {
        const filtered = Array.isArray(list)
          ? list.filter((c) => {
              try {
                const ids: string[] = c.assetIds ? JSON.parse(c.assetIds) : [];
                return ids.includes(id);
              } catch (_) {
                return false;
              }
            })
          : [];
        setContracts(filtered);
      })
      .finally(() => setLoadingContracts(false));
  }, [domainId, id]);

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
    return <FicheSkeleton sections={5} withMetrics withList withForm />;
  }

  if (!asset) {
    return (
      <div className="doc-page">
        <Panel variant="warning" title="Actif introuvable">
          L&apos;actif demandé n&apos;existe pas ou vous n&apos;y avez pas accès.
        </Panel>
        <FicheNav backLink={`/modules/asset-manager/${domainId}/assets`} backLabel="← Liste des actifs" />
      </div>
    );
  }

  const attrsByKey = Object.fromEntries(asset.attributes.map((a) => [a.key, a]));

  const statusBadgeVariant = (sid: string) =>
    sid === "en_service" ? "success" : sid === "out_of_service" || sid === "disposed" ? "error" : "default";

  return (
    <div className="doc-page">
      <FicheHeader
        breadcrumb={
          <>
            <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>Modules</Link> → <Link href="/modules/asset-manager" style={{ color: "var(--bpm-accent-cyan)" }}>Gestion de parc</Link> →{" "}
            <Link href={`/modules/asset-manager/${domainId}/assets`} style={{ color: "var(--bpm-accent-cyan)" }}>{config?.asset_label_plural ?? "Actifs"}</Link> → {asset.reference}
          </>
        }
        title={asset.label}
        subtitle={
          <>
            <Badge variant="default">{asset.reference}</Badge>
            <Badge variant="default">{getTypeLabel(asset.assetTypeId)}</Badge>
            <Badge variant={statusBadgeVariant(asset.statusId)}>{getStatusLabel(asset.statusId)}</Badge>
          </>
        }
      />

      <FicheSectionCard title="Informations générales" className="mt-4">
        <FicheFieldGrid
          withDividers
          items={[
            { label: "Référence", value: asset.reference },
            { label: "Type", value: getTypeLabel(asset.assetTypeId), asBadge: true, badgeVariant: "default" },
            { label: "Statut", value: getStatusLabel(asset.statusId), asBadge: true, badgeVariant: statusBadgeVariant(asset.statusId) },
            {
              label: "Étape de cycle de vie",
              value: (
                <span className="flex items-center gap-2">
                  <Selectbox
                    label=""
                    value={asset.lifecycleStage ?? ""}
                    onChange={(v) => handleLifecycleChange(String(v))}
                    options={[{ value: "", label: "— Non défini" }, ...lifecycleStages.map((s) => ({ value: s.id, label: s.label }))]}
                    placeholder="Choisir"
                  />
                  {savingLifecycle && <span className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>Enregistrement…</span>}
                </span>
              ),
            },
            ...(asset.brand ? [{ label: "Marque", value: asset.brand }] : []),
            ...(asset.model ? [{ label: "Modèle", value: asset.model }] : []),
            ...(asset.serialNumber ? [{ label: "N° série", value: asset.serialNumber }] : []),
          ]}
        />
      </FicheSectionCard>

      {config?.asset_types && asset.attributes.length > 0 && (
        <FicheSectionCard title="Caractéristiques" className="mt-4">
          <FicheFieldGrid
            withDividers
            items={config.asset_types
              .find((t) => t.id === asset.assetTypeId)
              ?.fields.filter((f) => attrsByKey[f.key])
              .map((f) => {
                const a = attrsByKey[f.key];
                let val = "";
                if (a?.valueText != null) val = a.valueText;
                else if (a?.valueNumber != null) val = String(a.valueNumber);
                else if (a?.valueDate) val = new Date(a.valueDate).toLocaleDateString("fr-FR");
                else if (a?.valueBool != null) val = a.valueBool ? "Oui" : "Non";
                return { label: f.label, value: val };
              }) ?? []}
          />
        </FicheSectionCard>
      )}

      <FicheSectionCard title="Historique des mouvements" className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <Metric label="Mouvements" value={movements.length} border={false} />
          <Button
            size="small"
            variant="outline"
            onClick={() => setShowMovementForm((v) => !v)}
          >
            {showMovementForm ? "Annuler" : "+ Ajouter un mouvement"}
          </Button>
        </div>
        {showMovementForm && (
          <Card variant="outlined" className="mb-4">
            <div className="bpm-card-body p-4">
              <h4 className="text-sm font-semibold mb-3" style={{ color: "var(--bpm-text-primary)" }}>Nouveau mouvement</h4>
              <form onSubmit={handleAddMovement}>
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
                className="bpm-textarea w-full rounded-lg border px-3 py-2 text-sm resize-y"
                style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
                placeholder="Commentaire"
              />
            </div>
            <Button type="submit" size="medium" variant="primary" disabled={savingMovement}>
              {savingMovement ? "Enregistrement…" : "Enregistrer le mouvement"}
            </Button>
              </form>
            </div>
          </Card>
        )}
        {loadingMovements ? (
          <div className="flex justify-center py-6">
            <Spinner size="small" />
          </div>
        ) : movements.length === 0 ? (
          <EmptyState
            title="Aucun mouvement"
            description="Aucun mouvement enregistré."
            action={<Button size="small" variant="outline" onClick={() => setShowMovementForm(true)}>+ Ajouter un mouvement</Button>}
          />
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
                <Badge variant="primary">{MOVEMENT_TYPE_LABELS[m.movementType] ?? m.movementType}</Badge>
                {m.reason && <span style={{ color: "var(--bpm-text-secondary)" }}>{m.reason}</span>}
                {m.notes && <span className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>— {m.notes}</span>}
              </li>
            ))}
          </ul>
        )}
      </FicheSectionCard>

      <FicheSectionCard title="Tickets" className="mt-4">
        {loadingTickets ? (
          <div className="flex justify-center py-4">
            <Spinner size="small" />
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState
            title="Aucun ticket"
            description="Aucun ticket lié à cet actif."
            action={<Link href={`/modules/asset-manager/${domainId}/tickets/new`}><Button size="small" variant="outline">+ Nouveau ticket</Button></Link>}
          />
        ) : (
          <ul className="space-y-2">
            {tickets.map((t) => (
              <li key={t.id} className="flex flex-wrap items-baseline gap-2 py-2 border-b border-[var(--bpm-border)] last:border-0 text-sm">
                <Link href={`/modules/asset-manager/${domainId}/tickets/${t.id}`} className="font-medium hover:underline" style={{ color: "var(--bpm-accent-cyan)" }}>
                  {t.reference}
                </Link>
                <span style={{ color: "var(--bpm-text-primary)" }}>{t.title}</span>
                <Badge variant="default">{t.status}</Badge>
                <span className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>{new Date(t.openedAt).toLocaleDateString("fr-FR")}</span>
              </li>
            ))}
          </ul>
        )}
      </FicheSectionCard>

      <FicheSectionCard title="Contrats" className="mt-4">
        {loadingContracts ? (
          <div className="flex justify-center py-4">
            <Spinner size="small" />
          </div>
        ) : contracts.length === 0 ? (
          <EmptyState title="Aucun contrat" description="Aucun contrat couvrant cet actif." />
        ) : (
          <ul className="space-y-2">
            {contracts.map((c) => {
              const endDate = c.endDate ? new Date(c.endDate) : null;
              const isExpired = endDate ? endDate < new Date() : false;
              return (
                <li key={c.id} className="flex flex-wrap items-baseline gap-2 py-2 border-b border-[var(--bpm-border)] last:border-0 text-sm">
                  <Link href={`/modules/asset-manager/${domainId}/contracts/${c.id}`} className="font-medium hover:underline" style={{ color: "var(--bpm-accent-cyan)" }}>
                    {c.reference}
                  </Link>
                  <span style={{ color: "var(--bpm-text-primary)" }}>{c.label}</span>
                  <Badge variant="default">{c.type}</Badge>
                  {endDate && (
                    <Badge variant={isExpired ? "error" : "default"}>Fin : {endDate.toLocaleDateString("fr-FR")}</Badge>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </FicheSectionCard>

      <FicheSectionCard title="Dépendances / Cartographie" className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <Metric label="Relations" value={relations.length} border={false} />
          <Button size="small" variant="outline" onClick={() => { setShowRelationForm((v) => !v); loadDomainAssetsForRelation(); }}>
            {showRelationForm ? "Annuler" : "+ Ajouter une relation"}
          </Button>
        </div>
        {showRelationForm && (
          <Card variant="outlined" className="mb-4">
            <div className="bpm-card-body p-4">
              <form onSubmit={handleAddRelation}>
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
                <Button type="submit" size="medium" variant="primary" disabled={savingRelation || !newRelationTargetId}>
                  {savingRelation ? "Enregistrement…" : "Ajouter"}
                </Button>
              </form>
            </div>
          </Card>
        )}
        {loadingRelations ? (
          <div className="flex justify-center py-4">
            <Spinner size="small" />
          </div>
        ) : relations.length === 0 ? (
          <EmptyState
            title="Aucune relation"
            description="Ajoutez une dépendance ou un lien."
            action={<Button size="small" variant="outline" onClick={() => { setShowRelationForm(true); loadDomainAssetsForRelation(); }}>+ Ajouter une relation</Button>}
          />
        ) : (
          <ul className="space-y-2">
            {relations.map((rel) => {
              const isSource = rel.sourceAssetId === asset.id;
              const other = isSource ? rel.targetAsset : rel.sourceAsset;
              const direction = isSource ? "→" : "←";
              return (
                <li key={rel.id} className="flex flex-wrap items-center gap-2 py-2 border-b border-[var(--bpm-border)] last:border-0 text-sm">
                  <Badge variant="primary">{RELATION_TYPE_LABELS[rel.relationType] ?? rel.relationType}</Badge>
                  <span style={{ color: "var(--bpm-text-secondary)" }}>{direction}</span>
                  <Link href={`/modules/asset-manager/${domainId}/assets/${other.id}`} className="font-medium" style={{ color: "var(--bpm-accent-cyan)" }}>
                    {other.reference} — {other.label}
                  </Link>
                  <Button size="small" variant="outline" onClick={() => handleDeleteRelation(rel.id)} className="ml-auto asset-manager-btn-compact">
                    Supprimer
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </FicheSectionCard>

      {asset.notes && (
        <FicheSectionCard title="Notes" className="mt-4">
          <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--bpm-text-primary)" }}>{asset.notes}</p>
        </FicheSectionCard>
      )}

      <FicheNav
        backLink={`/modules/asset-manager/${domainId}/assets`}
        backLabel="← Liste des actifs"
        secondaryLinks={[
          { href: `/modules/asset-manager/${domainId}`, label: "Tableau de bord" },
          { href: "/modules/asset-manager/documentation", label: "Documentation" },
        ]}
      />
    </div>
  );
}
