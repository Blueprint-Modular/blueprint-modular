"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Panel, Button, Spinner, Badge, Metric } from "@/components/bpm";
import { FicheHeader, FicheSectionCard, FicheNav, FicheSkeleton } from "@/components/fiche";

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
    return <FicheSkeleton sections={1} withMetrics />;
  }

  if (!article) {
    return (
      <div className="doc-page">
        <Panel variant="warning" title="Article introuvable">Cet article n&apos;existe pas ou vous n&apos;y avez pas accès.</Panel>
        <FicheNav backLink={`/modules/asset-manager/${domainId}/knowledge`} backLabel="← Connaissances" />
      </div>
    );
  }

  return (
    <div className="doc-page">
      <FicheHeader
        breadcrumb={
          <>
            <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>Modules</Link> →{" "}
            <Link href="/modules/asset-manager" style={{ color: "var(--bpm-accent-cyan)" }}>Gestion de parc</Link> →{" "}
            <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>Tableau de bord</Link> →{" "}
            <Link href={`/modules/asset-manager/${domainId}/knowledge`} style={{ color: "var(--bpm-accent-cyan)" }}>Connaissances</Link> → {article.title}
          </>
        }
        title={article.title}
        subtitle={
          <>
            <Badge variant="default">{CATEGORY_LABELS[article.categoryId] ?? article.categoryId}</Badge>
            {article.tags.length > 0 && article.tags.map((tag) => <Badge key={tag} variant="default">{tag}</Badge>)}
            {article.publishedAt && (
              <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
                Publié le {new Date(article.publishedAt).toLocaleDateString("fr-FR")}
              </span>
            )}
          </>
        }
      />
      <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
        <div className="flex flex-wrap gap-3">
          <Metric label="Vues" value={article.viewsCount} border={false} />
          <Metric label="Utile" value={article.helpfulCount} border={false} />
          <Metric label="Pas utile" value={article.notHelpfulCount} border={false} />
        </div>
        <Link href={`/modules/asset-manager/${domainId}/knowledge/${id}/edit`}>
          <Button size="small" variant="outline">Modifier</Button>
        </Link>
      </div>

      <FicheSectionCard title="Contenu" className="mt-4">
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
      </FicheSectionCard>

      <FicheNav
        backLink={`/modules/asset-manager/${domainId}/knowledge`}
        backLabel="← Connaissances"
        secondaryLinks={[{ href: `/modules/asset-manager/${domainId}`, label: "Tableau de bord" }]}
      />
    </div>
  );
}
