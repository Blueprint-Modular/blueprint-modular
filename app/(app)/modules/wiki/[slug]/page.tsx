"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { rehypeWikiHashtags } from "@/lib/rehype-wiki-hashtags";
import { Panel, Button } from "@/components/bpm";
import { useAssistant } from "@/lib/ai/assistant-context";
import { getGuestArticleBySlug, getGuestWikiArticles, deleteGuestArticle } from "@/lib/wiki-guest";

type Article = {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  author: { name: string | null; email?: string };
  children: { id: string; title: string; slug: string; excerpt?: string; tags?: string[]; pinned?: boolean; isPublished?: boolean }[];
  canEdit?: boolean;
  excerpt?: string | null;
  tags?: string[];
  pinned?: boolean;
  viewCount?: number;
  readingTimeMinutes?: number | null;
  wordCount?: number | null;
  lastRevisedBy?: string | null;
  prevSlug?: string;
  nextSlug?: string;
};

function guestToArticle(g: ReturnType<typeof getGuestArticleBySlug>): Article | null {
  if (!g) return null;
  const all = getGuestWikiArticles();
  const children = all.filter((a) => a.parentId === g.id).map((c) => ({ id: c.id, title: c.title, slug: c.slug }));
  return {
    id: g.id,
    title: g.title,
    slug: g.slug,
    content: g.content ?? "",
    isPublished: g.isPublished ?? true,
    createdAt: g.updatedAt,
    updatedAt: g.updatedAt,
    author: g.author ?? { name: null },
    children,
    canEdit: g.canEdit,
  };
}

/** Transforme [[slug]] et [[slug|label]] en liens Markdown vers /modules/wiki/slug. */
function contentWithWikiLinks(content: string): string {
  if (!content) return content;
  return content.replace(/\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g, (_, slugPart, label) => {
    const slug = slugPart.trim().toLowerCase().replace(/\s+/g, "-");
    const text = (label ?? slugPart).trim() || slug;
    return `[${text}](/modules/wiki/${encodeURIComponent(slug)})`;
  });
}

/** Extrait les titres H2 et H3 pour la table des matières. */
function buildToc(content: string): { level: 2 | 3; text: string; id: string }[] {
  const toc: { level: 2 | 3; text: string; id: string }[] = [];
  const regex = /^(##|###)\s+(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(content)) !== null) {
    const level = (m[1].length === 2 ? 2 : 3) as 2 | 3;
    const text = m[2].trim();
    const id = text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    toc.push({ level, text, id });
  }
  return toc;
}

