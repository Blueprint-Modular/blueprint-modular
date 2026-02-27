"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Download, FileText } from "lucide-react";
import { Table, Spinner, Panel, Button, Chip, EmptyState } from "@/components/bpm";

type AssetContract = {
  id: string;
  reference: string;
  type: string;
  label: string;
  supplier: string | null;
  startDate: string;
  endDate: string;
  amount: number | null;
  autoRenewal: boolean;
  noticeDays: number;
  alertDaysBefore: number;
};

const TYPE_LABELS: Record<string, string> = {
  garantie: "Garantie",
  maintenance: "Maintenance",
  leasing: "Leasing",
  credit_bail: "Crédit-bail",
  licence: "Licence",
};

export default function AssetManagerContractsPage() {
  const params = useParams();
  const router = useRouter();
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const [contracts, setContracts] = useState<AssetContract[]>([]);
  const [config, setConfig] = useState<{ domain_label?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("");

  useEffect(() => {
    if (!domainId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const url = `/api/asset-manager/contracts?domainId=${encodeURIComponent(domainId)}${filterType ? `&type=${encodeURIComponent(filterType)}` : ""}`;
    Promise.all([
      fetch(`/api/asset-manager/config/${domainId}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
      fetch(url, { credentials: "include" }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([cfg, data]) => {
        setConfig(cfg);
        setContracts(Array.isArray(data) ? data : []);
      })
      .catch(() => setContracts([]))
      .finally(() => setLoading(false));
  }, [domainId, filterType]);

  const filtered = contracts;

  const columns = [
    { key: "reference", label: "Référence" },
    { key: "label", label: "Libellé" },
    {
      key: "type",
      label: "Type",
      render: (val: unknown) => TYPE_LABELS[String(val)] ?? String(val),
    },
    {
      key: "supplier",
      label: "Fournisseur",
      render: (val: unknown) => (val ? String(val) : "—"),
    },
    {
      key: "startDate",
      label: "Début",
      render: (val: unknown) => (val ? new Date(String(val)).toLocaleDateString("fr-FR") : ""),
    },
    {
      key: "endDate",
      label: "Fin",
      render: (val: unknown) => (val ? new Date(String(val)).toLocaleDateString("fr-FR") : ""),
    },
    {
      key: "amount",
      label: "Montant",
      render: (val: unknown) => (val != null && Number.isFinite(Number(val)) ? `${Number(val).toLocaleString("fr-FR")} €` : "—"),
    },
  ];

  const typeOptions = [
    { value: "", label: "Tous les types" },
    ...Object.entries(TYPE_LABELS).map(([id, label]) => ({ value: id, label })),
  ];

  if (!config && !loading) {
    return (
      <div className="doc-page">
        <Panel variant="warning" title="Domaine inconnu">Vérifiez l&apos;URL.</Panel>
        <Link href="/modules/asset-manager" style={{ color: "var(--bpm-accent-cyan)" }}>← Gestion de parc</Link>
      </div>
    );
  }

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/asset-manager">Gestion de parc</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}`}>Tableau de bord</Link> → Contrats
        </nav>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>Contrats et garanties</h1>
            <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
              Garanties, maintenance, leasing, licences. Alertes fin de contrat.
            </p>
          </div>
          <Link href={`/modules/asset-manager/${domainId}/contracts/new`} className="asset-manager-cta-button">
            <Button variant="primary" size="small">+ Nouveau contrat</Button>
          </Link>
        </div>
      </div>

      <div className="asset-manager-equipment-filters">
        <div className="asset-manager-equipment-filters__row">
          <span className="asset-manager-equipment-filters__label">Type</span>
          <div className="asset-manager-equipment-filters__chips">
            {typeOptions.map((opt) => {
              const isActive = filterType === opt.value;
              const isReset = opt.value === "";
              return (
                <Chip
                  key={opt.value || "all"}
                  label={opt.label}
                  variant={isActive ? "primary" : "default"}
                  onClick={() => setFilterType(isActive ? "" : opt.value)}
                  className={`${isActive ? "asset-manager-chip-active" : ""} ${isReset ? "asset-manager-chip-reset" : ""}`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="medium" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border bg-[var(--bpm-surface)] p-4" style={{ border: "1px solid #E5E7EB", borderRadius: 12 }}>
          <EmptyState
            title="Aucun contrat enregistré"
            description="Créez un premier contrat ou une garantie pour commencer."
            icon={<FileText size={64} style={{ color: "var(--bpm-text-secondary)", opacity: 0.6 }} />}
            action={
              <Link href={`/modules/asset-manager/${domainId}/contracts/new`}>
                <Button variant="primary" size="small">+ Nouveau contrat</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="asset-manager-table-export-wrap">
          <button
            type="button"
            onClick={() => {
              const headers = ["Référence", "Libellé", "Type", "Fournisseur", "Début", "Fin", "Montant"];
              const rows = filtered.map((c) => [
                c.reference,
                c.label,
                TYPE_LABELS[c.type] ?? c.type,
                c.supplier ?? "",
                c.startDate ? new Date(c.startDate).toLocaleDateString("fr-FR") : "",
                c.endDate ? new Date(c.endDate).toLocaleDateString("fr-FR") : "",
                c.amount != null ? String(c.amount) : "",
              ]);
              const csv = [headers.join(";"), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))].join("\r\n");
              const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `contrats-${domainId}-${new Date().toISOString().slice(0, 10)}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            disabled={filtered.length === 0}
            className="asset-manager-export-btn asset-manager-export-btn-float flex items-center justify-center w-8 h-8 rounded-lg border"
            style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-secondary)" }}
            title="Exporter CSV"
          >
            <Download size={18} />
          </button>
          <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--bpm-border)" }}>
            <Table
              columns={columns}
              data={filtered}
              minWidth={560}
              keyColumn="id"
              onRowClick={(row) => router.push(`/modules/asset-manager/${domainId}/contracts/${(row as { id: string }).id}`)}
            />
          </div>
        </div>
      )}

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>← Tableau de bord</Link>
        <Link href="/modules/asset-manager/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>Documentation</Link>
      </nav>
    </div>
  );
}
