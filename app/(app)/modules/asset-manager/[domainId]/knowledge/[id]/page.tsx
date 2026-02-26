"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Panel, Button, Spinner } from "@/components/bpm";

type KnowledgeArticle = {
  id: string;
  title: string;
  slug: string;
  content: string;
  categoryId: string;
  assetTypeId: string | null;
  tags: string[];
  visibility: string;
  publishedAt: string | null;
  viewsCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  createdAt: string;
  updatedAt: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  procedure: "Procédure",
  faq: "FAQ",
  guide: "Guide",
  reference: "Référence",
  troubleshooting: "Dépannage",
};

export default function AssetManagerKnowledgeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const id = typeof params?.id === "string" ? params.id : "";
  const [article, setArticle] = useState<KnowledgeArticle | null>(null);
  const [config, setConfig] = useState<{ asset_types?: { id: string; label: string }[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!domainId || !id) return;
    Promise.all([
      fetch(`/api/asset-manager/config/${domainId}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/asset-manager/knowledge/${id}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([cfg, a]) => {
        setConfig(cfg);
        setArticle(a);
      })
      .finally(() => setLoading(false));
  }, [domainId, id]);

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
        <Panel variant="warning" title="Article introuvable">Cet article n&apos;existe pas ou vous n&apos;y avez pas accès.</Panel>
        <nav className="doc-pagination mt-6">
          <Link href={`/modules/asset-manager/${domainId}/knowledge`} style={{ color: "var(--bpm-accent-cyan)" }}>← Base de connaissances</Link>
        </nav>
      </div>
    );
  }

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <nav className="doc-breadcrumb">
          <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>Modules</Link> →{" "}
          <Link href="/modules/asset-manager" style={{ color: "var(--bpm-accent-cyan)" }}>Gestion d&apos;actifs</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>Tableau de bord</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}/knowledge`} style={{ color: "var(--bpm-accent-cyan)" }}>Base de connaissances</Link> → {article.title}
        </nav>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>{article.title}</h1>
          <Link href={`/modules/asset-manager/${domainId}/knowledge/${id}/edit`}>
            <Button size="small" variant="outline">Modifier</Button>
          </Link>
        </div>
        <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
          {CATEGORY_LABELS[article.categoryId] ?? article.categoryId}
          {article.tags.length > 0 && ` · ${article.tags.join(", ")}`}
          {article.publishedAt && ` · Publié le ${new Date(article.publishedAt).toLocaleDateString("fr-FR")}`}
        </p>
      </div>

      <Panel variant="info" title="Contenu">
        <div
          className="prose prose-sm max-w-none"
          style={{ color: "var(--bpm-text-primary)" }}
          dangerouslySetInnerHTML={{
            __html: article.content
              .replace(/\n/g, "<br />")
              .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
              .replace(/\*(.+?)\*/g, "<em>$1</em>")
              .replace(/^## (.+)$/gm, "<h2 class='text-lg font-semibold mt-4 mb-2'>$1</h2>")
              .replace(/^# (.+)$/gm, "<h1 class='text-xl font-bold mt-2 mb-2'>$1</h1>"),
          }}
        />
      </Panel>

      <div className="flex flex-wrap gap-2 mt-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <span>Vues : {article.viewsCount}</span>
        <span>Utile : {article.helpfulCount}</span>
        <span>Pas utile : {article.notHelpfulCount}</span>
      </div>

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href={`/modules/asset-manager/${domainId}/knowledge`} style={{ color: "var(--bpm-accent-cyan)" }}>← Base de connaissances</Link>
        <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>Tableau de bord</Link>
      </nav>
    </div>
  );
}
