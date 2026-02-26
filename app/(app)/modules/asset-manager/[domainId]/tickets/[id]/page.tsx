"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Panel, Button, Spinner, Selectbox } from "@/components/bpm";

type Ticket = {
  id: string;
  reference: string;
  typeId: string;
  title: string;
  description: string;
  status: string;
  priorityId: string;
  categoryId: string;
  subcategory: string | null;
  openedAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
  solution: string | null;
  requester: { id: string; name: string | null; email: string | null } | null;
  assignee: { id: string; name: string | null } | null;
  asset: { id: string; reference: string; label: string } | null;
};

type DomainConfig = {
  priorities: { id: string; label: string; sla_hours?: number }[];
  ticket_categories: { id: string; label: string; subcategories: string[] }[];
};

const STATUS_OPTIONS = [
  { value: "new", label: "Nouveau" },
  { value: "in_progress", label: "En cours" },
  { value: "on_hold", label: "En attente" },
  { value: "resolved", label: "Résolu" },
  { value: "closed", label: "Clos" },
];

export default function AssetManagerTicketDetailPage() {
  const params = useParams();
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const id = typeof params?.id === "string" ? params.id : "";
  const [config, setConfig] = useState<DomainConfig | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editStatus, setEditStatus] = useState("");
  const [editSolution, setEditSolution] = useState("");

  useEffect(() => {
    if (!domainId || !id) return;
    Promise.all([
      fetch(`/api/asset-manager/config/${domainId}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/asset-manager/tickets/${id}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([cfg, t]) => {
        setConfig(cfg);
        setTicket(t);
        if (t) {
          setEditStatus(t.status);
          setEditSolution(t.solution ?? "");
        }
      })
      .finally(() => setLoading(false));
  }, [domainId, id]);

  const handleSave = () => {
    if (!ticket || saving) return;
    setSaving(true);
    fetch(`/api/asset-manager/tickets/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: editStatus, solution: editSolution || null }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((updated) => {
        if (updated) setTicket(updated);
        setEditStatus(updated?.status ?? editStatus);
        setEditSolution(updated?.solution ?? editSolution);
      })
      .finally(() => setSaving(false));
  };

  if (loading) {
    return (
      <div className="doc-page flex justify-center py-12">
        <Spinner size="medium" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="doc-page">
        <Panel variant="warning" title="Ticket introuvable">Ce ticket n&apos;existe pas ou vous n&apos;y avez pas accès.</Panel>
        <Link href={`/modules/asset-manager/${domainId}/tickets`} style={{ color: "var(--bpm-accent-cyan)" }}>← Liste des tickets</Link>
      </div>
    );
  }

  const getPriorityLabel = (pid: string) => config?.priorities?.find((p) => p.id === pid)?.label ?? pid;
  const getCategoryLabel = (cid: string) => config?.ticket_categories?.find((c) => c.id === cid)?.label ?? cid;

  const openStatuses = ["new", "open", "pending", "in_progress", "on_hold", "assigned"];
  const isOpen = openStatuses.includes(ticket.status);
  const slaHours = config?.priorities?.find((p) => p.id === ticket.priorityId)?.sla_hours ?? 48;
  const elapsedHours = (Date.now() - new Date(ticket.openedAt).getTime()) / (1000 * 60 * 60);
  const slaPercent = isOpen && slaHours > 0 ? Math.min(150, Math.round((elapsedHours / slaHours) * 100)) : 0;
  const slaColor =
    !isOpen ? "var(--bpm-text-secondary)" : slaPercent >= 100 ? "var(--bpm-accent)" : slaPercent >= 80 ? "var(--bpm-accent-amber, #f59e0b)" : "var(--bpm-accent-mint)";

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/asset-manager">Gestion d&apos;actifs</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}`}>Tableau de bord</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}/tickets`}>Tickets</Link> → {ticket.reference}
        </nav>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>{ticket.title}</h1>
        <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
          {ticket.reference} — Ouvert le {new Date(ticket.openedAt).toLocaleDateString("fr-FR")} — {getPriorityLabel(ticket.priorityId)} — {getCategoryLabel(ticket.categoryId)}
        </p>
      </div>

      {isOpen && (
        <Panel variant="info" title="SLA" className="mt-4">
          <div className="flex justify-between items-center mb-1 text-sm">
            <span style={{ color: "var(--bpm-text-secondary)" }}>Temps consommé (objectif : {slaHours} h)</span>
            <span className="tabular-nums font-medium" style={{ color: slaColor }}>{slaPercent} %</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: "var(--bpm-bg-secondary)" }}>
            <div
              className="h-full rounded-full transition-[width]"
              style={{ width: `${Math.min(100, slaPercent)}%`, background: slaColor }}
            />
          </div>
          {slaPercent >= 100 && (
            <p className="text-xs mt-1" style={{ color: "var(--bpm-accent)" }}>SLA dépassé</p>
          )}
        </Panel>
      )}

      <Panel variant="info" title="Informations">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-4">
          <dt style={{ color: "var(--bpm-text-secondary)" }}>Demandeur</dt>
          <dd>{ticket.requester?.name ?? ticket.requester?.email ?? "—"}</dd>
          <dt style={{ color: "var(--bpm-text-secondary)" }}>Assigné à</dt>
          <dd>{ticket.assignee?.name ?? "—"}</dd>
          <dt style={{ color: "var(--bpm-text-secondary)" }}>Actif lié</dt>
          <dd>{ticket.asset ? `${ticket.asset.reference} — ${ticket.asset.label}` : "—"}</dd>
        </dl>
        <div className="text-sm" style={{ color: "var(--bpm-text-primary)" }}>
          <div style={{ color: "var(--bpm-text-secondary)", marginBottom: 4 }}>Description</div>
          <div className="whitespace-pre-wrap rounded p-3" style={{ background: "var(--bpm-bg-secondary)" }}>{ticket.description}</div>
        </div>
      </Panel>

      {(ticket.status === "resolved" || ticket.status === "closed") && (
        <Panel variant="info" title="Base de connaissances" className="mt-6">
          <p className="text-sm mb-3" style={{ color: "var(--bpm-text-secondary)" }}>
            Créez un article à partir de ce ticket pour enrichir la base de connaissances.
          </p>
          <Link href={`/modules/asset-manager/${domainId}/knowledge/new?fromTicket=${ticket.id}`}>
            <Button variant="outline" size="small">Publier en base de connaissance</Button>
          </Link>
        </Panel>
      )}

      <Panel variant="info" title="Modifier le ticket" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Selectbox
            label="Statut"
            value={editStatus}
            onChange={(v) => setEditStatus(String(v))}
            options={STATUS_OPTIONS}
          />
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Solution (si résolu)</label>
            <textarea
              value={editSolution}
              onChange={(e) => setEditSolution(e.target.value)}
              rows={4}
              className="w-full rounded border p-2 text-sm"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
              placeholder="Décrire la solution..."
            />
          </div>
        </div>
        <div className="mt-4">
          <Button size="small" onClick={handleSave} disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</Button>
        </div>
      </Panel>

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href={`/modules/asset-manager/${domainId}/tickets`} style={{ color: "var(--bpm-accent-cyan)" }}>← Liste des tickets</Link>
        <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>Tableau de bord</Link>
      </nav>
    </div>
  );
}
