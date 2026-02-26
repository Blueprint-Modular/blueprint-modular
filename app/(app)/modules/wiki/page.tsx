"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Badge, Button } from "@/components/bpm";
import { getGuestWikiArticles, deleteGuestArticle, type GuestWikiArticle } from "@/lib/wiki-guest";

type WikiArticle = GuestWikiArticle;

function buildTree(items: WikiArticle[], parentId: string | null = null): WikiArticle[] {
  return items
    .filter((a) => a.parentId === parentId)
    .map((a) => ({ ...a, children: buildTree(items, a.id) }));
}

function getAllNodeIds(nodes: WikiArticle[]): string[] {
  return nodes.flatMap((n) => [n.id, ...getAllNodeIds(n.children ?? [])]);
}

function TreeNode({
  node,
  depth = 0,
  selectedParent,
  expandedIds,
  onToggle,
  onSelect,
  onOpenArticle,
  onAddChild,
}: {
  node: WikiArticle;
  depth?: number;
  selectedParent: string | null;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (id: string | null) => void;
  onOpenArticle: (slug: string) => void;
  onAddChild: (parentId: string) => void;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const open = depth === 0 || expandedIds.has(node.id);

  const handleClick = () => {
    if (hasChildren) {
      onSelect(node.id);
      onToggle(node.id);
    } else {
      onOpenArticle(node.slug);
    }
  };

  return (
    <div style={{ paddingLeft: depth * 16 }} className="flex flex-col min-w-0">
      <div className="flex items-center gap-1 group">
        <div
          className={`wiki-tree-node flex-1 min-w-0 ${selectedParent === node.id ? "active" : ""}`}
          onClick={handleClick}
          role={hasChildren ? "button" : "link"}
          aria-label={hasChildren ? `Section ${node.title}, ${node.children!.length} article(s)` : `Ouvrir l'article ${node.title}`}
        >
          {hasChildren ? (
            <span className="wiki-tree-arrow" aria-hidden>
              {open ? (
                <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill="currentColor">
                  <path d="M480-373.85 303.85-550h352.3L480-373.85Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill="currentColor">
                  <path d="M410-303.85v-352.3L586.15-480 410-303.85Z" />
                </svg>
              )}
            </span>
          ) : (
            <span className="wiki-tree-doc" aria-hidden>📄</span>
          )}
          <span className="truncate">{node.title}</span>
          {hasChildren && <span className="wiki-tree-count flex-shrink-0">({node.children!.length})</span>}
        </div>
        <Link
          href={`/modules/wiki/new?parentId=${encodeURIComponent(node.id)}`}
          onClick={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 text-sm px-1.5 py-0.5 rounded hover:bg-[var(--bpm-border)] flex-shrink-0"
          style={{ color: "var(--bpm-accent-cyan)" }}
          title="Créer un sous-article"
          aria-label="Créer un sous-article"
        >
          +
        </Link>
      </div>
      {open && hasChildren && node.children!.map((child) => (
        <TreeNode
          key={child.id}
          node={child}
          depth={depth + 1}
          selectedParent={selectedParent}
          expandedIds={expandedIds}
          onToggle={onToggle}
          onSelect={onSelect}
          onOpenArticle={onOpenArticle}
          onAddChild={onAddChild}
        />
      ))}
    </div>
  );
}

export default function WikiPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [articles, setArticles] = useState<WikiArticle[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedParent, setSelectedParent] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const openArticle = (slug: string) => router.push(`/modules/wiki/${slug}`);
  const onToggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const onAddChild = (parentId: string) => router.push(`/modules/wiki/new?parentId=${encodeURIComponent(parentId)}`);

  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"" | "published" | "draft">("");
  const [sortBy, setSortBy] = useState<"updatedAt" | "createdAt" | "title" | "viewCount">("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [allTags, setAllTags] = useState<{ tag: string; count: number }[]>([]);
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());

  const hasActiveFilters = tagFilter !== null || statusFilter !== "" || search.trim() !== "";

  const clearFilters = () => {
    setTagFilter(null);
    setStatusFilter("");
    setSearch("");
    setPage(1);
  };

  const fetchArticles = useCallback(() => {
    setLoading(true);
    if (!session) {
      const params = new URLSearchParams();
      params.set("status", "published");
      if (search) params.set("search", search);
      if (tagFilter) params.set("tag", tagFilter);
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);
      params.set("page", String(page));
      fetch(`/api/wiki?${params.toString()}`, { credentials: "include" })
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => {
          const fromApi = Array.isArray(data) ? data : [];
          const guest = getGuestWikiArticles();
          const guestSlugs = new Set(guest.map((a) => a.slug));
          const fromApiFiltered = fromApi.filter((a: { slug: string }) => !guestSlugs.has(a.slug));
          setArticles([...guest, ...fromApiFiltered]);
        })
        .catch(() => setArticles(getGuestWikiArticles()))
        .finally(() => setLoading(false));
      return;
    }
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (tagFilter) params.set("tag", tagFilter);
    if (statusFilter) params.set("status", statusFilter);
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    params.set("page", String(page));
    const url = `/api/wiki?${params.toString()}`;
    fetch(url, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setArticles(Array.isArray(data) ? data : []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [search, tagFilter, statusFilter, sortBy, sortOrder, page, session]);

  useEffect(() => {
    fetch("/api/wiki/tags", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setAllTags(Array.isArray(data) ? data : []))
      .catch(() => setAllTags([]));
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const toggleSelect = (slug: string) => {
    setSelectedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const handleDelete = async (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Supprimer cet article ?")) return;
    if (!session) {
      if (deleteGuestArticle(slug)) setArticles((prev) => prev.filter((a) => a.slug !== slug));
      return;
    }
    const res = await fetch(`/api/wiki/${encodeURIComponent(slug)}`, { method: "DELETE", credentials: "include" });
    if (res.ok) setArticles((prev) => prev.filter((a) => a.slug !== slug));
  };

  const filteredArticles = session
    ? articles
    : search.trim() || tagFilter
      ? articles.filter((a) => {
          const matchSearch = !search.trim() || a.title.toLowerCase().includes(search.toLowerCase()) || a.slug.toLowerCase().includes(search.toLowerCase()) || (a.content && a.content.toLowerCase().includes(search.toLowerCase()));
          const matchTag = !tagFilter || (Array.isArray(a.tags) && a.tags.includes(tagFilter));
          return matchSearch && matchTag;
        })
      : articles;
  const tree = buildTree(filteredArticles);
  const displayed = filteredArticles
    .filter((a) => a.parentId === selectedParent)
    .sort((a, b) => {
      const pinnedA = (a as { pinned?: boolean }).pinned ? 1 : 0;
      const pinnedB = (b as { pinned?: boolean }).pinned ? 1 : 0;
      if (pinnedB !== pinnedA) return pinnedB - pinnedA;
      return new Date((b as { updatedAt?: string }).updatedAt ?? b.updatedAt).getTime() - new Date((a as { updatedAt?: string }).updatedAt ?? a.updatedAt).getTime();
    });
  const noResultsForFilters = hasActiveFilters && (session ? articles.length === 0 : filteredArticles.length === 0);

  const toggleSelectAllDisplayed = () => {
    const displayedSlugs = new Set(displayed.map((a) => a.slug));
    const allSelected = displayed.every((a) => selectedSlugs.has(a.slug));
    setSelectedSlugs((prev) => {
      const next = new Set(prev);
      if (allSelected) displayedSlugs.forEach((s) => next.delete(s));
      else displayedSlugs.forEach((s) => next.add(s));
      return next;
    });
  };

  const exportSelectionZip = () => {
    const slugs = Array.from(selectedSlugs);
    if (slugs.length === 0) return;
    const url = `/api/wiki/export/zip?slugs=${encodeURIComponent(slugs.join(","))}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = `wiki-export-${new Date().toISOString().slice(0, 10)}.zip`;
    a.click();
  };

  return (
    <div className="wiki-page doc-page">
      <div className="wiki-sticky-header">
        <div id="documentation" className="doc-page-header">
          <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → Wiki</div>
          <h1>Wiki</h1>
          <p className="doc-description">
            Wiki interne : articles en Markdown, arborescence, brouillons et publication. Idéal pour la doc d&apos;équipe.
          </p>
          <div className="doc-meta">
            <span className="doc-badge doc-badge-category">Module</span>
          </div>
        </div>
        <div className="wiki-header">
        <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--bpm-text-primary)" }}>Articles</h2>
        <Link href="/modules/wiki/new" className="btn-primary">
          + Nouvel article
        </Link>
      </div>
      <div className="wiki-search flex flex-wrap items-center gap-2 mb-2">
        <input
          type="search"
          placeholder="Rechercher (titre, contenu, tags)..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 min-w-[200px]"
        />
        {session && (
          <>
            <span className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>Statut :</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value as "" | "published" | "draft"); setPage(1); }}
              className="text-sm px-2 py-1 rounded border"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
            >
              <option value="">Tous</option>
              <option value="published">Publié</option>
              <option value="draft">Brouillon</option>
            </select>
            <span className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>Tri :</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="text-sm px-2 py-1 rounded border"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
            >
              <option value="updatedAt">Date MàJ</option>
              <option value="createdAt">Date création</option>
              <option value="title">Titre A-Z</option>
              <option value="viewCount">Vues</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              className="text-sm px-2 py-1 rounded border"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-surface)", color: "var(--bpm-text-primary)" }}
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </>
        )}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1 items-center">
            <span className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>Tag :</span>
            <button
              type="button"
              onClick={() => setTagFilter(null)}
              className={`text-xs px-2 py-1 rounded ${tagFilter === null ? "opacity-100 font-medium" : "opacity-70"}`}
              style={{ background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-primary)" }}
            >
              Tous
            </button>
            {allTags.slice(0, 12).map(({ tag }) => (
              <button
                key={tag}
                type="button"
                onClick={() => { setTagFilter(tagFilter === tag ? null : tag); setPage(1); }}
                className={`text-xs px-2 py-1 rounded ${tagFilter === tag ? "opacity-100 font-medium" : "opacity-70"}`}
                style={{
                  background: tagFilter === tag ? "var(--bpm-accent-cyan)" : "var(--bpm-bg-secondary)",
                  color: tagFilter === tag ? "#fff" : "var(--bpm-text-primary)",
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
        </div>
      </div>
      {loading ? (
        <div className="wiki-loading flex flex-col gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="wiki-card flex flex-col gap-2 p-4 rounded border animate-pulse" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}>
              <div className="h-5 w-3/4 rounded bg-[var(--bpm-border)]" />
              <div className="h-4 w-full rounded bg-[var(--bpm-border)]" />
              <div className="h-4 w-1/2 rounded bg-[var(--bpm-border)]" />
            </div>
          ))}
        </div>
      ) : articles.length === 0 && !hasActiveFilters ? (
        <div className="wiki-empty text-center py-12">
          <p className="text-lg" style={{ color: "var(--bpm-text-primary)" }}>Votre wiki est vide.</p>
          <Link href="/modules/wiki/new" className="inline-block mt-4">
            <Button size="small">Créer le premier article</Button>
          </Link>
        </div>
      ) : noResultsForFilters ? (
        <div className="wiki-empty text-center py-12">
          <p className="text-lg" style={{ color: "var(--bpm-text-primary)" }}>Aucun article pour ces filtres.</p>
          <Button type="button" variant="outline" size="small" onClick={clearFilters} className="mt-4">
            Effacer les filtres
          </Button>
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
              <TreeNode
                key={node.id}
                node={node}
                selectedParent={selectedParent}
                expandedIds={expandedIds}
                onToggle={onToggle}
                onSelect={setSelectedParent}
                onOpenArticle={openArticle}
                onAddChild={onAddChild}
              />
            ))}
          </aside>
          <main className="wiki-content">
            {displayed.length === 0 ? (
              <p>Aucun article dans cette section.</p>
            ) : (
              <>
                {selectedSlugs.size > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mb-3 p-2 rounded border" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}>
                    <span className="text-sm" style={{ color: "var(--bpm-text-primary)" }}>
                      {selectedSlugs.size} article{selectedSlugs.size > 1 ? "s" : ""} sélectionné{selectedSlugs.size > 1 ? "s" : ""}
                    </span>
                    <Button type="button" size="small" onClick={exportSelectionZip}>
                      Exporter en ZIP
                    </Button>
                    <button
                      type="button"
                      className="text-sm underline"
                      style={{ color: "var(--bpm-text-secondary)" }}
                      onClick={() => setSelectedSlugs(new Set())}
                    >
                      Tout désélectionner
                    </button>
                  </div>
                )}
                <div className="wiki-article-list">
                {displayed.map((article) => {
                  const a = article as WikiArticle & { excerpt?: string; tags?: string[]; pinned?: boolean; wordCount?: number; readingTimeMinutes?: number; viewCount?: number; lastRevisedBy?: string };
                  return (
                  <div key={article.id} className="wiki-card flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex items-start gap-2 min-w-0 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedSlugs.has(article.slug)}
                          onChange={() => toggleSelect(article.slug)}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Sélectionner ${article.title}`}
                          className="mt-1 flex-shrink-0"
                        />
                      <Link href={`/modules/wiki/${article.slug}`} className="min-w-0 flex-1 no-underline block" style={{ color: "inherit" }}>
                        <h3 className="flex items-center gap-2 flex-wrap">
                          {article.title}
                          {a.pinned && (
                            <span className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--bpm-accent)", color: "#fff" }}>Épinglé</span>
                          )}
                          {!article.isPublished ? (
                            <Badge variant="warning" className="text-xs">Brouillon</Badge>
                          ) : (
                            <Badge variant="success" className="text-xs">Publié</Badge>
                          )}
                        </h3>
                        {a.excerpt && (
                          <p className="text-sm mt-1 line-clamp-2" style={{ color: "var(--bpm-text-secondary)" }}>{a.excerpt}</p>
                        )}
                        <div className="wiki-card-meta flex flex-wrap items-center gap-2 mt-1">
                          <span>Mis à jour le {new Date(article.updatedAt).toLocaleDateString("fr-FR")}</span>
                          {article.author && <span> · {article.author.name ?? ""}</span>}
                          {a.readingTimeMinutes != null && <span> · {a.readingTimeMinutes} min</span>}
                          {a.viewCount != null && a.viewCount > 0 && <span> · {a.viewCount} vue{a.viewCount > 1 ? "s" : ""}</span>}
                          {Array.isArray(a.tags) && a.tags.length > 0 && (
                            <span className="flex gap-1 flex-wrap">
                              {a.tags.slice(0, 5).map((t) => (
                                <span key={t} className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--bpm-border)", color: "var(--bpm-text-secondary)" }}>{t}</span>
                              ))}
                            </span>
                          )}
                        </div>
                          </Link>
                      </div>
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
                );})}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  className="text-sm underline"
                  style={{ color: "var(--bpm-text-secondary)" }}
                  onClick={toggleSelectAllDisplayed}
                >
                  {displayed.every((a) => selectedSlugs.has(a.slug)) ? "Tout désélectionner" : "Tout sélectionner"} (cette page)
                </button>
              </div>
              </>
            )}
          </main>
        </div>
      )}
      <nav className="doc-pagination mt-8">
        <Link href="/modules/wiki/new" style={{ color: "var(--bpm-accent-cyan)" }}>Créer un article</Link>
        <Link href="/modules/wiki/search" style={{ color: "var(--bpm-accent-cyan)" }}>Recherche</Link>
        <Link href="/modules/wiki/tags" style={{ color: "var(--bpm-accent-cyan)" }}>Tags</Link>
        <Link href="/modules/wiki/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>Documentation</Link>
      </nav>
    </div>
  );
}
