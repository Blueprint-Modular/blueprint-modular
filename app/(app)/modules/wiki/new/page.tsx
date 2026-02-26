"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button, Panel, Toggle, Selectbox } from "@/components/bpm";
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
  const [excerpt, setExcerpt] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [pinned, setPinned] = useState(false);
  const [preview, setPreview] = useState(false);
  const [parents, setParents] = useState<{ id: string; title: string; slug: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [articleType, setArticleType] = useState<"guide" | "procedure" | "best-practice" | "reference">("procedure");
  const [workspace, setWorkspace] = useState<"service1" | "service2" | "shared">("service1");
  const [generating, setGenerating] = useState(false);

  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  /** Pré-remplir depuis le bac à sable (Simulateur) si l'utilisateur a cliqué sur "Créer un article depuis ce contenu". */
  useEffect(() => {
    try {
      const fromSandbox = typeof window !== "undefined" && sessionStorage.getItem("wiki-sandbox-content");
      if (fromSandbox) {
        sessionStorage.removeItem("wiki-sandbox-content");
        setContent(fromSandbox);
        const firstH1 = fromSandbox.split("\n").find((l) => l.startsWith("# "));
        if (firstH1 && !title) {
          const t = firstH1.replace(/^#+\s*/, "").trim();
          if (t) {
            setTitle(t);
            setSlug(slugFromTitle(t));
          }
        }
      }
    } catch {
      // ignore
    }
  }, []);

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
          excerpt: excerpt.trim() || undefined,
          tags: tags.length ? tags : undefined,
          pinned,
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
          <Selectbox
            label="Type"
            options={[
              { value: "procedure", label: "Procédure" },
              { value: "guide", label: "Guide" },
              { value: "best-practice", label: "Bonne pratique" },
              { value: "reference", label: "Référence" },
            ]}
            value={articleType}
            onChange={(v) => setArticleType(v as typeof articleType)}
            placeholder="Type"
          />
          <Selectbox
            label="Workspace"
            options={[
              { value: "service1", label: "Service 1" },
              { value: "service2", label: "Service 2" },
              { value: "shared", label: "Partagé" },
            ]}
            value={workspace}
            onChange={(v) => setWorkspace(v as typeof workspace)}
            placeholder="Workspace"
          />
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
            className="bpm-input w-full px-3 py-2 rounded border"
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
            className="bpm-input w-full px-3 py-2 rounded border"
            style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
          />
        </label>
        <Selectbox
          label="Parent"
          options={[{ value: "", label: "Aucun (racine)" }, ...parents.map((p) => ({ value: p.id, label: p.title }))]}
          value={parentId ?? ""}
          onChange={(v) => setParentId(v || null)}
          placeholder="Aucun (racine)"
        />
        <div>
          <Toggle label="Publié" value={isPublished} onChange={setIsPublished} />
        </div>
        <div>
          <Toggle label="Épingler cet article" value={pinned} onChange={setPinned} />
        </div>
        <label className="block">
          <span className="block text-sm mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Résumé (excerpt)</span>
          <input
            type="text"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="2-3 lignes optionnel"
            className="bpm-input w-full px-3 py-2 rounded border"
            style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
          />
        </label>
        <label className="block">
          <span className="block text-sm mb-1" style={{ color: "var(--bpm-text-secondary)" }}>Tags (Entrée ou virgule pour ajouter)</span>
          <div className="flex flex-wrap gap-1 mb-1">
            {tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm" style={{ background: "var(--bpm-border)", color: "var(--bpm-text-primary)" }}>
                {t}
                <button type="button" onClick={() => setTags((prev) => prev.filter((x) => x !== t))} className="opacity-70 hover:opacity-100" aria-label="Retirer">×</button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  const v = (e.key === "," ? tagInput.replace(/,/g, "") : tagInput).trim();
                  if (v && !tags.includes(v)) setTags((prev) => [...prev, v]);
                  setTagInput("");
                }
              }}
              placeholder="Ajouter un tag..."
              className="flex-1 min-w-[120px] px-2 py-1 rounded border text-sm"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
            />
          </div>
        </label>

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
              className="bpm-textarea w-full px-3 py-2 rounded-b border font-mono text-sm min-h-[400px]"
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
