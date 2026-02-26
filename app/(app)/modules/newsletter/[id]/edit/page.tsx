"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button, Panel, Input, Textarea, Spinner } from "@/components/bpm";

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  publishedAt: string | null;
  archived: boolean;
}

export default function NewsletterEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : "";
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [archived, setArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    fetch(`/api/newsletter/articles/${id}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Article | null) => {
        if (data) {
          setTitle(data.title);
          setContent(data.content);
          setExcerpt(data.excerpt ?? "");
          setPublishedAt(data.publishedAt ? data.publishedAt.slice(0, 16) : "");
          setArchived(data.archived);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const t = title.trim();
    if (!t) {
      setError("Le titre est requis.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/newsletter/articles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: t,
          content,
          excerpt: excerpt.trim() || null,
          publishedAt: publishedAt.trim() ? publishedAt : null,
          archived,
        }),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data && typeof data.error === "string") ? data.error : "Erreur lors de l’enregistrement.");
        return;
      }
      router.push(`/modules/newsletter/${id}`);
    } catch {
      setError("Erreur réseau.");
    } finally {
      setSaving(false);
    }
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
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/newsletter">Newsletter</Link> →{" "}
          <Link href={`/modules/newsletter/${id}`}>{title || "Article"}</Link> → Modifier
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
          Modifier l’article
        </h1>
      </div>

      <Panel variant="info" title="Édition">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
              Titre *
            </label>
            <Input value={title} onChange={setTitle} placeholder="Titre" aria-label="Titre" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
              Contenu
            </label>
            <Textarea
              value={content}
              onChange={setContent}
              placeholder="Contenu…"
              aria-label="Contenu"
              rows={10}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
              Extrait (optionnel)
            </label>
            <Textarea
              value={excerpt}
              onChange={setExcerpt}
              placeholder="Court résumé"
              aria-label="Extrait"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
              Date de publication (optionnel)
            </label>
            <Input
              type="datetime-local"
              value={publishedAt}
              onChange={setPublishedAt}
              aria-label="Date de publication"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="archived"
              checked={archived}
              onChange={(e) => setArchived(e.target.checked)}
              style={{ accentColor: "var(--bpm-accent-cyan)" }}
            />
            <label htmlFor="archived" style={{ color: "var(--bpm-text-primary)" }}>
              Archivé
            </label>
          </div>
          {error && (
            <p className="text-sm" style={{ color: "var(--bpm-accent)" }}>
              {error}
            </p>
          )}
          <div className="flex items-center gap-2">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
            <Link href={`/modules/newsletter/${id}`}>
              <Button type="button" variant="secondary">
                Annuler
              </Button>
            </Link>
          </div>
        </form>
      </Panel>

      <nav className="doc-pagination mt-8">
        <Link href="/modules/newsletter" style={{ color: "var(--bpm-accent-cyan)" }}>
          ← Retour à la Newsletter
        </Link>
      </nav>
    </div>
  );
}
