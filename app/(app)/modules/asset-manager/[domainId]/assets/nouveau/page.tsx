"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Panel, Button, Input, Selectbox } from "@/components/bpm";

interface DomainConfig {
  domain_id: string;
  domain_label: string;
  asset_label_singular: string;
  asset_types: {
    id: string;
    label: string;
    fields: { key: string; label: string; type: string; options?: string[] }[];
  }[];
  statuses: { id: string; label: string }[];
}

export default function AssetManagerAssetNewPage() {
  const params = useParams();
  const router = useRouter();
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const [config, setConfig] = useState<DomainConfig | null>(null);
  const [assetTypeId, setAssetTypeId] = useState("");
  const [label, setLabel] = useState("");
  const [statusId, setStatusId] = useState("");
  const [attributes, setAttributes] = useState<Record<string, string | number | boolean>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!domainId) return;
    fetch(`/api/asset-manager/config/${domainId}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((c) => {
        setConfig(c);
        if (c?.statuses?.length) setStatusId(c.statuses[0].id);
      })
      .catch(() => {});
  }, [domainId]);

  const typeOptions = config?.asset_types.map((t) => ({ value: t.id, label: t.label })) ?? [];
  const statusOptions = config?.statuses.map((s) => ({ value: s.id, label: s.label })) ?? [];
  const fields = config?.asset_types.find((t) => t.id === assetTypeId)?.fields ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!label.trim() || !statusId || !assetTypeId) {
      setError("Libellé, type et statut sont requis.");
      return;
    }
    setSaving(true);
    try {
      const attrs = fields.map((f) => ({
        key: f.key,
        valueText: typeof attributes[f.key] === "string" ? (attributes[f.key] as string) : undefined,
        valueNumber: typeof attributes[f.key] === "number" ? (attributes[f.key] as number) : undefined,
        valueBool: typeof attributes[f.key] === "boolean" ? (attributes[f.key] as boolean) : undefined,
        valueDate: typeof attributes[f.key] === "string" && f.type === "date" ? (attributes[f.key] as string) : undefined,
      }));
      const res = await fetch("/api/asset-manager/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          domainId,
          assetTypeId,
          label: label.trim(),
          statusId,
          attributes: attrs,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data.error as string) || "Erreur à la création.");
        return;
      }
      const asset = await res.json();
      router.push(`/modules/asset-manager/${domainId}/assets/${asset.id}`);
    } catch {
      setError("Erreur réseau.");
    } finally {
      setSaving(false);
    }
  };

  if (!config) {
    return (
      <div className="doc-page">
        <p style={{ color: "var(--bpm-text-secondary)" }}>Chargement…</p>
        <Link href={`/modules/asset-manager/${domainId}/assets`} style={{ color: "var(--bpm-accent-cyan)" }}>
          ← Retour
        </Link>
      </div>
    );
  }

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <div className="doc-breadcrumb">
          <Link href={`/modules/asset-manager/${domainId}/assets`}>{config.asset_label_singular}s</Link> → Nouveau
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
          Nouvel {config.asset_label_singular.toLowerCase()}
        </h1>
      </div>

      <Panel variant="info" title="Création">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
              Type *
            </label>
            <Selectbox
              options={typeOptions}
              value={assetTypeId}
              onChange={(v) => setAssetTypeId(v ?? "")}
              placeholder="Choisir le type"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
              Libellé *
            </label>
            <Input value={label} onChange={setLabel} placeholder="Nom de l'actif" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
              Statut *
            </label>
            <Selectbox
              options={statusOptions}
              value={statusId}
              onChange={(v) => setStatusId(v ?? "")}
              placeholder="Statut"
            />
          </div>
          {fields.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
                {f.label}
              </label>
              {f.type === "select" ? (
                <Selectbox
                  options={[{ value: "", label: "—" }, ...(f.options ?? []).map((o) => ({ value: o, label: o }))]}
                  value={String(attributes[f.key] ?? "")}
                  onChange={(v) => setAttributes((prev) => ({ ...prev, [f.key]: v ?? "" }))}
                />
              ) : f.type === "number" ? (
                <Input
                  type="text"
                  value={String(attributes[f.key] ?? "")}
                  onChange={(v) => setAttributes((prev) => ({ ...prev, [f.key]: v === "" ? "" : Number(v) }))}
                  placeholder={f.label}
                />
              ) : f.type === "date" ? (
                <input
                  type="date"
                  value={String(attributes[f.key] ?? "")}
                  onChange={(e) => setAttributes((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{
                    borderColor: "var(--bpm-border)",
                    background: "var(--bpm-bg-primary)",
                    color: "var(--bpm-text-primary)",
                  }}
                />
              ) : (
                <Input
                  value={String(attributes[f.key] ?? "")}
                  onChange={(v) => setAttributes((prev) => ({ ...prev, [f.key]: v }))}
                  placeholder={f.label}
                />
              )}
            </div>
          ))}
          {error && (
            <p className="text-sm" style={{ color: "var(--bpm-accent)" }}>
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Création…" : "Créer"}
            </Button>
            <Link href={`/modules/asset-manager/${domainId}/assets`}>
              <Button type="button" variant="secondary">
                Annuler
              </Button>
            </Link>
          </div>
        </form>
      </Panel>

      <nav className="doc-pagination mt-8">
        <Link href={`/modules/asset-manager/${domainId}/assets`} style={{ color: "var(--bpm-accent-cyan)" }}>
          ← Liste des actifs
        </Link>
      </nav>
    </div>
  );
}
