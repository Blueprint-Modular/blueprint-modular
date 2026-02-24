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
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiNotes, setAiNotes] = useState("");
  const [aiArticleType, setAiArticleType] = useState<"guide" | "procedure" | "best-practice" | "reference">("guide");
  const [aiWorkspace, setAiWorkspace] = useState<"nxtfood" | "beam" | "shared">("shared");

  const streamWikiGenerate = async (body: Record<string, unknown>) => {
    setAiLoading(true);
    setError(null);
    let accumulated = "";
    const updateContent = (chunk: string) => {
      accumulated += chunk;
      setContent(accumulated);
    };
    try {
      const res = await fetch("/api/wiki/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Erreur API");
      }
      const reader = res.body?.getReader();
      if (!reader) throw new Error("Pas de flux");
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6)) as { type: string; t?: string; message?: string };
              if (data.type === "chunk" && typeof data.t === "string") updateContent(data.t);
              if (data.type === "error") throw new Error(data.message ?? "Erreur IA");
            } catch (e) {
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de la génération");
    } finally {
      setAiLoading(false);
    }
  };

  const handleFormatWithAi = () => {
    if (!content.trim()) return;
    streamWikiGenerate({ action: "format", content, title: title || undefined });
  };

  const handleGenerateFromNotes = () => {
    if (!aiNotes.trim()) return;
    streamWikiGenerate({ notes: aiNotes.trim(), articleType: aiArticleType, workspace: aiWorkspace });
  };

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
      <div className="doc-breadcrumb" style={{ marginBottom: 8 }}>
        <Link href="/modules">Modules</Link> → <Link href="/modules/wiki">Wiki</Link> → <Link href={`/modules/wiki/${slug}`}>{slug}</Link> → Modifier
      </div>
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

        <div className="flex flex-wrap gap-2 border-b pb-2" style={{ borderColor: "var(--bpm-border)" }}>
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
          <button
            type="button"
            onClick={() => setAiPanelOpen((v) => !v)}
            className="px-3 py-1 rounded text-sm border"
            style={{
              borderColor: "var(--bpm-border)",
              background: aiPanelOpen ? "var(--bpm-accent)" : "transparent",
              color: aiPanelOpen ? "var(--bpm-surface)" : "var(--bpm-text-secondary)",
            }}
          >
            Aide IA
          </button>
        </div>

        {aiPanelOpen && (
          <div className="p-4 rounded border space-y-4" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)" }}>
            <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
              Utiliser l&apos;IA pour rédiger ou mettre en forme le contenu de l&apos;article.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                size="small"
                disabled={aiLoading || !content.trim()}
                onClick={handleFormatWithAi}
              >
                {aiLoading ? "Génération…" : "Mettre en forme le contenu actuel"}
              </Button>
            </div>
            <div className="pt-2 border-t" style={{ borderColor: "var(--bpm-border)" }}>
              <span className="block text-sm mb-2" style={{ color: "var(--bpm-text-secondary)" }}>Générer un article depuis des notes</span>
              <textarea
                value={aiNotes}
                onChange={(e) => setAiNotes(e.target.value)}
                placeholder="Collez ici vos notes brutes…"
                rows={3}
                className="w-full px-3 py-2 rounded border font-mono text-sm mb-2"
                style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg)", color: "var(--bpm-text-primary)" }}
              />
              <div className="flex flex-wrap gap-2 items-center mb-2">
                <select
                  value={aiArticleType}
                  onChange={(e) => setAiArticleType(e.target.value as typeof aiArticleType)}
                  className="px-2 py-1 rounded border text-sm"
                  style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg)", color: "var(--bpm-text-primary)" }}
                >
                  <option value="guide">Guide</option>
                  <option value="procedure">Procédure</option>
                  <option value="best-practice">Bonnes pratiques</option>
                  <option value="reference">Référence</option>
                </select>
                <select
                  value={aiWorkspace}
                  onChange={(e) => setAiWorkspace(e.target.value as typeof aiWorkspace)}
                  className="px-2 py-1 rounded border text-sm"
                  style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg)", color: "var(--bpm-text-primary)" }}
                >
                  <option value="nxtfood">NXTFOOD</option>
                  <option value="beam">BEAM Consulting</option>
                  <option value="shared">Partagé</option>
                </select>
                <Button
                  type="button"
                  size="small"
                  disabled={aiLoading || !aiNotes.trim()}
                  onClick={handleGenerateFromNotes}
                >
                  Générer l&apos;article
                </Button>
              </div>
            </div>
          </div>
        )}

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
