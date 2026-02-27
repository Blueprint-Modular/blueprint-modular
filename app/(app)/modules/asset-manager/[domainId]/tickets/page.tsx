"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Download, Ticket as TicketIcon } from "lucide-react";
import { Table, Spinner, Panel, Button, Chip, EmptyState } from "@/components/bpm";
import { AssetManagerNav } from "../../AssetManagerNav";

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
  const getPriorityColor = (id: string) => {
    const c = config?.priorities?.find((p) => p.id === id)?.color ?? "gray";
    const map: Record<string, string> = {
      red: "#ef4444",
      green: "var(--bpm-accent-mint)",
      amber: "#f59e0b",
      yellow: "#f59e0b",
      orange: "#f59e0b",
      gray: "#6b7280",
      blue: "var(--bpm-accent-cyan)",
    };
    return map[c] ?? map.gray;
  };
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
      render: (val: unknown) => {
        const id = String(val);
        const bg = getPriorityColor(id);
        return (
          <span
            className="rounded px-2 py-0.5 text-xs font-medium"
            style={{ backgroundColor: bg, color: "#fff" }}
          >
            {getPriorityLabel(id)}
          </span>
        );
      },
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

  const getStatusBadgeColor = (status: string) => {
    if (status === "in_progress" || status === "assigned") return "#f59e0b";
    if (status === "resolved" || status === "closed") return "var(--bpm-accent-mint)";
    if (status === "on_hold") return "#6b7280";
    return "var(--bpm-bg-secondary)";
  };

  const exportCsv = () => {
    const headers = ["Référence", "Titre", "Statut", "Priorité", "Catégorie", "Ouvert le"];
    const rows = filtered.map((t) => [
      t.reference,
      t.title,
      STATUS_LABELS[t.status] ?? t.status,
      getPriorityLabel(t.priorityId),
      getCategoryLabel(t.categoryId),
      t.openedAt ? new Date(t.openedAt).toLocaleDateString("fr-FR") : "",
    ]);
    const csv = [headers.join(";"), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))].join("\r\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tickets-${domainId}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <AssetManagerNav />
        <div className="flex flex-wrap items-center justify-between gap-3 mt-1">
          <div>
            <h1 className="doc-page-title text-2xl font-semibold" style={{ color: "var(--bpm-text-primary)" }}>Tickets</h1>
            <p className="doc-description mt-0.5" style={{ color: "var(--bpm-text-secondary)" }}>
              Suivi des tickets et demandes d&apos;intervention.
            </p>
          </div>
          <Link href={`/modules/asset-manager/${domainId}/tickets/new`} className="asset-manager-cta-button">
            <Button variant="primary" size="small">+ Nouveau ticket</Button>
          </Link>
        </div>
      </div>

      <div className="asset-manager-filters flex flex-wrap items-center gap-2 overflow-x-auto">
        {statusOptions.map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            variant={filterStatus === opt.value ? "primary" : "default"}
            onClick={() => setFilterStatus(opt.value)}
            className={filterStatus === opt.value ? "asset-manager-chip-active" : ""}
          />
        ))}
        {priorityOptions.map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            variant={filterPriority === opt.value ? "primary" : "default"}
            onClick={() => setFilterPriority(opt.value)}
            className={filterPriority === opt.value ? "asset-manager-chip-active" : ""}
          />
        ))}
        {slaRiskCount > 0 && (
          <Chip
            label={`${slaRiskCount} en danger SLA`}
            variant={filterSlaRisk ? "primary" : "default"}
            onClick={() => setFilterSlaRisk((v) => !v)}
            className={filterSlaRisk ? "asset-manager-chip-active" : ""}
          />
        )}
        <div className="ml-auto flex-shrink-0">
          <button
            type="button"
            onClick={exportCsv}
            disabled={filtered.length === 0}
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
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border bg-[var(--bpm-surface)] p-4" style={{ border: "1px solid #E5E7EB", borderRadius: 12 }}>
          <EmptyState
            title="Aucun ticket"
            description="Créez un ticket pour suivre une demande d'intervention."
            icon={<TicketIcon size={64} style={{ color: "var(--bpm-text-secondary)", opacity: 0.6 }} />}
            action={
              <Link href={`/modules/asset-manager/${domainId}/tickets/new`}>
                <Button variant="primary" size="small">+ Nouveau ticket</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--bpm-border)" }}>
          <Table
            minWidth={560}
            columns={columns.map((col) =>
              col.key === "status"
                ? {
                    ...col,
                    render: (val: unknown) => {
                      const s = String(val);
                      return (
                        <span
                          className="rounded px-2 py-0.5 text-xs font-medium"
                          style={{ backgroundColor: getStatusBadgeColor(s), color: "#fff" }}
                        >
                          {STATUS_LABELS[s] ?? s}
                        </span>
                      );
                    },
                  }
                : col
            )}
            data={filtered}
            keyColumn="id"
            onRowClick={(row) => router.push(`/modules/asset-manager/${domainId}/tickets/${row.id}`)}
          />
        </div>
      )}

    </div>
  );
}
