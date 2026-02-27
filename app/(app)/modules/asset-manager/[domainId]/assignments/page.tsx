"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Download, UserCheck } from "lucide-react";
import { Table, Spinner, Button, Chip, EmptyState } from "@/components/bpm";

type Assignment = {
  id: string;
  reference: string;
  assignmentType: string;
  startDate: string;
  expectedEndDate: string | null;
  actualEndDate: string | null;
  status: string;
  asset: { id: string; reference: string; label: string } | null;
  assignee: { id: string; name: string | null } | null;
};

const STATUS_LABELS: Record<string, string> = {
  active: "En cours",
  returned: "Retourné",
  overdue: "En retard",
  cancelled: "Annulé",
};

export default function AssetManagerAssignmentsPage() {
  const params = useParams();
  const router = useRouter();
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");

  const fetchAssignments = useCallback(() => {
    if (!domainId) return;
    fetch(`/api/asset-manager/assignments?domainId=${encodeURIComponent(domainId)}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setAssignments(Array.isArray(data) ? data : []);
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
    fetchAssignments();
  }, [domainId, fetchAssignments]);

  const filtered = assignments.filter((a) => !filterStatus || a.status === filterStatus);

  const columns = [
    { key: "reference", label: "Référence" },
    {
      key: "asset",
      label: "Actif",
      render: (_: unknown, row: Record<string, unknown>) => {
        const r = row as Assignment;
        return r.asset ? `${r.asset.reference} — ${r.asset.label}` : "—";
      },
    },
    {
      key: "assignee",
      label: "Bénéficiaire",
      render: (_: unknown, row: Record<string, unknown>) => (row as Assignment).assignee?.name ?? "—",
    },
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
      key: "startDate",
      label: "Début",
      render: (val: unknown) => (val ? new Date(String(val)).toLocaleDateString("fr-FR") : ""),
    },
    {
      key: "expectedEndDate",
      label: "Fin prévue",
      render: (val: unknown) => (val ? new Date(String(val)).toLocaleDateString("fr-FR") : "—"),
    },
  ];

  const statusOptions = [
    { value: "", label: "Tous les statuts" },
    ...Object.entries(STATUS_LABELS).map(([id, label]) => ({ value: id, label })),
  ];

  const getStatusBadgeColor = (status: string) => {
    if (status === "active") return "var(--bpm-accent-mint)";
    if (status === "returned") return "#6b7280";
    if (status === "overdue") return "#ef4444";
    if (status === "cancelled") return "#6b7280";
    return "var(--bpm-bg-secondary)";
  };

  const exportCsv = () => {
    const headers = ["Référence", "Actif", "Bénéficiaire", "Statut", "Début", "Fin prévue"];
    const rows = filtered.map((a) => [
      a.reference,
      a.asset ? `${a.asset.reference} — ${a.asset.label}` : "—",
      a.assignee?.name ?? "—",
      STATUS_LABELS[a.status] ?? a.status,
      a.startDate ? new Date(a.startDate).toLocaleDateString("fr-FR") : "",
      a.expectedEndDate ? new Date(a.expectedEndDate).toLocaleDateString("fr-FR") : "—",
    ]);
    const csv = [headers.join(";"), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))].join("\r\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mad-${domainId}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columnsWithBadges = columns.map((col) =>
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
  );

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="doc-page-title text-2xl font-semibold" style={{ color: "var(--bpm-text-primary)" }}>Mise à Disposition</h1>
            <p className="doc-description mt-0.5" style={{ color: "var(--bpm-text-secondary)" }}>
              Suivi des mises à Disposition d&apos;actifs.
            </p>
          </div>
          <Link href={`/modules/asset-manager/${domainId}/assignments/new`} className="asset-manager-cta-button">
            <Button variant="primary" size="small">+ Nouvelle MAD</Button>
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
            title="Aucune mise à disposition"
            description="Créez une MAD pour attribuer un actif à un bénéficiaire."
            icon={<UserCheck size={64} style={{ color: "var(--bpm-text-secondary)", opacity: 0.6 }} />}
            action={
              <Link href={`/modules/asset-manager/${domainId}/assignments/new`}>
                <Button variant="primary" size="small">+ Nouvelle MAD</Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--bpm-border)" }}>
          <Table
            columns={columnsWithBadges}
            data={filtered}
            minWidth={560}
            keyColumn="id"
            onRowClick={(row) => router.push(`/modules/asset-manager/${domainId}/assignments/${row.id}`)}
          />
        </div>
      )}

    </div>
  );
}
