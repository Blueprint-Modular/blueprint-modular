"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Panel, Button, Spinner, Metric, Table } from "@/components/bpm";
import type { DomainConfig } from "@/lib/asset-manager/get-domain-config";

type Asset = {
  id: string;
  reference: string;
  label: string;
  assetTypeId: string;
  statusId: string;
  domainId: string;
  updatedAt: string;
};

export default function AssetManagerDomainPage() {
  const params = useParams();
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const [config, setConfig] = useState<DomainConfig | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  const [ticketCount, setTicketCount] = useState(0);
  const [assignmentCount, setAssignmentCount] = useState(0);

  useEffect(() => {
    if (!domainId) return;
    Promise.all([
      fetch(`/api/asset-manager/config/${domainId}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/asset-manager/assets?domainId=${encodeURIComponent(domainId)}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : [])),
      fetch(`/api/asset-manager/tickets?domainId=${encodeURIComponent(domainId)}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : [])),
      fetch(`/api/asset-manager/assignments?domainId=${encodeURIComponent(domainId)}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([cfg, list, tickets, assignments]) => {
        setConfig(cfg);
        setAssets(Array.isArray(list) ? list : []);
        setTicketCount(Array.isArray(tickets) ? tickets.length : 0);
        setAssignmentCount(Array.isArray(assignments) ? assignments.length : 0);
      })
      .finally(() => setLoading(false));
  }, [domainId]);

  const getStatusLabel = (id: string) => config?.statuses.find((s) => s.id === id)?.label ?? id;
  const getStatusColor = (id: string) => {
    const c = config?.statuses.find((s) => s.id === id)?.color ?? "gray";
    const map: Record<string, string> = {
      green: "var(--bpm-accent-mint)",
      red: "var(--bpm-accent)",
      yellow: "var(--bpm-accent-amber, #f59e0b)",
      blue: "var(--bpm-accent-cyan)",
      gray: "var(--bpm-text-secondary)",
      orange: "#e65100",
    };
    return map[c] ?? map.gray;
  };

  if (loading) {
    return (
      <div className="doc-page flex justify-center py-12">
        <Spinner size="medium" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="doc-page">
        <div className="doc-page-header mb-6">
          <nav className="doc-breadcrumb">
            <Link href="/modules">Modules</Link> → Gestion d&apos;actifs
          </nav>
          <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
            Gestion d&apos;actifs
          </h1>
        </div>
        <Panel variant="warning" title="Configuration introuvable">
          Le domaine &quot;{domainId}&quot; n&apos;existe pas ou n&apos;est pas configuré.
        </Panel>
        <nav className="doc-pagination mt-6">
          <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>← Retour aux modules</Link>
        </nav>
      </div>
    );
  }

  const columns = [
    { key: "reference", label: "Référence" },
    { key: "label", label: "Libellé" },
    { key: "assetTypeId", label: "Type" },
    {
      key: "statusId",
      label: "Statut",
      render: (val: unknown) => {
        const id = String(val ?? "");
        return (
          <span
            className="rounded px-2 py-0.5 text-xs font-medium"
            style={{ backgroundColor: getStatusColor(id), color: "var(--bpm-bg)" }}
          >
            {getStatusLabel(id)}
          </span>
        );
      },
    },
  ];

  const tableData = assets.map((a) => ({
    id: a.id,
    reference: a.reference,
    label: a.label,
    assetTypeId: a.assetTypeId,
    statusId: a.statusId,
  }));

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/asset-manager">Gestion d&apos;actifs</Link>
        </nav>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
          Gestion d&apos;actifs
        </h1>
        <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
          {config.asset_label_plural}, tickets et {config.assignment_label}s. Tableau de bord et accès rapides.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-6">
        <Link href={`/modules/asset-manager/${domainId}/assets`} className="block">
          <Metric label={config.asset_label_plural} value={assets.length} />
        </Link>
        <Link href={`/modules/asset-manager/${domainId}/tickets`} className="block">
          <Metric label={`${config.ticket_label_singular}s`} value={ticketCount} />
        </Link>
        <Link href={`/modules/asset-manager/${domainId}/assignments`} className="block">
          <Metric label={`${config.assignment_label}s`} value={assignmentCount} />
        </Link>
      </div>

      <Panel variant="info" title={config.asset_label_plural}>
        <div className="flex justify-between items-center mb-4">
          <span />
          <Link href={`/modules/asset-manager/${domainId}/assets/new`}>
            <Button variant="primary">Nouvel actif</Button>
          </Link>
        </div>
        {assets.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
            Aucun actif. Cliquez sur « Nouvel actif » pour en créer un.
          </p>
        ) : (
          <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--bpm-border)" }}>
            <Table
              columns={columns}
              data={tableData}
              onRowClick={(row) => {
                const id = (row as { id?: string }).id;
                if (id) window.location.href = `/modules/asset-manager/${domainId}/assets/${id}`;
              }}
            />
          </div>
        )}
      </Panel>

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>
          ← Retour aux modules
        </Link>
        <Link href="/modules/asset-manager/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>
          Documentation
        </Link>
      </nav>
    </div>
  );
}
