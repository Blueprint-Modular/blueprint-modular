"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button, Panel, Spinner } from "@/components/bpm";

interface Article {
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

export default function NewsletterArticlePage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : "";
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    fetch(`/api/newsletter/articles/${id}`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setArticle(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleArchive = async () => {
    if (!article || archiving) return;
    setArchiving(true);
    try {
      const res = await fetch(`/api/newsletter/articles/${id}/archive`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: !article.archived }),
        credentials: "include",
      });
      if (res.ok) {
        const updated = await res.json();
        setArticle(updated);
      }
    } finally {
      setArchiving(false);
    }
  };

  if (loading) {
    return (
      <div className="doc-page flex justify-center py-12">
        <Spinner size="medium" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="doc-page">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/newsletter">Newsletter</Link>
        </div>
        <Panel variant="info" title="Article introuvable">
          L’article demandé n’existe pas ou vous n’y avez pas accès.
        </Panel>
        <nav className="doc-pagination mt-8">
          <Link href="/modules/newsletter" style={{ color: "var(--bpm-accent-cyan)" }}>
            ← Retour à la Newsletter
          </Link>
        </nav>
      </div>
    );
  }

  const dateStr = article.publishedAt || article.createdAt;
  const formattedDate = dateStr
    ? new Date(dateStr).toLocaleDateString("fr-FR", { dateStyle: "long" })
    : "—";

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/newsletter">Newsletter</Link> → {article.title}
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>
          {article.title}
        </h1>
        <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
          {formattedDate}
          {article.archived && (
            <span
              className="ml-2 rounded px-2 py-0.5 text-xs font-medium"
              style={{ backgroundColor: "var(--bpm-text-secondary)", color: "var(--bpm-bg)" }}
            >
              Archivé
            </span>
          )}
        </p>
      </div>

      {article.excerpt && (
        <p className="mb-6 text-lg" style={{ color: "var(--bpm-text-secondary)" }}>
          {article.excerpt}
        </p>
      )}

      <Panel variant="default" title="">
        <div
          className="prose max-w-none whitespace-pre-wrap"
          style={{ color: "var(--bpm-text-primary)" }}
        >
          {article.content || "Aucun contenu."}
        </div>
      </Panel>

      <div className="flex flex-wrap gap-2 mt-6">
        <Button variant="primary" onClick={() => router.push(`/modules/newsletter/${id}/edit`)}>
          Modifier
        </Button>
        <Button variant="secondary" disabled={archiving} onClick={handleArchive}>
          {archiving ? "…" : article.archived ? "Désarchiver" : "Archiver"}
        </Button>
        <Link href="/modules/newsletter">
          <Button variant="secondary">Liste des articles</Button>
        </Link>
      </div>

      <nav className="doc-pagination mt-8">
        <Link href="/modules/newsletter" style={{ color: "var(--bpm-accent-cyan)" }}>
          ← Retour à la Newsletter
        </Link>
      </nav>
    </div>
  );
}