export default function WikiArticlePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const isPrint = searchParams.get("print") === "true";
  const { data: session, status } = useSession();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [backlinks, setBacklinks] = useState<{ id: string; title: string; slug: string; excerpt?: string }[]>([]);
  const [comments, setComments] = useState<{ id: string; content: string; authorName?: string; createdAt: string }[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentSending, setCommentSending] = useState(false);
  const [knownTags, setKnownTags] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const assistant = useAssistant();

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const openAiAssistant = () => {
    const context = `Tu es en train de consulter l'article "${article?.title}" du wiki. Voici son contenu complet :\n\n${article?.content ?? ""}\n\nRéponds aux questions de l'utilisateur sur cet article ou sur les sujets qu'il aborde.`;
    assistant?.openAssistant(context);
    setMenuOpen(false);
  };

  const copyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/modules/wiki/${article?.slug ?? ""}`);
      setMenuOpen(false);
    }
  };

  const exportMarkdown = () => {
    if (!article) return;
    const blob = new Blob([article.content], { type: "text/markdown;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${article.slug || "article"}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
    setMenuOpen(false);
  };

  const openPrint = () => {
    window.open(`/modules/wiki/${article?.slug ?? ""}?print=true`, "_blank", "noopener");
    setMenuOpen(false);
  };

  useEffect(() => {
    if (!slug) return;
    if (status === "loading") return;

    if (!session) {
      const guest = getGuestArticleBySlug(slug);
      if (guest) {
        setArticle(guestToArticle(guest));
        setError(null);
        setLoading(false);
        return;
      }
      fetch(`/api/wiki/${encodeURIComponent(slug)}?incView=1`, { credentials: "include" })
        .then((r) => {
          if (!r.ok) throw new Error("Not found");
          return r.json();
        })
        .then(setArticle)
        .catch(() => setError("Article introuvable"))
        .finally(() => setLoading(false));
      return;
    }

    fetch(`/api/wiki/${encodeURIComponent(slug)}?incView=1`, { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setArticle)
      .catch(() => setError("Article introuvable"))
      .finally(() => setLoading(false));
  }, [slug, session, status]);

  useEffect(() => {
    if (!slug || !article) return;
    fetch(`/api/wiki/${encodeURIComponent(slug)}/backlinks`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setBacklinks(Array.isArray(data) ? data : []))
      .catch(() => setBacklinks([]));
    fetch(`/api/wiki/${encodeURIComponent(slug)}/comments`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setComments(Array.isArray(data) ? data : []))
      .catch(() => setComments([]));
  }, [slug, article]);

  useEffect(() => {
    if (session) {
      fetch("/api/wiki/tags", { credentials: "include" })
        .then((r) => (r.ok ? r.json() : []))
        .then((data: { tag: string }[]) => setKnownTags(Array.isArray(data) ? data.map((x) => x.tag) : []))
        .catch(() => setKnownTags([]));
    } else if (article) {
      setKnownTags(Array.isArray(article.tags) ? article.tags : []);
    }
  }, [session, article]);

  const refreshComments = () => {
    if (!session || !slug) return;
    fetch(`/api/wiki/${encodeURIComponent(slug)}/comments`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setComments(Array.isArray(data) ? data : []));
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || commentSending || !session) return;
    setCommentSending(true);
    try {
      const res = await fetch(`/api/wiki/${encodeURIComponent(slug)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText.trim() }),
        credentials: "include",
      });
      if (res.ok) {
        setCommentText("");
        refreshComments();
      }
    } finally {
      setCommentSending(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Supprimer cet article ?")) return;
    setDeleting(true);
    try {
      if (!session) {
        if (deleteGuestArticle(slug)) router.push("/modules/wiki");
        else setError("Impossible de supprimer");
        return;
      }
      const res = await fetch(`/api/wiki/${encodeURIComponent(slug)}`, { method: "DELETE", credentials: "include" });
      if (res.ok) router.push("/modules/wiki");
      else setError("Impossible de supprimer");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <p style={{ color: "var(--bpm-text-secondary)" }}>Chargement...</p>;
  if (error || !article) {
    return (
      <Panel variant="error" title="Erreur">
        {error ?? "Article introuvable."}
        <Link href="/modules/wiki" className="block mt-2 underline" style={{ color: "var(--bpm-accent-cyan)" }}>Retour au Wiki</Link>
      </Panel>
    );
  }

  const toc = buildToc(article.content);
  const contentForRender = contentWithWikiLinks(article.content);

  if (isPrint) {
    return (
      <div className="wiki-print-only p-8 max-w-[720px] mx-auto" style={{ color: "var(--bpm-text-primary)" }}>
        <h1 className="text-3xl font-bold mb-2">{article.title}</h1>
        <p className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
          {article.author?.name ?? article.lastRevisedBy ?? "—"} · {new Date(article.updatedAt).toLocaleDateString("fr-FR")}
          {article.readingTimeMinutes != null && ` · ${article.readingTimeMinutes} min`}
        </p>
        <div className="prose prose-sm max-w-none wiki-article-content" style={{ lineHeight: 1.7 }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeHighlight, rehypeWikiHashtags(knownTags)]}>
            {contentForRender || "*Aucun contenu.*"}
          </ReactMarkdown>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <main className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
            {article.title}
            {article.pinned && (
              <span className="ml-2 text-xs px-2 py-0.5 rounded font-normal" style={{ background: "var(--bpm-accent)", color: "#fff" }}>Épinglé</span>
            )}
            {!article.isPublished && <span className="wiki-draft ml-2">Brouillon</span>}
          </h1>
          <div className="flex items-center gap-2 flex-wrap" ref={menuRef}>
            {session && (
              <Button variant="outline" size="small" onClick={openAiAssistant}>
                Demander à l&apos;IA
              </Button>
            )}
            {(session || article.canEdit) && (
              <>
                <Link
                  href={`/modules/wiki/${article.slug}/edit`}
                  title={!session && article.canEdit ? "Modifications enregistrées localement (connectez-vous pour sauvegarder en base)" : undefined}
                >
                  <Button variant="outline" size="small">Modifier</Button>
                </Link>
                <Link href={`/modules/wiki/${article.slug}/history`}>
                  <Button variant="outline" size="small">Historique</Button>
                </Link>
                <div className="relative inline-block">
                  <Button variant="outline" size="small" onClick={() => setMenuOpen((o) => !o)} aria-haspopup="true" aria-expanded={menuOpen}>
                    …
                  </Button>
                  {menuOpen && (
                    <div
                      className="absolute right-0 top-full mt-1 py-1 rounded border shadow-lg z-20 min-w-[180px]"
                      style={{ background: "var(--bpm-surface)", borderColor: "var(--bpm-border)" }}
                      role="menu"
                    >
                      <button type="button" className="block w-full text-left px-3 py-2 text-sm hover:bg-[var(--bpm-bg-secondary)]" style={{ color: "var(--bpm-text-primary)" }} role="menuitem" onClick={copyLink}>
                        Copier le lien
                      </button>
                      <Link href={`/modules/wiki/${article.slug}/history`} className="block px-3 py-2 text-sm hover:bg-[var(--bpm-bg-secondary)]" style={{ color: "var(--bpm-text-primary)" }} onClick={() => setMenuOpen(false)}>
                        Voir l&apos;historique
                      </Link>
                      <button type="button" className="block w-full text-left px-3 py-2 text-sm hover:bg-[var(--bpm-bg-secondary)]" style={{ color: "var(--bpm-text-primary)" }} role="menuitem" onClick={exportMarkdown}>
                        Exporter en Markdown (.md)
                      </button>
                      <button type="button" className="block w-full text-left px-3 py-2 text-sm hover:bg-[var(--bpm-bg-secondary)]" style={{ color: "var(--bpm-text-primary)" }} role="menuitem" onClick={openPrint}>
                        Exporter en PDF (impression)
                      </button>
                      <button type="button" className="block w-full text-left px-3 py-2 text-sm hover:bg-[var(--bpm-bg-secondary)]" style={{ color: "var(--bpm-text-primary)" }} role="menuitem" onClick={handleDelete} disabled={deleting}>
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
          <span>Mis à jour le {new Date(article.updatedAt).toLocaleDateString("fr-FR")}</span>
          {(article.lastRevisedBy ?? article.author?.name) && <span> · {article.lastRevisedBy ?? article.author?.name}</span>}
          {article.readingTimeMinutes != null && <span> · {article.readingTimeMinutes} min</span>}
          {article.wordCount != null && <span> · {article.wordCount} mots</span>}
          {article.viewCount != null && article.viewCount > 0 && <span> · {article.viewCount} vue{article.viewCount > 1 ? "s" : ""}</span>}
          {!session && article.canEdit === false && (
            <span className="text-xs px-2 py-0.5 rounded border" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}>Lecture seule</span>
          )}
        </div>

        {article.excerpt && (
          <p className="text-sm mb-4 rounded-lg p-3 border" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-secondary)" }}>
            {article.excerpt}
          </p>
        )}

        {Array.isArray(article.tags) && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {article.tags.map((t) => (
              <Link key={t} href={`/modules/wiki?tag=${encodeURIComponent(t)}`} className="text-xs px-2 py-0.5 rounded hover:opacity-90" style={{ background: "var(--bpm-border)", color: "var(--bpm-text-secondary)" }}>
                {t}
              </Link>
            ))}
          </div>
        )}

        <div
          className="prose prose-sm max-w-none rounded-lg p-6 border wiki-article-content max-w-[720px]"
          style={{
            borderColor: "var(--bpm-border)",
            background: "var(--bpm-surface)",
            color: "var(--bpm-text-primary)",
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeHighlight, rehypeWikiHashtags(knownTags)]}
            components={{
              h2: ({ node, children, ...props }) => {
                const first = Array.isArray(children) ? children[0] : children;
                const text = typeof first === "string" ? first : "";
                const id = text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
                return <h2 id={id || undefined} {...props}>{children}</h2>;
              },
              h3: ({ node, children, ...props }) => {
                const first = Array.isArray(children) ? children[0] : children;
                const text = typeof first === "string" ? first : "";
                const id = text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
                return <h3 id={id || undefined} {...props}>{children}</h3>;
              },
            }}
          >
            {contentForRender || "*Aucun contenu.*"}
          </ReactMarkdown>
        </div>

        {article.children && article.children.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--bpm-text-primary)" }}>Dans cette section</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {article.children.map((c) => (
                <Link
                  key={c.id}
                  href={`/modules/wiki/${c.slug}`}
                  className="block p-3 rounded border no-underline"
                  style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)", color: "inherit" }}
                >
                  <span className="font-medium" style={{ color: "var(--bpm-accent-cyan)" }}>{c.title}</span>
                  {c.excerpt && (
                    <p className="text-sm mt-1 line-clamp-1" style={{ color: "var(--bpm-text-secondary)" }}>{c.excerpt}</p>
                  )}
                  <span className="inline-block mt-1">
                    <Badge variant={c.isPublished !== false ? "success" : "warning"} className="text-xs">
                      {c.isPublished !== false ? "Publié" : "Brouillon"}
                    </Badge>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {backlinks.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--bpm-text-primary)" }}>Articles liés</h2>
            <p className="text-sm mb-2" style={{ color: "var(--bpm-text-secondary)" }}>Articles qui citent celui-ci.</p>
            <ul className="space-y-2">
              {backlinks.map((b) => (
                <li key={b.id} className="p-2 rounded border" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}>
                  <Link href={`/modules/wiki/${b.slug}`} className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>
                    {b.title}
                  </Link>
                  {b.excerpt && (
                    <p className="text-sm mt-1 line-clamp-1" style={{ color: "var(--bpm-text-secondary)" }}>{b.excerpt}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {((article.prevSlug ?? article.nextSlug) && (
          <nav className="mt-8 flex justify-between gap-4 border-t pt-6" style={{ borderColor: "var(--bpm-border)" }} aria-label="Navigation précédent / suivant">
            {article.prevSlug ? (
              <Link href={`/modules/wiki/${article.prevSlug}`} className="text-sm font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>
                ← Article précédent
              </Link>
            ) : <span />}
            {article.nextSlug ? (
              <Link href={`/modules/wiki/${article.nextSlug}`} className="text-sm font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>
                Article suivant →
              </Link>
            ) : <span />}
          </nav>
        ))}

        {session && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--bpm-text-primary)" }}>Commentaires</h2>
            <ul className="space-y-3 mb-4">
              {comments.map((c) => (
                <li key={c.id} className="text-sm p-3 rounded border" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}>
                  <p className="m-0 whitespace-pre-wrap">{c.content}</p>
                  <span className="text-xs opacity-70">{c.authorName ?? "Anonyme"} · {new Date(c.createdAt).toLocaleString("fr-FR")}</span>
                </li>
              ))}
            </ul>
            <form onSubmit={handleAddComment} className="flex flex-col gap-2">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Ajouter un commentaire..."
                rows={2}
                className="w-full px-3 py-2 rounded border text-sm"
                style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
              />
              <Button type="submit" size="small" disabled={commentSending || !commentText.trim()}>
                {commentSending ? "Envoi…" : "Publier"}
              </Button>
            </form>
          </div>
        )}

        <nav className="doc-pagination mt-8">
          <Link href="/modules/wiki" style={{ color: "var(--bpm-accent-cyan)" }}>← Retour au Wiki</Link>
          <Link href="/modules/wiki/new" style={{ color: "var(--bpm-accent-cyan)" }}>Créer un article</Link>
          <Link href="/modules/wiki/tags" style={{ color: "var(--bpm-accent-cyan)" }}>Tags</Link>
          <Link href="/modules/wiki/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>Documentation</Link>
        </nav>
      </main>

      {toc.length > 0 && (
        <aside className="lg:w-48 flex-shrink-0 order-first lg:order-last">
          <nav className="sticky top-4 text-sm border rounded-lg p-3" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}>
            <p className="font-semibold mb-2" style={{ color: "var(--bpm-text-primary)" }}>Sommaire</p>
            <ul className="space-y-1">
              {toc.map((item) => (
                <li key={item.id} style={{ paddingLeft: item.level === 3 ? 12 : 0 }}>
                  <a href={`#${item.id}`} className="hover:underline" style={{ color: "var(--bpm-accent-cyan)" }}>{item.text}</a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      )}
    </div>
  );
}
