"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Panel, Button, Spinner, Selectbox, Badge, Card, Progress } from "@/components/bpm";
import { FicheHeader, FicheSectionCard, FicheFieldGrid, FicheNav, FicheSkeleton } from "@/components/fiche";

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

function statusBadgeVariant(s: string): "primary" | "success" | "warning" | "error" | "default" {
  if (s === "resolved" || s === "closed") return "success";
  if (s === "new" || s === "open") return "primary";
  if (s === "in_progress" || s === "on_hold" || s === "pending") return "warning";
  return "default";
}

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
    return <FicheSkeleton sections={2} withSla withForm />;
  }

  if (!ticket) {
    return (
      <div className="doc-page">
        <Panel variant="warning" title="Ticket introuvable">Ce ticket n&apos;existe pas ou vous n&apos;y avez pas accès.</Panel>
        <FicheNav backLink={`/modules/asset-manager/${domainId}/tickets`} backLabel="← Liste des tickets" />
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
  const slaExceeded = isOpen && slaPercent >= 100;

  const statusLabel = STATUS_OPTIONS.find((o) => o.value === ticket.status)?.label ?? ticket.status;

  return (
    <div className="doc-page">
      <FicheHeader
        breadcrumb={
          <>
            <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>Modules</Link> → <Link href="/modules/asset-manager" style={{ color: "var(--bpm-accent-cyan)" }}>Gestion de parc</Link> →{" "}
            <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>Tableau de bord</Link> →{" "}
            <Link href={`/modules/asset-manager/${domainId}/tickets`} style={{ color: "var(--bpm-accent-cyan)" }}>Tickets</Link> → {ticket.reference}
          </>
        }
        title={ticket.title}
        subtitle={
          <>
            <Badge variant="default">{ticket.reference}</Badge>
            <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Ouvert le {new Date(ticket.openedAt).toLocaleDateString("fr-FR")}</span>
            <Badge variant="default">{getPriorityLabel(ticket.priorityId)}</Badge>
            <Badge variant="default">{getCategoryLabel(ticket.categoryId)}</Badge>
            <Badge variant={statusBadgeVariant(ticket.status)}>{statusLabel}</Badge>
          </>
        }
      />

      {isOpen && (
        <FicheSectionCard title="SLA" className="mt-4">
          <Progress
            value={Math.min(100, slaPercent)}
            max={100}
            label={`Temps consommé (objectif : ${slaHours} h)`}
            showValue
          />
          <div className="mt-2">
            {slaExceeded ? (
              <Badge variant="error">SLA dépassé</Badge>
            ) : (
              <Badge variant="success">SLA OK</Badge>
            )}
          </div>
        </FicheSectionCard>
      )}

      <FicheSectionCard title="Informations" className="mt-4">
        <FicheFieldGrid
          withDividers
          items={[
            { label: "Demandeur", value: ticket.requester?.name ?? ticket.requester?.email ?? "" },
            { label: "Assigné à", value: ticket.assignee?.name ?? "" },
            { label: "Actif lié", value: ticket.asset ? `${ticket.asset.reference} — ${ticket.asset.label}` : "" },
          ]}
        />
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Description</p>
          <div className="whitespace-pre-wrap rounded-lg p-3 text-sm" style={{ background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-primary)" }}>
            {ticket.description}
          </div>
        </div>
      </FicheSectionCard>

      {(ticket.status === "resolved" || ticket.status === "closed") && (
        <FicheSectionCard title="Connaissances" className="mt-4">
          <p className="text-sm mb-3" style={{ color: "var(--bpm-text-secondary)" }}>
            Créez un article à partir de ce ticket pour enrichir les connaissances.
          </p>
          <Link href={`/modules/asset-manager/${domainId}/knowledge/new?fromTicket=${ticket.id}`}>
            <Button variant="outline" size="small">Publier en connaissances</Button>
          </Link>
        </FicheSectionCard>
      )}

      <Card variant="outlined" className="mt-4">
        <div className="bpm-card-body p-4">
          <h3 className="text-base font-semibold mb-3" style={{ color: "var(--bpm-text-primary)" }}>Modifier le ticket</h3>
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
                className="bpm-textarea w-full rounded-lg border px-3 py-2 text-sm resize-y"
                style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
                placeholder="Décrire la solution..."
              />
            </div>
          </div>
          <div className="mt-4">
            <Button variant="primary" size="medium" onClick={handleSave} disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
        </div>
      </Card>

      <FicheNav
        backLink={`/modules/asset-manager/${domainId}/tickets`}
        backLabel="← Liste des tickets"
        secondaryLinks={[{ href: `/modules/asset-manager/${domainId}`, label: "Tableau de bord" }]}
      />
    </div>
  );
}
