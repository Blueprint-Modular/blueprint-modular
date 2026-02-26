"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Panel, Button, Spinner, Input, Selectbox } from "@/components/bpm";

type DomainConfig = {
  ticket_types?: string[];
  priorities: { id: string; label: string }[];
  ticket_categories: { id: string; label: string; subcategories: string[] }[];
};

export default function AssetManagerTicketNewPage() {
  const params = useParams();
  const router = useRouter();
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const [config, setConfig] = useState<DomainConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [typeId, setTypeId] = useState("");
  const [priorityId, setPriorityId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategory, setSubcategory] = useState("");

  useEffect(() => {
    if (!domainId) return;
    fetch(`/api/asset-manager/config/${domainId}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((cfg) => {
        setConfig(cfg);
        if (cfg?.priorities?.length) setPriorityId(cfg.priorities[0].id);
        if (cfg?.ticket_categories?.length) setCategoryId(cfg.ticket_categories[0].id);
        if (cfg?.ticket_types?.length) setTypeId(cfg.ticket_types[0]);
      })
      .finally(() => setLoading(false));
  }, [domainId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || saving) return;
    setSaving(true);
    fetch("/api/asset-manager/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        domainId,
        title: title.trim(),
        description: description.trim(),
        typeId: typeId || undefined,
        priorityId: priorityId || undefined,
        categoryId: categoryId || undefined,
        subcategory: subcategory.trim() || null,
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((created) => {
        if (created?.id) router.push(`/modules/asset-manager/${domainId}/tickets/${created.id}`);
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

  const typeOptions = (config?.ticket_types ?? []).map((t: string) => ({ value: t, label: t }));
  const priorityOptions = (config?.priorities ?? []).map((p: { id: string; label: string }) => ({ value: p.id, label: p.label }));
  const categoryOptions = (config?.ticket_categories ?? []).map((c: { id: string; label: string }) => ({ value: c.id, label: c.label }));
  const selectedCategory = config?.ticket_categories?.find((c: { id: string; subcategories: string[] }) => c.id === categoryId);
  const subcategoryOptions = (selectedCategory?.subcategories ?? []).map((s: string) => ({ value: s, label: s }));

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/asset-manager">Gestion d&apos;actifs</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}`}>Tableau de bord</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}/tickets`}>Tickets</Link> → Nouveau
        </nav>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>Nouveau ticket</h1>
      </div>

      <Panel variant="info" title="Créer un ticket">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Titre" value={title} onChange={(value) => setTitle(value)} required placeholder="Résumé du problème ou de la demande" />
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              className="w-full rounded border p-2 text-sm"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
              placeholder="Décrivez le problème ou la demande..."
            />
          </div>
          {typeOptions.length > 0 && (
            <Selectbox label="Type" value={typeId} onChange={(v) => setTypeId(String(v))} options={[{ value: "", label: "—" }, ...typeOptions]} />
          )}
          {priorityOptions.length > 0 && (
            <Selectbox label="Priorité" value={priorityId} onChange={(v) => setPriorityId(String(v))} options={priorityOptions} />
          )}
          {categoryOptions.length > 0 && (
            <Selectbox label="Catégorie" value={categoryId} onChange={(v) => setCategoryId(String(v))} options={categoryOptions} />
          )}
          {subcategoryOptions.length > 0 && (
            <Selectbox label="Sous-catégorie" value={subcategory} onChange={(v) => setSubcategory(String(v))} options={[{ value: "", label: "—" }, ...subcategoryOptions]} />
          )}
          <div className="flex gap-2 pt-2">
            <Button type="submit" size="small" disabled={saving || !title.trim() || !description.trim()}>
              {saving ? "Création…" : "Créer le ticket"}
            </Button>
            <Link href={`/modules/asset-manager/${domainId}/tickets`}>
              <Button type="button" variant="outline" size="small">Annuler</Button>
            </Link>
          </div>
        </form>
      </Panel>

      <nav className="doc-pagination mt-8">
        <Link href={`/modules/asset-manager/${domainId}/tickets`} style={{ color: "var(--bpm-accent-cyan)" }}>← Liste des tickets</Link>
      </nav>
    </div>
  );
}
