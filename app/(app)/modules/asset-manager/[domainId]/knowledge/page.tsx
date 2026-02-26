"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Table, Spinner, Panel, Button, Selectbox } from "@/components/bpm";

type KnowledgeArticle = {
  id: string;
  title: string;
  slug: string;
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

export default function AssetManagerKnowledgePage() {
  const params = useParams();
  const router = useRouter();
  const domainId = typeof params?.domainId === "string" ? params.domainId : "";
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [config, setConfig] = useState<{ domain_label?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("");

  useEffect(() => {
    if (!domainId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const url = `/api/asset-manager/knowledge?domainId=${encodeURIComponent(domainId)}${filterCategory ? `&categoryId=${encodeURIComponent(filterCategory)}` : ""}`;
    Promise.all([
      fetch(`/api/asset-manager/config/${domainId}`, { credentials: "include" }).then((r) => (r.ok ? r.json() : null)),
      fetch(url, { credentials: "include" }).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([cfg, data]) => {
        setConfig(cfg);
        setArticles(Array.isArray(data) ? data : []);
      })
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [domainId, filterCategory]);

  const columns = [
    { key: "title", label: "Titre" },
    {
      key: "categoryId",
      label: "Catégorie",
      render: (val: unknown) => CATEGORY_LABELS[String(val)] ?? String(val),
    },
    {
      key: "tags",
      label: "Tags",
      render: (val: unknown) => (Array.isArray(val) ? (val as string[]).join(", ") : "—"),
    },
    {
      key: "visibility",
      label: "Visibilité",
      render: (val: unknown) => (String(val) === "public" ? "Public" : "Techniciens"),
    },
    {
      key: "publishedAt",
      label: "Publié le",
      render: (val: unknown) => (val ? new Date(String(val)).toLocaleDateString("fr-FR") : "Brouillon"),
    },
    {
      key: "viewsCount",
      label: "Vues",
      render: (val: unknown) => String(val ?? 0),
    },
  ];

  const categoryOptions = [
    { value: "", label: "Toutes catégories" },
    ...Object.entries(CATEGORY_LABELS).map(([id, label]) => ({ value: id, label })),
  ];

  if (!config && !loading) {
    return (
      <div className="doc-page">
        <Panel variant="warning" title="Domaine inconnu">Vérifiez l&apos;URL.</Panel>
        <Link href="/modules/asset-manager" style={{ color: "var(--bpm-accent-cyan)" }}>← Gestion d&apos;actifs</Link>
      </div>
    );
  }

  return (
    <div className="doc-page">
      <div className="doc-page-header mb-6">
        <nav className="doc-breadcrumb">
          <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>Modules</Link> →{" "}
          <Link href="/modules/asset-manager" style={{ color: "var(--bpm-accent-cyan)" }}>Gestion d&apos;actifs</Link> →{" "}
          <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>Tableau de bord</Link> → Base de connaissances
        </nav>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>Base de connaissances</h1>
            <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
              Articles et procédures pour le support et la maintenance.
            </p>
          </div>
          <Link href={`/modules/asset-manager/${domainId}/knowledge/new`}>
            <Button size="small">+ Nouvel article</Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <Selectbox
          label="Catégorie"
          value={filterCategory}
          onChange={(v) => setFilterCategory(String(v))}
          options={categoryOptions}
          placeholder="Toutes"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="medium" />
        </div>
      ) : (
        <Panel variant="info" title={`${articles.length} article(s)`}>
          {articles.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>Aucun article. Créez-en un avec « Nouvel article ».</p>
          ) : (
            <Table
              columns={columns}
              data={articles}
              keyColumn="id"
              onRowClick={(row) => router.push(`/modules/asset-manager/${domainId}/knowledge/${(row as KnowledgeArticle).id}`)}
            />
          )}
        </Panel>
      )}

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href={`/modules/asset-manager/${domainId}`} style={{ color: "var(--bpm-accent-cyan)" }}>← Tableau de bord</Link>
        <Link href="/modules/asset-manager/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>Documentation</Link>
      </nav>
    </div>
  );
}
