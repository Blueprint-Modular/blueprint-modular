"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface WikiArticle {
  id: string;
  title: string;
  slug: string;
  parentId: string | null;
  isPublished: boolean;
  updatedAt: string;
  author?: { name: string | null };
  authorId?: string;
  canEdit?: boolean;
  children?: WikiArticle[];
}

function buildTree(items: WikiArticle[], parentId: string | null = null): WikiArticle[] {
  return items
    .filter((a) => a.parentId === parentId)
    .map((a) => ({ ...a, children: buildTree(items, a.id) }));
}

function TreeNode({
  node,
  depth = 0,
  selectedParent,
  onSelect,
}: {
  node: WikiArticle;
  depth?: number;
  selectedParent: string | null;
  onSelect: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(depth === 0);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div style={{ paddingLeft: depth * 16 }}>
      <div
        className={`wiki-tree-node ${selectedParent === node.id ? "active" : ""}`}
        onClick={() => {
          onSelect(node.id);
          if (hasChildren) setOpen(!open);
        }}
      >
        {hasChildren && <span>{open ? "▼" : "▶"}</span>}
        <span>{node.title}</span>
        {hasChildren && <span className="wiki-tree-count">({node.children!.length})</span>}
      </div>
      {open && hasChildren && node.children!.map((child) => (
        <TreeNode key={child.id} node={child} depth={depth + 1} selectedParent={selectedParent} onSelect={onSelect} />
      ))}
    </div>
  );
}

export default function WikiPage() {
  const { data: session } = useSession();
  const [articles, setArticles] = useState<WikiArticle[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedParent, setSelectedParent] = useState<string | null>(null);

  const fetchArticles = () => {
    const url = search ? `/api/wiki?search=${encodeURIComponent(search)}` : "/api/wiki";
    fetch(url)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setArticles(Array.isArray(data) ? data : []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    fetchArticles();
  }, [search]);

  const handleDelete = async (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Supprimer cet article ?")) return;
    const res = await fetch(`/api/wiki/${encodeURIComponent(slug)}`, { method: "DELETE" });
    if (res.ok) setArticles((prev) => prev.filter((a) => a.slug !== slug));
  };

  const tree = buildTree(articles);
  const displayed = articles.filter((a) => a.parentId === selectedParent);

  return (
    <div className="wiki-page doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → Module Wiki</div>
        <h1>Module Wiki</h1>
        <p className="doc-description">
          Wiki interne : articles en Markdown, arborescence, brouillons et publication. Idéal pour la doc d&apos;équipe.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Module</span>
        </div>
      </div>
      <div className="wiki-header">
        <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--bpm-text-primary)" }}>Articles</h2>
        {session ? (
          <Link href="/modules/wiki/new" className="btn-primary">
            + Nouvel article
          </Link>
        ) : (
          <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
            <Link href="/login" className="underline" style={{ color: "var(--bpm-accent-cyan)" }}>Connexion</Link> requise pour créer un article.
          </span>
        )}
      </div>
      <div className="wiki-search">
        <input
          type="search"
          placeholder="Rechercher dans le wiki..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {loading ? (
        <div className="wiki-loading">Chargement...</div>
      ) : articles.length === 0 ? (
        <div className="wiki-empty">
          <p>Le wiki est vide pour l&apos;instant.</p>
          {session ? (
            <Link href="/modules/wiki/new">Créer le premier article →</Link>
          ) : (
            <p className="text-sm mt-2" style={{ color: "var(--bpm-text-secondary)" }}>
              <Link href="/login" className="underline" style={{ color: "var(--bpm-accent-cyan)" }}>Connectez-vous</Link> pour créer des articles.
            </p>
          )}
        </div>
      ) : (
        <div className="wiki-layout">
          <aside className="wiki-sidebar">
            <div
              className={`wiki-tree-node ${selectedParent === null ? "active" : ""}`}
              onClick={() => setSelectedParent(null)}
            >
              📁 Tous les articles
            </div>
            {tree.map((node) => (
              <TreeNode key={node.id} node={node} selectedParent={selectedParent} onSelect={setSelectedParent} />
            ))}
          </aside>
          <main className="wiki-content">
            {displayed.length === 0 ? (
              <p>Aucun article dans cette section.</p>
            ) : (
              <div className="wiki-article-list">
                {displayed.map((article) => (
                  <div key={article.id} className="wiki-card flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-3">
                      <Link href={`/modules/wiki/${article.slug}`} className="min-w-0 flex-1 no-underline block" style={{ color: "inherit" }}>
                        <h3>{article.title}</h3>
                        <div className="wiki-card-meta">
                          <span>Mis à jour le {new Date(article.updatedAt).toLocaleDateString("fr-FR")}</span>
                          {article.author && <span> · {article.author.name ?? ""}</span>}
                          {!article.isPublished && <span className="wiki-draft">Brouillon</span>}
                        </div>
                      </Link>
                      {article.canEdit && (
                        <div className="flex gap-2 flex-shrink-0 text-sm">
                          <Link
                            href={`/modules/wiki/${article.slug}/edit`}
                            onClick={(e) => e.stopPropagation()}
                            className="underline"
                            style={{ color: "var(--bpm-accent-cyan)" }}
                          >
                            Modifier
                          </Link>
                          <button
                            type="button"
                            onClick={(e) => handleDelete(e, article.slug)}
                            className="underline"
                            style={{ color: "var(--bpm-text-secondary)" }}
                          >
                            Supprimer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
