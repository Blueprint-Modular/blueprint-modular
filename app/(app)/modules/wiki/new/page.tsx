"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button, Panel, Toggle } from "@/components/bpm";
import { WikiEditorToolbar } from "@/components/wiki/WikiEditorToolbar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { getGuestWikiArticles, addGuestArticle } from "@/lib/wiki-guest";
import { normalizeSlug } from "@/lib/slug";
import { VoiceRecorder } from "@/components/ai/VoiceRecorder";

function slugFromTitle(title: string): string {
  return normalizeSlug(title);
}

export default function WikiNewPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [preview, setPreview] = useState(false);
  const [parents, setParents] = useState<{ id: string; title: string; slug: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [articleType, setArticleType] = useState<"guide" | "procedure" | "best-practice" | "reference">("procedure");
  const [workspace, setWorkspace] = useState<"nxtfood" | "beam" | "shared">("nxtfood");
  const [generating, setGenerating] = useState(false);

  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (session) {
      fetch("/api/wiki", { credentials: "include" })
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => setParents(Array.isArray(data) ? data : []))
        .catch(() => setParents([]));
    } else {
      const guest = getGuestWikiArticles();
      setParents(guest.map((a) => ({ id: a.id, title: a.title, slug: a.slug })));
    }
  }, [session]);

  const handleTitleChange = (v: string) => {
    setTitle(v);
    setSlug(slugFromTitle(v));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const finalSlug = normalizeSlug(slug || slugFromTitle(title));
      if (!session) {
        const article = addGuestArticle({
          title,
          content,
          slug: finalSlug,
          parentId,
          isPublished,
          author: { name: "Invité" },
        });
        router.push(`/modules/wiki/${article.slug}`);
        return;
      }
      const res = await fetch("/api/wiki", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          slug: finalSlug,
          parentId: parentId || undefined,
          isPublished,
        }),
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erreur");
      }
      const article = await res.json();
      router.push(`/modules/wiki/${article.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const handleVoiceTranscription = async (transcription: string) => {
    setVoiceError(null);
    setGenerating(true);
    setContent("# Génération en cours…\n\n");

    try {
      const res = await fetch("/api/wiki/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: transcription, articleType, workspace }),
      });
      if (!res.ok) throw new Error(`Erreur génération ${res.status}`);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let full = "";
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          for (const line of decoder.decode(value, { stream: true }).split("\n")) {
            if (!line.startsWith("data: ")) continue;
            try {
              const data = JSON.parse(line.slice(6)) as { type: string; t?: string };
              if (data.type === "chunk" && data.t) {
                full += data.t;
                setContent(full);
              }
            } catch { /* ignore */ }
          }
        }
      }
      if (!title.trim()) {
        const firstH1 = full.split("\n").find((l) => l.startsWith("# "));
        if (firstH1) handleTitleChange(firstH1.replace(/^#+\s*/, "").trim());
      }
    } catch (err) {
      setVoiceError(err instanceof Error ? err.message : "Erreur génération");
      setContent("");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <div className="doc-breadcrumb" style={{ marginBottom: 8 }}>
        <Link href="/modules">Modules</Link> → <Link href="/modules/wiki">Wiki</Link> → Nouvel article
      </div>
      <nav className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/wiki">Wiki</Link>
        <span className="mx-2">/</span>
        <span>Nouvel article</span>
      </nav>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--bpm-accent)" }}>
        Nouvel article
      </h1>

      {error && (
        <Panel variant="error" title="Erreur" className="mb-4">
          {error}
        </Panel>
      )}

      {/* Bloc vocal */}
      <div
        className="rounded-lg border p-4 mb-6"
        style={{ background: "var(--bpm-bg-primary)", borderColor: "var(--bpm-border)" }}
      >
        <p className="text-sm font-semibold mb-3" style={{ color: "var(--bpm-text-secondary)" }}>
          ✦ Générer depuis une note vocale
        </p>
        <div className="flex gap-3 mb-3 flex-wrap">
          <div>
            <label className="block text-xs mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Type</label>
            <select
              value={articleType}
              onChange={(e) => setArticleType(e.target.value as typeof articleType)}
              className="px-2 py-1.5 rounded border text-sm"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-primary)" }}
            >
              <option value="procedure">Procédure</option>
              <option value="guide">Guide</option>
              <option value="best-practice">Bonne pratique</option>
              <option value="reference">Référence</option>
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Workspace</label>
            <select
              value={workspace}
              onChange={(e) => setWorkspace(e.target.value as typeof workspace)}
              className="px-2 py-1.5 rounded border text-sm"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-primary)" }}
            >
              <option value="nxtfood">NXTFOOD</option>
              <option value="beam">BEAM</option>
              <option value="shared">Partagé</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <VoiceRecorder
            onTranscription={handleVoiceTranscription}
            onError={setVoiceError}
            label="Dicter l'article"
            disabled={generating}
          />
          {generating && (
            <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
              ✦ Génération Qwen3…
            </span>
          )}
        </div>
        {voiceError && (
          <p className="text-sm mt-2" style={{ color: "var(--bpm-accent)" }}>⚠ {voiceError}</p>
        )}
        <p className="text-xs mt-2" style={{ color: "var(--bpm-text-secondary)" }}>
          Décrivez oralement votre procédure ou guide → Whisper transcrit → Qwen3 structure l&apos;article.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
        <label className="block">
          <span className="block text-sm mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Titre</span>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
            className="w-full px-3 py-2 rounded border"
            style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
          />
        </label>
        <label className="block">
          <span className="block text-sm mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Slug (auto-généré)</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="generé-du-titre"
            className="w-full px-3 py-2 rounded border"
            style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
          />
        </label>
        <label className="block">
          <span className="block text-sm mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Parent</span>
          <select
            value={parentId ?? ""}
            onChange={(e) => setParentId(e.target.value || null)}
            className="w-full px-3 py-2 rounded border"
            style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
          >
            <option value="">Aucun (racine)</option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </label>
        <div>
          <Toggle label="Publié" value={isPublished} onChange={setIsPublished} />
        </div>

        <div className="flex items-center gap-2 border-b pb-2" style={{ borderColor: "var(--bpm-border)" }}>
          <Toggle
            label={preview ? "Prévisualisation : oui" : "Prévisualisation : non"}
            value={preview}
            onChange={setPreview}
          />
        </div>

        {preview ? (
          <div
            className="min-h-[400px] p-4 rounded border prose prose-sm max-w-none"
            style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{content || "*Aucun contenu.*"}</ReactMarkdown>
          </div>
        ) : (
          <>
            <WikiEditorToolbar
              textareaRef={contentTextareaRef}
              value={content}
              onChange={setContent}
            />
            <textarea
              ref={contentTextareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={18}
              className="w-full px-3 py-2 rounded-b border font-mono text-sm min-h-[400px]"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
              placeholder="Contenu Markdown..."
            />
          </>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Enregistrement..." : "Sauvegarder"}
          </Button>
          <Link href="/modules/wiki">
            <Button type="button" variant="outline">Annuler</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
