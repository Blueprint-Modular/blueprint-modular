"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Monitor, Ticket, UserCheck, FileText, BookOpen, RefreshCw } from "lucide-react";
import { Button, Spinner, Metric, Table, Panel } from "@/components/bpm";
import type { DomainConfig } from "@/lib/asset-manager/get-domain-config";

const ACCENT = {
  assets: "#2563eb",
  tickets: "#f59e0b",
  assignments: "#8b5cf6",
  contracts: "#10b981",
  knowledge: "#06b6d4",
  changes: "#ec4899",
} as const;

function formatLastUpdated(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (!Number.isFinite(d.getTime())) return "—";
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return "—";
  }
}

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
  const [contractCount, setContractCount] = useState(0);
  const [knowledgeCount, setKnowledgeCount] = useState(0);
  const [changeCount, setChangeCount] = useState(0);
  const [alerts, setAlerts] = useState<{ contractsExpiring30: number; ticketsSlaRisk: number; assetsOutOfService: number }>({
    contractsExpiring30: 0,
    ticketsSlaRisk: 0,
    assetsOutOfService: 0,
  });
  const [lastUpdated, setLastUpdated] = useState<{
    assets: string | null;
    tickets: string | null;
    assignments: string | null;
    contracts: string | null;
    knowledge: string | null;
    changes: string | null;
  }>({ assets: null, tickets: null, assignments: null, contracts: null, knowledge: null, changes: null });

  useEffect(() => {
    if (!domainId) return;
    Promise.all([
      fetch(`/api/asset-manager/config/${domainId}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/asset-manager/assets?domainId=${encodeURIComponent(domainId)}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : [])),
      fetch(`/api/asset-manager/tickets?domainId=${encodeURIComponent(domainId)}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : [])),
      fetch(`/api/asset-manager/assignments?domainId=${encodeURIComponent(domainId)}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : [])),
      fetch(`/api/asset-manager/contracts?domainId=${encodeURIComponent(domainId)}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : [])),
      fetch(`/api/asset-manager/knowledge?domainId=${encodeURIComponent(domainId)}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : [])),
      fetch(`/api/asset-manager/changes?domainId=${encodeURIComponent(domainId)}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([cfg, list, tickets, assignments, contracts, knowledge, changes]) => {
        setConfig(cfg);
        const assetList = Array.isArray(list) ? list : [];
        setAssets(assetList);
        setTicketCount(Array.isArray(tickets) ? tickets.length : 0);
        setAssignmentCount(Array.isArray(assignments) ? assignments.length : 0);
        setContractCount(Array.isArray(contracts) ? contracts.length : 0);
        setKnowledgeCount(Array.isArray(knowledge) ? knowledge.length : 0);
        setChangeCount(Array.isArray(changes) ? changes.length : 0);
        const priorities = (cfg as DomainConfig)?.priorities ?? [];
        const openStatuses = ["new", "open", "pending", "in_progress", "assigned"];
        const now = Date.now();
        const in30Days = now + 30 * 24 * 60 * 60 * 1000;
        const contractsExpiring30 = (Array.isArray(contracts) ? contracts : []).filter((c: { endDate?: string | null }) => {
          const end = c.endDate ? new Date(c.endDate).getTime() : null;
          return end != null && end >= now && end <= in30Days;
        }).length;
        const ticketsSlaRisk = (Array.isArray(tickets) ? tickets : []).filter((t: { status: string; openedAt: string; priorityId: string }) => {
          if (!openStatuses.includes(t.status)) return false;
          const prio = priorities.find((p: { id: string; sla_hours: number }) => p.id === t.priorityId);
          const slaHours = prio?.sla_hours ?? 48;
          const opened = new Date(t.openedAt).getTime();
          const elapsed = (now - opened) / (1000 * 60 * 60);
          const pct = (elapsed / slaHours) * 100;
          return pct >= 80;
        }).length;
        const assetsOutOfService = assetList.filter((a: { statusId: string }) => a.statusId === "out_of_service").length;
        setAlerts({ contractsExpiring30, ticketsSlaRisk, assetsOutOfService });
        const ticketList = Array.isArray(tickets) ? tickets : [];
        const assignmentList = Array.isArray(assignments) ? assignments : [];
        const contractList = Array.isArray(contracts) ? contracts : [];
        const knowledgeList = Array.isArray(knowledge) ? knowledge : [];
        const changeList = Array.isArray(changes) ? changes : [];
        const latest = (arr: { updatedAt?: string | null }[]) => {
          if (!arr?.length) return null;
          const dates = arr.map((x) => (x?.updatedAt ? new Date(x.updatedAt).getTime() : 0)).filter(Boolean);
          if (!dates.length) return null;
          return new Date(Math.max(...dates)).toISOString();
        };
        setLastUpdated({
          assets: assetList[0]?.updatedAt ?? null,
          tickets: latest(ticketList),
          assignments: latest(assignmentList),
          contracts: latest(contractList),
          knowledge: latest(knowledgeList),
          changes: latest(changeList),
        });
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

  const iconSize = 18;

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="doc-page-title text-2xl font-semibold" style={{ color: "var(--bpm-text-primary)" }}>
              Gestion d&apos;actifs
            </h1>
            <p className="doc-description mt-0.5" style={{ color: "var(--bpm-text-secondary)" }}>
              {config.asset_label_plural}, tickets et {config.assignment_label}s. Tableau de bord et accès rapides.
            </p>
          </div>
          <Link href={`/modules/asset-manager/${domainId}/assets/nouveau`} className="asset-manager-cta-button">
            <Button variant="primary" size="small">+ Nouvel actif</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6 mb-6 asset-manager-metrics-grid">
        <Link href={`/modules/asset-manager/${domainId}/assets`} className="block min-w-0 overflow-hidden">
          <Metric
            label={config.asset_label_plural}
            value={assets.length}
            compact
            border={false}
            icon={<Monitor size={iconSize} />}
            accentColor={ACCENT.assets}
            subtext={assets.length === 0 ? "Aucun actif enregistré" : `Mise à jour : ${formatLastUpdated(lastUpdated.assets)}`}
          />
        </Link>
        <Link href={`/modules/asset-manager/${domainId}/tickets`} className="block min-w-0 overflow-hidden">
          <Metric
            label={`${config.ticket_label_singular}s`}
            value={ticketCount}
            compact
            border={false}
            icon={<Ticket size={iconSize} />}
            accentColor={ACCENT.tickets}
            subtext={ticketCount === 0 ? "Aucun ticket" : `Mise à jour : ${formatLastUpdated(lastUpdated.tickets)}`}
          />
        </Link>
        <Link href={`/modules/asset-manager/${domainId}/assignments`} className="block min-w-0 overflow-hidden">
          <Metric
            label={`${config.assignment_label}s`}
            value={assignmentCount}
            compact
            border={false}
            icon={<UserCheck size={iconSize} />}
            accentColor={ACCENT.assignments}
            subtext={assignmentCount === 0 ? "Aucune MAD" : `Mise à jour : ${formatLastUpdated(lastUpdated.assignments)}`}
          />
        </Link>
        <Link href={`/modules/asset-manager/${domainId}/contracts`} className="block min-w-0 overflow-hidden">
          <Metric
            label="Contrats"
            value={contractCount}
            compact
            border={false}
            icon={<FileText size={iconSize} />}
            accentColor={ACCENT.contracts}
            subtext={contractCount === 0 ? "Aucun contrat" : `Mise à jour : ${formatLastUpdated(lastUpdated.contracts)}`}
          />
        </Link>
        <Link href={`/modules/asset-manager/${domainId}/knowledge`} className="block min-w-0 overflow-hidden">
          <Metric
            label="Connaissances"
            value={knowledgeCount}
            compact
            border={false}
            icon={<BookOpen size={iconSize} />}
            accentColor={ACCENT.knowledge}
            subtext={knowledgeCount === 0 ? "Aucun article" : `Mise à jour : ${formatLastUpdated(lastUpdated.knowledge)}`}
          />
        </Link>
        <Link href={`/modules/asset-manager/${domainId}/changes`} className="block min-w-0 overflow-hidden">
          <Metric
            label="Changements"
            value={changeCount}
            compact
            border={false}
            icon={<RefreshCw size={iconSize} />}
            accentColor={ACCENT.changes}
            subtext={changeCount === 0 ? "Aucun changement" : `Mise à jour : ${formatLastUpdated(lastUpdated.changes)}`}
          />
        </Link>
      </div>

      {(alerts.contractsExpiring30 > 0 || alerts.ticketsSlaRisk > 0 || alerts.assetsOutOfService > 0) && (
        <Panel variant="warning" title="Alertes" className="mb-6">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3 text-sm">
            {alerts.contractsExpiring30 > 0 && (
              <Link
                href={`/modules/asset-manager/${domainId}/contracts`}
                className="flex items-center gap-2 p-3 rounded-lg border"
                style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}
              >
                <span className="font-semibold" style={{ color: "var(--bpm-accent-amber, #f59e0b)" }}>
                  {alerts.contractsExpiring30}
                </span>
                <span style={{ color: "var(--bpm-text-primary)" }}>contrat(s) arrivant à échéance sous 30 jours</span>
              </Link>
            )}
            {alerts.ticketsSlaRisk > 0 && (
              <Link
                href={`/modules/asset-manager/${domainId}/tickets`}
                className="flex items-center gap-2 p-3 rounded-lg border"
                style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}
              >
                <span className="font-semibold" style={{ color: "var(--bpm-accent)" }}>{alerts.ticketsSlaRisk}</span>
                <span style={{ color: "var(--bpm-text-primary)" }}>ticket(s) en danger ou dépassement SLA</span>
              </Link>
            )}
            {alerts.assetsOutOfService > 0 && (
              <Link
                href={`/modules/asset-manager/${domainId}/assets?statusId=out_of_service`}
                className="flex items-center gap-2 p-3 rounded-lg border"
                style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}
              >
                <span className="font-semibold" style={{ color: "var(--bpm-accent)" }}>{alerts.assetsOutOfService}</span>
                <span style={{ color: "var(--bpm-text-primary)" }}>actif(s) hors service</span>
              </Link>
            )}
          </div>
        </Panel>
      )}

      <div
        className="rounded-xl border overflow-hidden"
        style={{
          background: "var(--bpm-surface)",
          border: "1px solid #E5E7EB",
          borderRadius: 12,
          padding: 16,
        }}
        role="region"
        aria-label={config.asset_label_plural}
      >
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold m-0" style={{ color: "var(--bpm-text-secondary)", letterSpacing: "0.04em" }}>
            {config.asset_label_plural}
          </h2>
          <Link href={`/modules/asset-manager/${domainId}/cmdb-graph`} className="asset-manager-cta-button">
            <Button variant="outline" size="small">Cartographie CMDB</Button>
          </Link>
        </div>
        {assets.length === 0 ? (
          <p className="text-sm m-0" style={{ color: "var(--bpm-text-secondary)" }}>
            Aucun actif. Cliquez sur « Nouvel actif » pour en créer un.
          </p>
        ) : (
          <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--bpm-border)" }}>
            <Table
              columns={columns}
              data={tableData}
              minWidth={560}
              onRowClick={(row) => {
                const id = (row as { id?: string }).id;
                if (id) window.location.href = `/modules/asset-manager/${domainId}/assets/${id}`;
              }}
            />
          </div>
        )}
      </div>

    </div>
  );
}
