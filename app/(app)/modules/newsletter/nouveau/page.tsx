"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Panel, Input, Textarea } from "@/components/bpm";

export default function NewsletterNouveauPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const res = await fetch("/api/newsletter/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: t,
          content: content,
          excerpt: excerpt.trim() || null,
          publishedAt: publishedAt.trim() ? publishedAt.trim() : null,
        }),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data && typeof data.error === "string") ? data.error : "Erreur lors de la création.");
        return;
      }
      const article = await res.json();
      router.push(`/modules/newsletter/${article.id}`);
    } catch {
      setError("Erreur réseau.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/newsletter">Newsletter</Link> → Nouvel article
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
          Nouvel article
        </h1>
        <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
          Remplissez le titre et le contenu. L&apos;extrait et la date de publication sont optionnels.
        </p>
      </div>

      <Panel variant="info" title="Créer un article">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
              Titre *
            </label>
            <Input
              value={title}
              onChange={setTitle}
              placeholder="Titre de l'article"
              aria-label="Titre"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
              Contenu
            </label>
            <Textarea
              value={content}
              onChange={setContent}
              placeholder="Contenu de l'article…"
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
              placeholder="Court résumé pour les listes"
              aria-label="Extrait"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>
              Date de publication (optionnel)
            </label>
            <input
              type="datetime-local"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm min-h-[44px]"
              style={{
                borderColor: "var(--bpm-border)",
                background: "var(--bpm-bg-primary)",
                color: "var(--bpm-text-primary)",
              }}
              aria-label="Date de publication"
            />
          </div>
          {error && (
            <p className="text-sm" style={{ color: "var(--bpm-accent)" }}>
              {error}
            </p>
          )}
          <div className="flex items-center gap-2">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Création…" : "Créer l'article"}
            </Button>
            <Link href="/modules/newsletter">
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
