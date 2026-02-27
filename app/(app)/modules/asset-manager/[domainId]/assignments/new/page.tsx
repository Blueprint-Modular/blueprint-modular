"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Panel, Button, Spinner, Selectbox } from "@/components/bpm";

type Asset = { id: string; reference: string; label: string };
type User = { id: string; name: string | null; email: string | null };

export default function AssetManagerAssignmentNewPage() {
  const params = useParams();
  const router = useRouter();
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const [assets, setAssets] = useState<Asset[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assetId, setAssetId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [expectedEndDate, setExpectedEndDate] = useState("");
  const [assignmentType, setAssignmentType] = useState("temporary");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!domainId) return;
    Promise.all([
      fetch(`/api/asset-manager/assets?domainId=${encodeURIComponent(domainId)}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : [])),
      fetch("/api/asset-manager/me", { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([aList, me]) => {
        setAssets(Array.isArray(aList) ? aList : []);
        setCurrentUser(me);
        if (me?.id) setAssigneeId(me.id);
      })
      .finally(() => setLoading(false));
  }, [domainId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetId || !assigneeId || !startDate || saving) return;
    setSaving(true);
    fetch("/api/asset-manager/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        domainId,
        assetId,
        assigneeId,
        startDate,
        expectedEndDate: expectedEndDate.trim() || null,
        assignmentType,
        reason: reason.trim() || null,
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((created) => {
        if (created?.id) router.push(`/modules/asset-manager/${domainId}/assignments/${created.id}`);
      })
      .finally(() => setSaving(false));
  };

  const assetOptions = assets.map((a) => ({ value: a.id, label: `${a.reference} — ${a.label}` }));

  if (loading) {
    return (
      <div className="doc-page flex justify-center py-12">
        <Spinner size="medium" />
      </div>
    );
  }

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/asset-manager">Gestion d&apos;actifs</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}`}>Tableau de bord</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}/assignments`}>MAD</Link> → Nouvelle
        </nav>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>Nouvelle mise à Disposition</h1>
      </div>

      <Panel variant="info" title="Créer une MAD">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Selectbox
            label="Actif *"
            value={assetId}
            onChange={(v) => setAssetId(v)}
            options={[{ value: "", label: "Sélectionner un actif" }, ...assetOptions]}
            required
          />
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Bénéficiaire</label>
            <p className="text-sm" style={{ color: "var(--bpm-text-primary)" }}>{currentUser?.name ?? currentUser?.email ?? "Vous (session)"}</p>
            <input type="hidden" name="assigneeId" value={assigneeId} />
          </div>
          <Selectbox
            label="Type"
            value={assignmentType}
            onChange={(v) => setAssignmentType(v)}
            options={[{ value: "temporary", label: "Temporaire" }, { value: "permanent", label: "Permanent" }]}
          />
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Date de début *</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="rounded border p-2 text-sm"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Date de fin prévue</label>
            <input
              type="date"
              value={expectedEndDate}
              onChange={(e) => setExpectedEndDate(e.target.value)}
              className="rounded border p-2 text-sm"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Motif (optionnel)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="bpm-textarea w-full rounded-lg border px-3 py-2 text-sm resize-y"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" size="small" disabled={saving || !assetId || !startDate}>
              {saving ? "Création…" : "Créer la MAD"}
            </Button>
            <Link href={`/modules/asset-manager/${domainId}/assignments`}>
              <Button type="button" variant="outline" size="small">Annuler</Button>
            </Link>
          </div>
        </form>
      </Panel>

      <nav className="doc-pagination mt-8">
        <Link href={`/modules/asset-manager/${domainId}/assignments`} style={{ color: "var(--bpm-accent-cyan)" }}>← Liste des MAD</Link>
      </nav>
    </div>
  );
}
