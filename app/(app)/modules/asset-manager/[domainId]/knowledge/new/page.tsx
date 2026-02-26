"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Panel, Button, Spinner, Input, Selectbox } from "@/components/bpm";

const CATEGORY_OPTIONS = [
  { value: "procedure", label: "Procédure" },
  { value: "faq", label: "FAQ" },
  { value: "guide", label: "Guide" },
  { value: "reference", label: "Référence" },
  { value: "troubleshooting", label: "Dépannage" },
];

export default function AssetManagerKnowledgeNewPage() {
  const params = useParams();
  const router = useRouter();
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const [config, setConfig] = useState<{ asset_types?: { id: string; label: string }[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("procedure");
  const [assetTypeId, setAssetTypeId] = useState("");
  const [tagsStr, setTagsStr] = useState("");
  const [visibility, setVisibility] = useState<"technicians_only" | "public">("technicians_only");

  useEffect(() => {
    if (!domainId) return;
    fetch(`/api/asset-manager/config/${domainId}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then(setConfig)
      .finally(() => setLoading(false));
  }, [domainId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || saving) return;
    setSaving(true);
    const tags = tagsStr.trim() ? tagsStr.split(/[\s,]+/).map((t) => t.trim()).filter(Boolean) : [];
    fetch("/api/asset-manager/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        domainId,
        title: title.trim(),
        content: content.trim(),
        categoryId,
        assetTypeId: assetTypeId || null,
        tags,
        visibility,
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((created) => {
        if (created?.id) router.push(`/modules/asset-manager/${domainId}/knowledge/${created.id}`);
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
          <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>Modules</Link> →{" "}
          <Link href="/modules/asset-manager" style={{ color: "var(--bpm-accent-cyan)" }}>Gestion d&apos;actifs</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>Tableau de bord</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}/knowledge`} style={{ color: "var(--bpm-accent-cyan)" }}>Base de connaissances</Link> → Nouveau
        </nav>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>Nouvel article</h1>
      </div>

      <Panel variant="info" title="Créer un article">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Titre *" value={title} onChange={setTitle} required placeholder="Titre de l'article" />
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Contenu *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={12}
              className="w-full rounded border p-2 text-sm"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
              placeholder="Contenu en Markdown ou texte..."
            />
          </div>
          <Selectbox label="Catégorie" value={categoryId} onChange={(v) => setCategoryId(String(v))} options={CATEGORY_OPTIONS} />
          {config?.asset_types && config.asset_types.length > 0 && (
            <Selectbox
              label="Type d'actif (optionnel)"
              value={assetTypeId}
              onChange={(v) => setAssetTypeId(String(v))}
              options={[{ value: "", label: "—" }, ...config.asset_types.map((t) => ({ value: t.id, label: t.label }))]}
            />
          )}
          <Input label="Tags (séparés par des virgules)" value={tagsStr} onChange={setTagsStr} placeholder="ex: imprimante, erreur, papier" />
          <Selectbox
            label="Visibilité"
            value={visibility}
            onChange={(v) => setVisibility(v as "technicians_only" | "public")}
            options={[
              { value: "technicians_only", label: "Techniciens uniquement" },
              { value: "public", label: "Public" },
            ]}
          />
          <div className="flex gap-2 pt-2">
            <Button type="submit" size="small" disabled={saving || !title.trim() || !content.trim()}>
              {saving ? "Création…" : "Créer l'article"}
            </Button>
            <Link href={`/modules/asset-manager/${domainId}/knowledge`}>
              <Button type="button" size="small" variant="outline">Annuler</Button>
            </Link>
          </div>
        </form>
      </Panel>

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href={`/modules/asset-manager/${domainId}/knowledge`} style={{ color: "var(--bpm-accent-cyan)" }}>← Base de connaissances</Link>
      </nav>
    </div>
  );
}
