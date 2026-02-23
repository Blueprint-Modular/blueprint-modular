"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Panel, Button } from "@/components/bpm";

type Article = {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  author: { name: string | null; email: string };
  children: { id: string; title: string; slug: string }[];
};

export default function WikiArticlePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { data: session } = useSession();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/wiki/${encodeURIComponent(slug)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setArticle)
      .catch(() => setError("Article introuvable"))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleDelete = async () => {
    if (!confirm("Supprimer cet article ?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/wiki/${encodeURIComponent(slug)}`, { method: "DELETE" });
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
      <div className="doc-breadcrumb" style={{ marginBottom: 8 }}>
        <Link href="/modules">Modules</Link> → <Link href="/modules/wiki">Module Wiki</Link> → {article.title}
      </div>
      <nav className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/wiki">← Wiki</Link>
        <span className="mx-2">/</span>
        <span>{article.title}</span>
      </nav>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
          {article.title}
        </h1>
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          Mis à jour le {new Date(article.updatedAt).toLocaleDateString("fr-FR")}
          {article.author?.name && ` · ${article.author.name}`}
          {session && (
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
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {article.content || "*Aucun contenu.*"}
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
        <span />
      </nav>
    </div>
  );
}
