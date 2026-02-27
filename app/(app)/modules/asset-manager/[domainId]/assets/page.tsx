"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Download, Package, ChevronRight } from "lucide-react";
import { Table, Spinner, Panel, Button, Chip, EmptyState } from "@/components/bpm";
import { AssetManagerNav } from "../../AssetManagerNav";

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

  const updateFilter = useCallback(
    (key: "assetTypeId" | "statusId" | "lifecycleStage", value: string) => {
      const next = new URLSearchParams(searchParams?.toString() ?? "");
      if (value) next.set(key, value);
      else next.delete(key);
      router.replace(`?${next.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

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
  const getStatusColor = (id: string) => {
    const c = config?.statuses.find((s) => s.id === id)?.color ?? "gray";
    const map: Record<string, string> = {
      green: "var(--bpm-accent-mint)",
      red: "#ef4444",
      yellow: "#f59e0b",
      amber: "#f59e0b",
      blue: "var(--bpm-accent-cyan)",
      gray: "#6b7280",
      orange: "#f59e0b",
    };
    return map[c] ?? map.gray;
  };
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
      render: (val: unknown) => {
        const id = String(val);
        const bg = getStatusColor(id);
        return (
          <span
            className="asset-manager-status-badge rounded px-2 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: bg,
              color: "#fff",
            }}
          >
            {getStatusLabel(id)}
          </span>
        );
      },
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
    {
      key: "_link",
      label: "",
      render: () => (
        <ChevronRight size={16} className="asset-manager-row-chevron" style={{ color: "var(--bpm-text-secondary)" }} />
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

  const exportCsv = () => {
    const headers = ["Référence", "Libellé", "Type", "Statut", "Cycle de vie"];
    const rows = assets.map((a) => [
      a.reference,
      a.label,
      getTypeLabel(a.assetTypeId),
      getStatusLabel(a.statusId),
      getLifecycleLabel(a.lifecycleStage),
    ]);
    const csv = [headers.join(";"), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))].join("\r\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `actifs-${domainId}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <AssetManagerNav />
        <div className="flex flex-wrap items-center justify-between gap-3 mt-1">
          <div>
            <h1 className="doc-page-title text-2xl font-semibold" style={{ color: "var(--bpm-text-primary)" }}>
              {config?.asset_label_plural ?? "Équipements"}
            </h1>
            <p className="doc-description mt-0.5" style={{ color: "var(--bpm-text-secondary)" }}>
              Liste des actifs avec filtres par type et statut.
            </p>
          </div>
          <Link href={`/modules/asset-manager/${domainId}/assets/nouveau`} className="asset-manager-cta-button">
            <Button variant="primary" size="small">+ Nouvel actif</Button>
          </Link>
        </div>
      </div>

      <div className="asset-manager-filters flex flex-wrap items-center gap-2 overflow-x-auto">
        <span className="text-xs font-medium mr-1" style={{ color: "var(--bpm-text-secondary)" }}>Type</span>
        {typeOptions.map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            variant={filterType === opt.value ? "primary" : "default"}
            onClick={() => updateFilter("assetTypeId", opt.value)}
            className={filterType === opt.value ? "asset-manager-chip-active" : ""}
          />
        ))}
        <span className="text-xs font-medium mx-2 mr-1" style={{ color: "var(--bpm-text-secondary)" }}>Statut</span>
        {statusOptions.map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            variant={filterStatus === opt.value ? "primary" : "default"}
            onClick={() => updateFilter("statusId", opt.value)}
            className={filterStatus === opt.value ? "asset-manager-chip-active" : ""}
          />
        ))}
        <span className="text-xs font-medium mx-2 mr-1" style={{ color: "var(--bpm-text-secondary)" }}>Cycle de vie</span>
        {lifecycleOptions.map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            variant={filterLifecycle === opt.value ? "primary" : "default"}
            onClick={() => updateFilter("lifecycleStage", opt.value)}
            className={filterLifecycle === opt.value ? "asset-manager-chip-active" : ""}
          />
        ))}
        <div className="ml-auto flex-shrink-0">
          <button
            type="button"
            onClick={exportCsv}
            disabled={assets.length === 0}
            className="asset-manager-export-btn flex items-center justify-center w-8 h-8 rounded-lg border"
            style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-secondary)" }}
            title="Exporter CSV"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="medium" />
        </div>
      ) : assets.length === 0 ? (
        <div className="rounded-xl border bg-[var(--bpm-surface)] p-4" style={{ border: "1px solid #E5E7EB", borderRadius: 12 }}>
          <EmptyState
            title="Aucun équipement enregistré"
            description="Créez un premier actif pour commencer à gérer votre parc."
            icon={<Package size={64} style={{ color: "var(--bpm-text-secondary)", opacity: 0.6 }} />}
            action={
              <Link href={`/modules/asset-manager/${domainId}/assets/nouveau`}>
                <Button variant="primary" size="small">+ Nouvel actif</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--bpm-border)" }}>
          <Table
            columns={columns}
            data={assets.map((a) => ({ id: a.id, reference: a.reference, label: a.label, assetTypeId: a.assetTypeId, statusId: a.statusId, lifecycleStage: a.lifecycleStage ?? null }))}
            minWidth={560}
            onRowClick={(row) => {
              const id = (row as { id?: string }).id;
              if (id) router.push(`/modules/asset-manager/${domainId}/assets/${id}`);
            }}
          />
        </div>
      )}

    </div>
  );
}
