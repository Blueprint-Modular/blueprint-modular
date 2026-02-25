"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { Panel, Button } from "@/components/bpm";
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
  children: { id: string; title: string; slug: string }[];
  canEdit?: boolean;
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

/** Transforme #mot (hashtags en milieu de ligne) en spans tag pour le rendu, sans casser les titres Markdown (# en début de ligne). */
function contentWithHashtagTags(content: string): string {
  if (!content) return content;
  return content.replace(/\s#([a-zA-Z0-9_\u00C0-\u024F-]+)/g, ' <span class="bpm-wiki-tag">$1</span>');
}

export default function WikiArticlePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { data: session, status } = useSession();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!slug) return;
    if (status === "loading") return;

    if (!session) {
      const guest = getGuestArticleBySlug(slug);
      setArticle(guestToArticle(guest));
      setError(guest ? null : "Article introuvable");
      setLoading(false);
      return;
    }

    fetch(`/api/wiki/${encodeURIComponent(slug)}`, { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setArticle)
      .catch(() => setError("Article introuvable"))
      .finally(() => setLoading(false));
  }, [slug, session, status]);

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

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
          {article.title}
        </h1>
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          Mis à jour le {new Date(article.updatedAt).toLocaleDateString("fr-FR")}
          {article.author?.name && ` · ${article.author.name}`}
          {!session && article.canEdit === false && (
            <span className="text-xs px-2 py-0.5 rounded border" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}>
              Lecture seule
            </span>
          )}
          {(session || article.canEdit) && (
            <>
              <Link href={`/modules/wiki/${article.slug}/edit`}>
                <Button variant="outline" size="small">Modifier</Button>
              </Link>
              <Button variant="outline" size="small" onClick={handleDelete} disabled={deleting}>
                Supprimer
              </Button>
            </>
          )}
        </div>
      </div>
      {!article.isPublished && (
        <span className="wiki-draft inline-block mb-4">Brouillon</span>
      )}

      <div
        className="prose prose-sm max-w-none rounded-lg p-6 border wiki-article-content"
        style={{
          borderColor: "var(--bpm-border)",
          background: "var(--bpm-surface)",
          color: "var(--bpm-text-primary)",
        }}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeHighlight]}>
          {contentWithHashtagTags(article.content) || "*Aucun contenu.*"}
        </ReactMarkdown>
      </div>

      {article.children && article.children.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--bpm-text-primary)" }}>
            Sous-articles
          </h2>
          <ul className="flex flex-wrap gap-2">
            {article.children.map((c) => (
              <li key={c.id}>
                <Link href={`/modules/wiki/${c.slug}`} className="underline" style={{ color: "var(--bpm-accent-cyan)" }}>
                  → {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <nav className="doc-pagination mt-8">
        <Link href="/modules/wiki" style={{ color: "var(--bpm-accent-cyan)" }}>← Retour au Wiki</Link>
        <Link href="/modules/wiki/new" style={{ color: "var(--bpm-accent-cyan)" }}>Créer un article</Link>
        <Link href="/modules/wiki/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>Documentation</Link>
      </nav>
    </div>
  );
}
