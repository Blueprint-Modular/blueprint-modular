"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Table, Spinner, Panel, Button, Selectbox } from "@/components/bpm";

interface NewsletterArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  publishedAt: string | null;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  author?: { name: string | null; email: string | null };
}

const FILTER_OPTIONS = [
  { value: "false", label: "Actifs (non archivés)" },
  { value: "true", label: "Archivés" },
  { value: "", label: "Tous" },
];

export default function NewsletterPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<NewsletterArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [archivedFilter, setArchivedFilter] = useState("");
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchArticles = useCallback(() => {
    const params = new URLSearchParams();
    if (archivedFilter !== "") params.set("archived", archivedFilter);
    fetch(`/api/newsletter/articles?${params}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setArticles(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setArticles([]);
        setLoading(false);
      });
  }, [archivedFilter]);

  useEffect(() => {
    setLoading(true);
    fetchArticles();
  }, [fetchArticles]);

  const handleArchive = async (id: string, currentArchived: boolean) => {
    if (archivingId) return;
    setArchivingId(id);
    try {
      const res = await fetch(`/api/newsletter/articles/${id}/archive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: !currentArchived }),
        credentials: "include",
      });
      if (res.ok) fetchArticles();
    } finally {
      setArchivingId(null);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (deletingId) return;
    if (!confirm(`Supprimer l'article « ${title} » ? Cette action est irréversible.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/newsletter/articles/${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) setArticles((prev) => prev.filter((a) => a.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    { key: "title", label: "Titre" },
    {
      key: "publishedAt",
      label: "Date de publication",
      render: (val: unknown, row: Record<string, unknown>) => {
        const d = row.publishedAt ?? row.createdAt;
        if (!d) return "—";
        try {
          return new Date(String(d)).toLocaleDateString("fr-FR", { dateStyle: "short" });
        } catch {
          return String(d);
        }
      },
    },
    {
      key: "archived",
      label: "Statut",
      render: (val: unknown) => {
        const archived = val === true;
        return (
          <span
            className="rounded px-2 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: archived ? "var(--bpm-text-secondary)" : "var(--bpm-accent-mint)",
              color: "var(--bpm-bg)",
            }}
          >
            {archived ? "Archivé" : "Actif"}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: unknown, row: Record<string, unknown>) => {
        const id = row.id as string;
        const title = row.title as string;
        const archived = row.archived === true;
        const isArchiving = archivingId === id;
        const isDeleting = deletingId === id;
        return (
          <span className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
            <Button size="small" variant="secondary" onClick={() => router.push(`/modules/newsletter/${id}`)}>
              Voir
            </Button>
            <Button size="small" variant="secondary" onClick={() => router.push(`/modules/newsletter/${id}/edit`)}>
              Modifier
            </Button>
            <Button
              size="small"
              variant="secondary"
              disabled={!!archivingId}
              onClick={() => handleArchive(id, archived)}
            >
              {isArchiving ? "…" : archived ? "Désarchiver" : "Archiver"}
            </Button>
            <Button
              size="small"
              variant="secondary"
              disabled={!!deletingId}
              onClick={() => handleDelete(id, title)}
            >
              {isDeleting ? "…" : "Supprimer"}
            </Button>
          </span>
        );
      },
    },
  ];

  const data = articles.map((a) => ({
    id: a.id,
    title: a.title,
    publishedAt: a.publishedAt,
    createdAt: a.createdAt,
    archived: a.archived,
  }));

  return (
    <div className="doc-page newsletter-page">
      <div className="doc-page-header mb-6">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → Newsletter
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
          Newsletter
        </h1>
        <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
          Gérez la photo de header, créez des articles et archivez les numéros. Consultez la liste et cliquez sur une ligne pour ouvrir l&apos;article.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Link href="/modules/newsletter/parametres">
          <Button variant="secondary">Photo de header</Button>
        </Link>
        <Link href="/modules/newsletter/nouveau">
          <Button variant="primary">Nouvel article</Button>
        </Link>
        <Selectbox
          options={FILTER_OPTIONS}
          value={archivedFilter}
          onChange={(v) => setArchivedFilter(v ?? "")}
          placeholder="Filtrer par statut"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="medium" />
        </div>
      ) : articles.length === 0 ? (
        <Panel variant="info" title="Aucun article">
          Créez un article avec le bouton <strong>Nouvel article</strong> ou configurez la photo de header dans <strong>Photo de header</strong>.
        </Panel>
      ) : (
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--bpm-border)" }}>
          <Table
            columns={columns}
            data={data}
            onRowClick={(row) => {
              const id = (row as { id?: string }).id;
              if (id) router.push(`/modules/newsletter/${id}`);
            }}
          />
        </div>
      )}

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>
          ← Retour aux modules
        </Link>
        <Link href="/modules/newsletter/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>
          Documentation
        </Link>
      </nav>
    </div>
  );
}
