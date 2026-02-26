"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Table, Spinner, Panel, Button, Selectbox } from "@/components/bpm";

type Ticket = {
  id: string;
  reference: string;
  title: string;
  status: string;
  priorityId: string;
  categoryId: string;
  openedAt: string;
  requester: { id: string; name: string | null } | null;
  assignee: { id: string; name: string | null } | null;
  asset: { id: string; reference: string; label: string } | null;
};

type DomainConfig = {
  domain_label: string;
  ticket_categories: { id: string; label: string; subcategories: string[] }[];
  priorities: { id: string; label: string; color: string; sla_hours?: number }[];
};

const STATUS_LABELS: Record<string, string> = {
  new: "Nouveau",
  in_progress: "En cours",
  on_hold: "En attente",
  resolved: "Résolu",
  closed: "Clos",
};

export default function AssetManagerTicketsPage() {
  const params = useParams();
  const router = useRouter();
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const [config, setConfig] = useState<DomainConfig | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterSlaRisk, setFilterSlaRisk] = useState(false);

  const fetchTickets = useCallback(() => {
    if (!domainId) return;
    fetch(`/api/asset-manager/tickets?domainId=${encodeURIComponent(domainId)}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setTickets(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [domainId]);

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
    fetchTickets();
  }, [domainId, fetchTickets]);

  const getPriorityLabel = (id: string) => config?.priorities?.find((p) => p.id === id)?.label ?? id;
  const getCategoryLabel = (id: string) => config?.ticket_categories?.find((c) => c.id === id)?.label ?? id;

  const openStatuses = ["new", "open", "pending", "in_progress", "on_hold", "assigned"];
  const isTicketSlaRisk = (t: Ticket) => {
    if (!openStatuses.includes(t.status)) return false;
    const prio = config?.priorities?.find((p) => p.id === t.priorityId);
    const slaHours = prio?.sla_hours ?? 48;
    const elapsed = (Date.now() - new Date(t.openedAt).getTime()) / (1000 * 60 * 60);
    const pct = (elapsed / slaHours) * 100;
    return pct >= 80;
  };
  const slaRiskCount = tickets.filter(isTicketSlaRisk).length;

  const filtered = tickets.filter((t) => {
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterPriority && t.priorityId !== filterPriority) return false;
    if (filterSlaRisk && !isTicketSlaRisk(t)) return false;
    return true;
  });

  const columns = [
    { key: "reference", label: "Référence" },
    { key: "title", label: "Titre" },
    {
      key: "status",
      label: "Statut",
      render: (val: unknown) => (
        <span className="rounded px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: "var(--bpm-bg-secondary)", color: "var(--bpm-text-primary)" }}>
          {STATUS_LABELS[String(val)] ?? String(val)}
        </span>
      ),
    },
    {
      key: "priorityId",
      label: "Priorité",
      render: (val: unknown) => getPriorityLabel(String(val)),
    },
    {
      key: "categoryId",
      label: "Catégorie",
      render: (val: unknown) => getCategoryLabel(String(val)),
    },
    {
      key: "openedAt",
      label: "Ouvert le",
      render: (val: unknown) => (val ? new Date(String(val)).toLocaleDateString("fr-FR") : ""),
    },
    {
      key: "assignee",
      label: "Assigné à",
      render: (_: unknown, row: Record<string, unknown>) => (row as Ticket).assignee?.name ?? "—",
    },
  ];

  const statusOptions = [
    { value: "", label: "Tous les statuts" },
    ...Object.entries(STATUS_LABELS).map(([id, label]) => ({ value: id, label })),
  ];
  const priorityOptions = [
    { value: "", label: "Toutes priorités" },
    ...(config?.priorities?.map((p) => ({ value: p.id, label: p.label })) ?? []),
  ];

  if (!config && !loading) {
    return (
      <div className="doc-page">
        <Panel variant="warning" title="Domaine inconnu">Vérifiez l’URL.</Panel>
        <Link href="/modules/asset-manager" style={{ color: "var(--bpm-accent-cyan)" }}>← Gestion d’actifs</Link>
      </div>
    );
  }

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/asset-manager">Gestion d&apos;actifs</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}`}>Tableau de bord</Link> → Tickets
        </nav>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>Tickets</h1>
            <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
              Suivi des tickets et demandes d&apos;intervention.
            </p>
          </div>
          <Link href={`/modules/asset-manager/${domainId}/tickets/new`}>
            <Button size="small">+ Nouveau ticket</Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <Selectbox
          label="Statut"
          value={filterStatus}
          onChange={(v) => setFilterStatus(String(v))}
          options={statusOptions}
          placeholder="Tous"
        />
        <Selectbox
          label="Priorité"
          value={filterPriority}
          onChange={(v) => setFilterPriority(String(v))}
          options={priorityOptions}
          placeholder="Toutes"
        />
        {slaRiskCount > 0 && (
          <button
            type="button"
            onClick={() => setFilterSlaRisk((v) => !v)}
            className={`rounded px-3 py-1.5 text-sm font-medium ${filterSlaRisk ? "ring-2 ring-offset-2" : ""}`}
            style={
              filterSlaRisk
                ? { background: "var(--bpm-accent)", color: "#fff" }
                : { background: "var(--bpm-accent-amber, #f59e0b)", color: "#fff" }
            }
          >
            {slaRiskCount} en danger SLA
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="medium" />
        </div>
      ) : (
        <Panel variant="info" title={`${filtered.length} ticket(s)`}>
          <Table
            columns={columns}
            data={filtered}
            keyColumn="id"
            onRowClick={(row) => router.push(`/modules/asset-manager/${domainId}/tickets/${row.id}`)}
          />
        </Panel>
      )}

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>← Tableau de bord</Link>
        <Link href="/modules/asset-manager/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>Documentation</Link>
      </nav>
    </div>
  );
}
