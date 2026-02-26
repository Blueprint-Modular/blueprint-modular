"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Table, Spinner, Panel, Button, Selectbox } from "@/components/bpm";

interface Asset {
  id: string;
  reference: string;
  label: string;
  assetTypeId: string;
  statusId: string;
  lifecycleStage?: string | null;
  attributes: { key: string; valueText: string | null; valueNumber: number | null; valueDate: string | null; valueBool: boolean | null }[];
}

interface DomainConfig {
  domain_label: string;
  asset_label_plural: string;
  asset_types: { id: string; label: string }[];
  statuses: { id: string; label: string; color: string }[];
  lifecycle_stages?: { id: string; label: string }[];
}

export default function AssetManagerAssetsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const [config, setConfig] = useState<DomainConfig | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterLifecycle, setFilterLifecycle] = useState("");

  useEffect(() => {
    setFilterType(searchParams.get("assetTypeId") ?? "");
    setFilterStatus(searchParams.get("statusId") ?? "");
    setFilterLifecycle(searchParams.get("lifecycleStage") ?? "");
  }, [searchParams]);

  const fetchAssets = useCallback(() => {
    if (!domainId) return;
    const params = new URLSearchParams({ domainId });
    if (filterType) params.set("assetTypeId", filterType);
    if (filterStatus) params.set("statusId", filterStatus);
    if (filterLifecycle !== "") params.set("lifecycleStage", filterLifecycle);
    fetch(`/api/asset-manager/assets?${params}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setAssets(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [domainId, filterType, filterStatus, filterLifecycle]);

  useEffect(() => {
    if (!domainId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/asset-manager/config/${domainId}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then(setConfig)
      .catch(() => {});
    fetchAssets();
  }, [domainId, fetchAssets]);

  const getStatusLabel = (id: string) => config?.statuses.find((s) => s.id === id)?.label ?? id;
  const getTypeLabel = (id: string) => config?.asset_types.find((t) => t.id === id)?.label ?? id;
  const getLifecycleLabel = (id: string | null | undefined) =>
    id ? (config?.lifecycle_stages?.find((s) => s.id === id)?.label ?? id) : "—";

  const columns = [
    { key: "reference", label: "Référence" },
    { key: "label", label: "Libellé" },
    {
      key: "assetTypeId",
      label: "Type",
      render: (val: unknown) => getTypeLabel(String(val)),
    },
    {
      key: "statusId",
      label: "Statut",
      render: (val: unknown) => (
        <span
          className="rounded px-2 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: "var(--bpm-bg-secondary)",
            color: "var(--bpm-text-primary)",
          }}
        >
          {getStatusLabel(String(val))}
        </span>
      ),
    },
    {
      key: "lifecycleStage",
      label: "Cycle de vie",
      render: (val: unknown) => (
        <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          {getLifecycleLabel(val as string | null)}
        </span>
      ),
    },
  ];

  const typeOptions = [
    { value: "", label: "Tous les types" },
    ...(config?.asset_types.map((t) => ({ value: t.id, label: t.label })) ?? []),
  ];
  const statusOptions = [
    { value: "", label: "Tous les statuts" },
    ...(config?.statuses.map((s) => ({ value: s.id, label: s.label })) ?? []),
  ];
  const lifecycleOptions = [
    { value: "", label: "Toutes les étapes" },
    ...(config?.lifecycle_stages?.map((s) => ({ value: s.id, label: s.label })) ?? []),
  ];

  if (!config && !loading) {
    return (
      <div className="doc-page">
        <div className="doc-page-header mb-6">
          <nav className="doc-breadcrumb">
            <Link href="/modules">Modules</Link> → Gestion d&apos;actifs
          </nav>
          <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>Gestion d&apos;actifs</h1>
        </div>
        <Panel variant="warning" title="Configuration introuvable" />
        <nav className="doc-pagination mt-6">
          <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>← Retour aux modules</Link>
        </nav>
      </div>
    );
  }

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/asset-manager">Gestion d&apos;actifs</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}`}>{config?.asset_label_plural ?? "Actifs"}</Link>
        </nav>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
          {config?.asset_label_plural ?? "Actifs"}
        </h1>
        <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
          Liste des actifs avec filtres par type et statut.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Selectbox
          options={typeOptions}
          value={filterType}
          onChange={(v) => setFilterType(v ?? "")}
          placeholder="Type"
        />
        <Selectbox
          options={statusOptions}
          value={filterStatus}
          onChange={(v) => setFilterStatus(v ?? "")}
          placeholder="Statut"
        />
        <Selectbox
          options={lifecycleOptions}
          value={filterLifecycle}
          onChange={(v) => setFilterLifecycle(v ?? "")}
          placeholder="Cycle de vie"
        />
        <Link href={`/modules/asset-manager/${domainId}/assets/nouveau`}>
          <Button variant="primary">Nouvel actif</Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="medium" />
        </div>
      ) : assets.length === 0 ? (
        <Panel variant="info" title="Aucun actif">
          Aucun actif pour ce domaine. Créez-en un avec le bouton &quot;Nouvel actif&quot;.
        </Panel>
      ) : (
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--bpm-border)" }}>
          <Table
            columns={columns}
            data={assets.map((a) => ({ id: a.id, reference: a.reference, label: a.label, assetTypeId: a.assetTypeId, statusId: a.statusId, lifecycleStage: a.lifecycleStage ?? null }))}
            onRowClick={(row) => {
              const id = (row as { id?: string }).id;
              if (id) router.push(`/modules/asset-manager/${domainId}/assets/${id}`);
            }}
          />
        </div>
      )}

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>
          ← Tableau de bord
        </Link>
        <Link href="/modules/asset-manager/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>
          Documentation
        </Link>
      </nav>
    </div>
  );
}
