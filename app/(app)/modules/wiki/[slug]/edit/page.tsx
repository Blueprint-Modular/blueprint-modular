"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Panel, Toggle } from "@/components/bpm";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function WikiEditPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/wiki/${encodeURIComponent(slug)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((a) => {
        setTitle(a.title);
        setContent(a.content ?? "");
        setIsPublished(a.isPublished ?? false);
      })
      .catch(() => setError("Article introuvable"))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/wiki/${encodeURIComponent(slug)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, isPublished }),
      });
      if (!res.ok) throw new Error("Erreur");
      router.push(`/modules/wiki/${slug}`);
    } catch {
      setError("Impossible de sauvegarder");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p style={{ color: "var(--bpm-text-secondary)" }}>Chargement...</p>;
  if (error) {
    return (
      <Panel variant="error" title="Erreur">
        {error}
        <Link href="/modules/wiki" className="block mt-2 underline" style={{ color: "var(--bpm-accent-cyan)" }}>Retour au Wiki</Link>
      </Panel>
    );
  }

  return (
    <div>
      <nav className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/wiki">Wiki</Link>
        <span className="mx-2">/</span>
        <Link href={`/modules/wiki/${slug}`}>{slug}</Link>
        <span className="mx-2">/</span>
        <span>Modifier</span>
      </nav>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--bpm-accent)" }}>
        Modifier l&apos;article
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
        <label className="block">
          <span className="block text-sm mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Titre</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 rounded border"
            style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
          />
        </label>
        <div>
          <Toggle label="Publié" value={isPublished} onChange={setIsPublished} />
        </div>

        <div className="flex gap-2 border-b pb-2" style={{ borderColor: "var(--bpm-border)" }}>
          <button
            type="button"
            onClick={() => setPreview(false)}
            className={`px-3 py-1 rounded text-sm ${!preview ? "btn-primary" : ""}`}
            style={preview ? { background: "transparent", color: "var(--bpm-text-secondary)" } : undefined}
          >
            Écrire
          </button>
          <button
            type="button"
            onClick={() => setPreview(true)}
            className={`px-3 py-1 rounded text-sm ${preview ? "btn-primary" : ""}`}
            style={!preview ? { background: "transparent", color: "var(--bpm-text-secondary)" } : undefined}
          >
            Prévisualiser
          </button>
        </div>

        {preview ? (
          <div
            className="min-h-[400px] p-4 rounded border prose prose-sm max-w-none"
            style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || "*Aucun contenu.*"}</ReactMarkdown>
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={18}
            className="w-full px-3 py-2 rounded border font-mono text-sm min-h-[400px]"
            style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
          />
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Enregistrement..." : "Sauvegarder"}
          </Button>
          <Link href={`/modules/wiki/${slug}`}>
            <Button type="button" variant="outline">Annuler</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
