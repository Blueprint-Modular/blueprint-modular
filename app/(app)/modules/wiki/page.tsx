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

  useEffect(() => {
    const url = search ? `/api/wiki?search=${encodeURIComponent(search)}` : "/api/wiki";
    fetch(url)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setArticles(Array.isArray(data) ? data : []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [search]);

  const tree = buildTree(articles);
  const displayed = articles.filter((a) => a.parentId === selectedParent);

  return (
    <div className="wiki-page">
      <div className="wiki-header">
        <h1>📚 Wiki</h1>
        {session && (
          <Link href="/modules/wiki/new" className="btn-primary">
            + Nouvel article
          </Link>
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
          {session && (
            <Link href="/modules/wiki/new">Créer le premier article →</Link>
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
                  <Link key={article.id} href={`/modules/wiki/${article.slug}`} className="wiki-card">
                    <h3>{article.title}</h3>
                    <div className="wiki-card-meta">
                      <span>Mis à jour le {new Date(article.updatedAt).toLocaleDateString("fr-FR")}</span>
                      {article.author && <span> · {article.author.name ?? ""}</span>}
                      {!article.isPublished && <span className="wiki-draft">Brouillon</span>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
