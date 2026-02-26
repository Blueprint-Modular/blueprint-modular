"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Table, Spinner, Panel, Button, Selectbox } from "@/components/bpm";

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
      render: (_: unknown, row: Assignment) => row.asset ? `${row.asset.reference} — ${row.asset.label}` : "—",
    },
    {
      key: "assignee",
      label: "Bénéficiaire",
      render: (_: unknown, row: Assignment) => row.assignee?.name ?? "—",
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

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/asset-manager">Gestion d&apos;actifs</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}`}>Tableau de bord</Link> → Mises à disposition
        </nav>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>Mises à disposition</h1>
            <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
              Suivi des mises à disposition d&apos;actifs.
            </p>
          </div>
          <Link href={`/modules/asset-manager/${domainId}/assignments/new`}>
            <Button size="small">+ Nouvelle MAD</Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <Selectbox
          label="Statut"
          value={filterStatus}
          onChange={(v) => setFilterStatus(String(v))}
          options={statusOptions}
          placeholder="Tous"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="medium" />
        </div>
      ) : (
        <Panel variant="info" title={`${filtered.length} mise(s) à disposition`}>
          <Table
            columns={columns}
            data={filtered}
            keyColumn="id"
            onRowClick={(row) => router.push(`/modules/asset-manager/${domainId}/assignments/${row.id}`)}
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
