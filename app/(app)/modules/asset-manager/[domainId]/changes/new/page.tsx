"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Panel, Button, Spinner, Input, Selectbox } from "@/components/bpm";

export default function AssetManagerChangeNewPage() {
  const params = useParams();
  const router = useRouter();
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const [config, setConfig] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [impact, setImpact] = useState("");
  const [riskLevel, setRiskLevel] = useState("medium");
  const [rollbackPlan, setRollbackPlan] = useState("");
  const [type, setType] = useState("normal");

  useEffect(() => {
    if (!domainId) return;
    fetch(`/api/asset-manager/config/${domainId}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then(setConfig)
      .finally(() => setLoading(false));
  }, [domainId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !impact.trim() || !rollbackPlan.trim() || saving) return;
    setSaving(true);
    fetch("/api/asset-manager/changes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        domainId,
        type,
        title: title.trim(),
        description: description.trim(),
        impact: impact.trim(),
        riskLevel,
        rollbackPlan: rollbackPlan.trim(),
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((created) => {
        if (created?.id) router.push(`/modules/asset-manager/${domainId}/changes/${created.id}`);
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

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <nav className="doc-breadcrumb">
          <Link href={`/modules/asset-manager/${domainId}/changes`} style={{ color: "var(--bpm-accent-cyan)" }}>Changements</Link> → Nouvelle demande
        </nav>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>Nouvelle demande de changement</h1>
      </div>

      <Panel variant="info" title="Créer une demande">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Selectbox
            label="Type"
            value={type}
            onChange={(v) => setType(String(v))}
            options={[
              { value: "standard", label: "Standard" },
              { value: "normal", label: "Normal" },
              { value: "emergency", label: "Urgent" },
            ]}
          />
          <Input label="Titre *" value={title} onChange={setTitle} required placeholder="Résumé du changement" />
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Description *</label>
            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full rounded border p-2 text-sm" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Impact *</label>
            <textarea required value={impact} onChange={(e) => setImpact(e.target.value)} rows={3} className="w-full rounded border p-2 text-sm" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }} />
          </div>
          <Selectbox
            label="Niveau de risque *"
            value={riskLevel}
            onChange={(v) => setRiskLevel(String(v))}
            options={[
              { value: "low", label: "Faible" },
              { value: "medium", label: "Moyen" },
              { value: "high", label: "Élevé" },
              { value: "critical", label: "Critique" },
            ]}
          />
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Plan de rollback *</label>
            <textarea required value={rollbackPlan} onChange={(e) => setRollbackPlan(e.target.value)} rows={3} className="w-full rounded border p-2 text-sm" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" size="small" disabled={saving}>{saving ? "Création…" : "Créer la demande"}</Button>
            <Link href={`/modules/asset-manager/${domainId}/changes`}><Button type="button" size="small" variant="outline">Annuler</Button></Link>
          </div>
        </form>
      </Panel>

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href={`/modules/asset-manager/${domainId}/changes`} style={{ color: "var(--bpm-accent-cyan)" }}>← Changements</Link>
      </nav>
    </div>
  );
}
